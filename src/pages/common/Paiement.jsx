// src/common/Paiement.jsx
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../../components/client/CheckoutForm";
import useUserStore from "../../stores/userStore";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_SECRET_KEY);

export default function PaiementPage() {
  const { token, userData } = useUserStore();
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user: {
              email: userData.email,
              sub: userData.sub,
              deliveryAddress: userData.infosClient?.adresseComplete || "",
              deliveryLocation: {
                lat: userData.infosClient?.latitude,
                lng: userData.infosClient?.longitude,
              },
            },
          }),
        });
        const data = await res.json();
        if (res.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error("ClientSecret manquant ou invalide");
        }
      } catch (err) {
        console.error("Erreur récupération clientSecret:", err);
      }
    };

    fetchClientSecret();
  }, [token, userData]);

  if (!clientSecret) return <p>Chargement du paiement...</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="max-w-md mx-auto mt-10 p-4 shadow-lg rounded-xl border">
        <h2 className="text-xl font-bold mb-4">Paiement sécurisé</h2>
        <CheckoutForm clientSecret={clientSecret} user={userData} />
      </div>
    </Elements>
  );
}
