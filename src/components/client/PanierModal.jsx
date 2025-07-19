import React, { useEffect, useRef, useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useCartStore from "../../stores/cartStore";
import useUserStore from "../../stores/userStore";

const estimateDelivery = async (cart, token, setDeliveryFee, setLoadingFee, setDeliveryFeesPerBoutique, setRecommendedVehicles, setParticipationsPerBoutique) => {
  if (!cart.length || !token) {
    setDeliveryFee(null);
    setDeliveryFeesPerBoutique({});
    setRecommendedVehicles({});
    setParticipationsPerBoutique({});
    return;
  }

  setLoadingFee(true);
  try {
    const body = {
      cart: cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
      })),
    };

    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/estimate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erreur serveur");

    setDeliveryFeesPerBoutique(data.fraisParBoutique || {});
    setRecommendedVehicles(data.vehiculesRecommandes || {});
    setParticipationsPerBoutique(data.participationsParBoutique || {});
    setDeliveryFee(data.totalFinal || 0);
  } catch (err) {
    console.error("Erreur estimation livraison :", err);
    alert("Erreur pendant l’estimation de livraison. Veuillez réessayer.");
    setDeliveryFee(null);
    setDeliveryFeesPerBoutique({});
    setRecommendedVehicles({});
    setParticipationsPerBoutique({});
  } finally {
    setLoadingFee(false);
  }
};

const updateRandomMessage = (el) => {
  el.style.opacity = 0;
  setTimeout(() => {
    const newMsg = messages[Math.floor(Math.random() * messages.length)];
    el.innerText = newMsg;
    el.style.opacity = 1;
  }, 200);
};

export default function PanierModal({ onClose }) {
  const { token, userData } = useUserStore();
  const { cart, removeFromCart, placeOrder, addToCart } = useCartStore();
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [deliveryFeesPerBoutique, setDeliveryFeesPerBoutique] = useState({});
  const [recommendedVehicles, setRecommendedVehicles] = useState({});
  const [participationsPerBoutique, setParticipationsPerBoutique] = useState({});
  const modalRef = useRef();
  const navigate = useNavigate();


  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
  };


  useEffect(() => {
    estimateDelivery(cart, token, setDeliveryFee, setLoadingFee, setDeliveryFeesPerBoutique, setRecommendedVehicles, setParticipationsPerBoutique);
  }, [cart, token]);

  useEffect(() => {
    const el = document.getElementById("panier-message");
    if (!el) return;
    updateRandomMessage(el);
    const interval = setInterval(() => updateRandomMessage(el), 5000);
    return () => clearInterval(interval);
  }, []);

    const handleOrder = async () => {
    try {
      const cartToSend = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity,
        prix: item.product.price, // 👈 obligatoire pour Stripe
        nom: item.product.name,   // 👈 utile pour affichage produit Stripe
        boutiqueId: item.product.boutique, // ✅ AJOUTÉ
        livraison: deliveryFeesPerBoutique[item.product.boutique] || 0,
        participation: participationsPerBoutique[item.product.boutique] || 0,
        livreurStripeId: item.product.boutiqueDetails?.livreurStripeId || "",
        merchant: item.merchant || ""
      }));

      const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          cart: cartToSend,
          user: {
            email: userData.email,
            sub: userData.sub,
            deliveryAddress: userData.infosClient?.adresseComplete || "",
            deliveryLocation: {
              lat: userData.infosClient?.latitude,
              lng: userData.infosClient?.longitude,
            },
          }
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        alert("Erreur lors de la création de la session de paiement.");
        return;
      }

      placeOrder(cart, {
        deliveryFeesPerBoutique,
        participationsPerBoutique,
        totalLivraison: deliveryFee
      });

      window.location.href = data.url;
    } catch (err) {
      console.error("Erreur Stripe :", err);
      alert("Une erreur est survenue pendant la commande.");
    } finally {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-screen-sm md:max-w-screen-md bg-white rounded-t-2xl px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl animate-slide-up max-h-[75vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Votre panier</h3>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-12">Votre panier est vide.</div>
        ) : (
          <>
            <div className="space-y-3 overflow-y-auto flex-1">
              {cart.map(({ product, merchant, quantity }) => (
                <div key={`${product._id}-${product.boutique._id}-${merchant}`} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-lg object-cover" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        chez{" "}
                        <Link
                          to={`/vitrine/${product.boutique}`}
                          className="text-[#ed354f] underline hover:text-[#d02d45] transition"
                          onClick={onClose}
                        >
                          {merchant}
                        </Link>
                      </p>
                      <span className="text-sm font-semibold text-[#ed354f] mt-1">
                        {(product.price * quantity).toFixed(2)} €
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-3">
                    <div className="flex items-center gap-2 border rounded-full px-2 py-1">
                      <button onClick={() => removeFromCart({ product, merchant })}>
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-medium">{quantity}</span>
                      <button onClick={() => addToCart({ product, merchant })}>
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              {Object.entries(deliveryFeesPerBoutique).map(([id, fee]) => {
                const boutiqueName = cart.find(item => item.product.boutique === id)?.merchant || "Boutique";
                return (
                  <div key={id} className="flex flex-col text-sm text-gray-600 mb-1">
                    <div className="flex justify-between">
                      <span>
                        Livraison {boutiqueName}
                        {recommendedVehicles[id] ? ` (${recommendedVehicles[id]})` : ""}
                      </span>
                      <span>{fee.toFixed(2)} €</span>
                    </div>
                    {participationsPerBoutique[id] > 0 && (
                      <div className="flex justify-between items-center text-xs text-green-700 -mt-1 mb-2">
                        <span className="italic">Participation boutique</span>
                        <span className="font-medium">- {participationsPerBoutique[id].toFixed(2)} €</span>
                      </div>
                    )}
                  </div>
                );
              })}
              {deliveryFee === null && (
                <div className="text-sm text-red-500 mb-2">
                  Impossible d’estimer les frais de livraison pour cette commande.
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600 mb-2">
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800">Total</span>
                <span className="text-base font-bold text-[#ed354f]">{deliveryFee?.toFixed(2)} €</span>
              </div>
              <p id="panier-message" className="text-xs text-gray-500 text-right mt-1 transition-opacity duration-500">
                Commande simple, livraison fluide.
              </p>
              <button
                onClick={handleOrder}
                className="bg-[#ed354f] text-white rounded-full py-3 font-semibold text-lg w-full mt-6"
              >
                Commander
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const messages = [
  "Tu commandes, on prépare, ça arrive vite.",
  "Tout est prêt, tu fais le dernier geste.",
  "Paiement serein, livraison express.",
  "Chaque clic soutient une vraie boutique.",
  "Chez toi en moins d’une heure, sans effort.",
  "Commande maintenant, reçois sans attendre.",
  "Tu gagnes du temps et tu fais du bien.",
  "Ton livreur roule pour toi, payé à 100%.",
  "Chaque course rémunère justement ton livreur.",
  "Tu choisis une livraison juste, locale et rapide.",
  "Ton geste valorise l’économie de ton quartier.",
  "Ta commande fait tourner la vie locale.",
  "Merci d’agir pour les commerçants d’ici.",
  "Riveltime t’accompagne, tu profites de l’instant.",
];