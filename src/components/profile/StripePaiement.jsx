import React, { useState } from 'react';
import Button from "../../components/ui/Button";
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
        setMessage(data.message || 'Une erreur est survenue.');
      }
    } catch (err) {
      console.error('Erreur onboarding Stripe :', err);
      setMessage('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {stripeAccountId ? (
        <div className="text-green-600 font-medium">✅ Paiement activé avec Stripe</div>
      ) : (
        <>
          <Button onClick={handleStripeOnboarding} disabled={loading}>
            {loading ? 'Redirection vers Stripe...' : 'Activer les paiements avec Stripe'}
          </Button>
          {message && <div className="text-red-600 mt-2">{message}</div>}
        </>
      )}
    </div>
  );
};

export default StripePaiement;