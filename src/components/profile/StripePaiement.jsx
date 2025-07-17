import React, { useState } from 'react';
import Button from "../../components/ui/Button";
import { RefreshCw, CheckCircle } from "lucide-react";
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'react-router-dom';

const StripePaiement = ({ stripeAccountId }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();

  const handleStripeOnboarding = async () => {
    setLoading(true);
    setMessage('');
    try {
      const token = await getAccessTokenSilently();

      // Étape 1 : Créer le compte Stripe si nécessaire
      await fetch(`${import.meta.env.VITE_API_URL}/stripe/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      // Étape 2 : Rafraîchir les données utilisateur (optionnel selon ton architecture)
      if (typeof window.refreshUserData === 'function') {
        await window.refreshUserData();
      }

      // Étape 3 : Obtenir le lien d'onboarding
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ redirectPath: location.pathname }),
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setLoading(false);
        setMessage(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error('Erreur onboarding Stripe :', err);
      setLoading(false);
      setMessage('Impossible de contacter le serveur.');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-neutral-800">
          {stripeAccountId ? (
            <span className="text-emerald-600">Paiement activé avec Stripe</span>
          ) : loading ? (
            <span className="text-neutral-600">Redirection vers Stripe...</span>
          ) : (
            <span className="text-neutral-600">Activer les paiements avec Stripe</span>
          )}
        </div>  

        <button
          onClick={handleStripeOnboarding}
          disabled={loading || stripeAccountId}
          className={`transition p-2 rounded-full ${
            stripeAccountId
              ? "bg-green-100 text-green-600"
              : "bg-blue-100 hover:bg-blue-200 text-indigo-600"
          }`}
        >
          {stripeAccountId ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          )}
        </button>
      </div>

      {message && <div className="text-red-600 mt-2 px-4">{message}</div>}
    </div>
  );
};

export default StripePaiement;