// src/pages/client/Checkout.jsx

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
    boutiqueName, // Gardez si utilisé pour l'affichage
    boutiquesById, // Gardez si utilisé pour l'affichage
    paymentIntentIds, // Gardez si utilisé pour l'affichage/débogage
    cart, // Récupérez le panier de location.state
  } = location.state || {};

  const { userData, loadingUser, fetchUser, restoreUserFromCache } = useUserStore();

useEffect(() => {
  restoreUserFromCache();
  if (!userData?._id && userData?.id) {
    userData._id = userData.id; // Patch compatibilité _id
  }
  console.log("🔁 restoreUserFromCache() appelée depuis Checkout.jsx");
}, []);

  useEffect(() => {
    if (!userData && !loadingUser) {
      console.log("🔄 Aucune donnée utilisateur détectée, tentative de récupération via fetchUser()...");
      fetchUser();
    } else if (userData?._id) {
      console.log("✅ Données utilisateur détectées :", userData);
    }
  }, [userData, loadingUser, fetchUser]);

  // --- Logs de Débogage ---
  console.log("--- Statut des Données de la Page Checkout ---");
  console.log("  clientSecret (disponible):", !!clientSecret);
  console.log("  produits (nombre):", produits?.length);
  console.log("  cart (nombre):", cart?.length);
  console.log("  userData (disponible):", !!userData);
  console.log("  userData._id (disponible):", userData?._id);
  console.log("  userData complet :", userData);
  console.log("  loadingUser (store):", loadingUser);
  console.log("----------------------------------------------");
  // --- Fin des Logs de Débogage ---

  // ⚠️ Protection si les données sont manquantes ou si l'utilisateur est en cours de chargement
  useEffect(() => {
    // Si l'utilisateur est toujours en cours de chargement, attendez
    if (loadingUser) {
      console.log("Attente du chargement des données utilisateur...");
      return; // Ne redirigez pas encore
    }

    // Une fois que l'utilisateur a fini de charger (loadingUser est false), vérifiez les conditions
    if (!clientSecret || !produits?.length || !cart?.length || !userData?._id) {
      console.warn("⛔ Données manquantes pour valider la commande :", {
        clientSecretOk: !!clientSecret,
        produitsOk: produits?.length > 0,
        cartOk: cart?.length > 0,
        utilisateurOk: !!userData?._id,
        loadingUser,
        userDataPreview: userData,
      });
      navigate("/client/commandes");
    }
  }, [clientSecret, produits, cart, userData, loadingUser, navigate]); // Ajoutez loadingUser aux dépendances

  // Rendu conditionnel : Ne rien afficher tant que les données ne sont pas prêtes
  // Cela gère le premier rendu où les données pourraient manquer.
  if (loadingUser) {
    return (
      <div className="text-center py-10 text-gray-500">
        Chargement de vos informations...
      </div>
    );
  }

  if (!clientSecret || !produits?.length || !cart?.length || !userData?._id) {
    return (
      <div className="text-center py-10 text-red-500">
        Impossible de valider la commande : données manquantes.
      </div>
    );
  }

  console.log("🧾 userId transmis à YourCheckoutForm :", userData?._id);

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
                  <span>Livraison {boutiquesById?.[id] || "Boutique"} {vehicle ? `(${vehicle})` : ""}</span>
                  <span>{fee.toFixed(2)} €</span>
                </div>
                {participation > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Participation</span>
                    <span>- {participation.toFixed(2)} €</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-between font-semibold text-gray-900 pt-4 border-t mt-4">
          <span>Total à payer</span>
          {/* <pre className="text-xs text-gray-400">{JSON.stringify(userData, null, 2)}</pre> */}
          <span>{deliveryFee?.toFixed(2)} €</span>
        </div>
      </div>

      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <YourCheckoutForm
          cart={cart}
          paymentIntentIds={paymentIntentIds}
          userId={userData._id}
        />
      </Elements>
    </div>
  );
}