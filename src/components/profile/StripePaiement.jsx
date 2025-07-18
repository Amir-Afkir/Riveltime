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

      if (stripeAccountId) {
        // Si compte déjà créé, redirige vers la gestion Stripe
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stripe/manage`, {
          method: 'GET', // ✅ Corrigé
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
        } else {
          setLoading(false);
          setMessage(data.message || 'Erreur lors de la redirection Stripe.');
        }
        return;
      }

      // Sinon, créer le compte puis rediriger vers l'onboarding
      await fetch(`${import.meta.env.VITE_API_URL}/stripe/create-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      });

      if (typeof window.refreshUserData === 'function') {
        await window.refreshUserData();
      }

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
  <div>
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      {stripeAccountId ? (
        <button
          onClick={handleStripeOnboarding}
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 border border-green-300 rounded-full px-5 py-2 shadow-sm bg-white hover:bg-green-50 transition focus:outline-none focus-visible:ring focus-visible:ring-green-300"
          aria-label="Gérer mon compte Stripe" 
        >
          <CheckCircle className="w-4 h-4 text-green-600" />
          Gérer mon compte Stripe
        </button>
      ) : loading ? (
        <button
          disabled
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-300 rounded-full px-5 py-2 shadow-sm bg-white opacity-60 cursor-not-allowed"
          aria-label="Chargement Stripe"
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Connexion...</span>
        </button>
      ) : (
        <button
          onClick={handleStripeOnboarding}
          disabled={loading}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 border border-blue-300 rounded-full px-5 py-2 shadow-sm bg-white hover:bg-blue-50 transition focus:outline-none focus-visible:ring focus-visible:ring-blue-300 disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="Activer Stripe"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Activer Stripe</span>
        </button>
      )}
    </div>

    {message && (
      <div
        className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center"
        role="alert"
      >
        {message}
      </div>
    )}
  </div>
);
};

export default StripePaiement;