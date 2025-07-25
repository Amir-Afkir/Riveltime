import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "../../stores/userStore";
import stripePromise from "../../hooks/stripe";
import { Elements } from "@stripe/react-stripe-js";
import YourCheckoutForm from "../../components/client/YourCheckoutForm";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isSuccess = searchParams.get("success") === "true";

  const {
    clientSecret,
    produits,
    produitsTotal,
    deliveryFee,
    deliveryFeesPerBoutique,
    participationsPerBoutique,
    recommendedVehicles,
    boutiqueName,
    boutiquesById,
    paymentIntentIds, // ✅ Ajout ici
  } = location.state || {};

  // ⚠️ Protection si on accède à cette page sans state
    useEffect(() => {
    if (!clientSecret || !produits?.length) {
        navigate("/client/commandes");
    }
    }, [clientSecret, produits, navigate]);

    if (!clientSecret || !produits?.length) return null;

  return (
    <div className="p-6 max-w-xl mx-auto">
      {isSuccess && (
        <div className="mb-4 p-4 bg-green-100 text-green-800 rounded">
          ✅ Paiement validé ! Merci pour votre commande.
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-center">Confirmation de votre commande</h2>

      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Détails de la commande</h3>

        <ul className="space-y-2 mb-4">
          {produits.map((p, i) => (
            <li key={i} className="flex justify-between text-sm text-gray-700">
              <span>{p.name} x{p.quantity}</span>
              <span>{(p.price * p.quantity).toFixed(2)} €</span>
            </li>
          ))}
        </ul>

        <div className="border-t pt-3 space-y-3 text-sm text-gray-700">
          {Object.entries(deliveryFeesPerBoutique || {}).map(([id, fee]) => {
            const participation = participationsPerBoutique?.[id] || 0;
            const vehicle = recommendedVehicles?.[id];
            return (
              <div key={id} className="space-y-1">
                <div className="flex justify-between">
                  <span>Livraison {vehicle ? `(${vehicle})` : ""}</span>
                  <span>{fee.toFixed(2)} €</span>
                </div>
                {participation > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Participation {boutiquesById?.[id] || "Boutique"}</span>
                    <span>- {participation.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between font-semibold text-gray-900 pt-4 border-t mt-4">
          <span>Total à payer</span>
          <span>{deliveryFee?.toFixed(2)} €</span>
        </div>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <YourCheckoutForm paymentIntentIds={paymentIntentIds} />
      </Elements>
    </div>
  );
}