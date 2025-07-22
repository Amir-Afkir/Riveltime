import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import useUserStore from "../../stores/userStore";

export default function YourCheckoutForm({ paymentIntentIds }) {
  const stripe = useStripe();
  const elements = useElements();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { token } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {

        
      // 2. Création des commandes
      await Promise.all(paymentIntentIds.map(async (intentId) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/create`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentId: intentId }),
        });
        if (!res.ok) {
          const err = await res.json();
          console.error(`Erreur création commande pour ${intentId}`, err);
        }
      }));
    
    
      // 3. Paiement final avec Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/client/checkout?success=true`,
        },
      });
      if (error) {
        console.error(error);
        alert(error.message);
      }
    } catch (err) {
      console.error("Erreur dans handleSubmit :", err);
      alert(err.message || "Erreur lors du traitement du paiement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Paiement en cours…" : "Payer"}
      </button>
    </form>
  );
}