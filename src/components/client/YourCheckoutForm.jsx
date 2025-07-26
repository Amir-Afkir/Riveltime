import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import useUserStore from '../../stores/userStore';
import { useNavigate } from 'react-router-dom';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: 'Helvetica Neue, Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const YourCheckoutForm = ({ cart, onOrderSuccess }) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { token, userData, fetchUser, restoreUserFromCache } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [paymentIntentsData, setPaymentIntentsData] = useState([]);

  useEffect(() => {
    restoreUserFromCache?.();
  }, []);

  useEffect(() => {
    if (!userData && token) {
      fetchUser();
    }
  }, [userData, token]);

  useEffect(() => {
    const createIntents = async () => {
      if (!token || !userData?._id || !cart?.length || paymentIntentsData.length) return;
      setLoading(true);
      setError(null);
      try {
        const cartToSend = cart.map(item => ({ productId: item.product._id, quantity: item.quantity }));
        const res = await axios.post('http://localhost:5000/stripe/multi-payment-intents', {
          cart: cartToSend
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setPaymentIntentsData(res.data.paymentIntents || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la préparation du paiement.');
      } finally {
        setLoading(false);
      }
    };
    createIntents();
  }, [cart, token, userData, paymentIntentsData.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!stripe || !elements || !paymentIntentsData.length || !token || !userData?._id) {
      setError("Informations manquantes ou Stripe non prêt.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    console.log("🔎 cardElement récupéré :", cardElement);
    if (!cardElement) {
      console.error("❌ cardElement introuvable !");
      setError("Champ de carte introuvable.");
      setLoading(false);
      return;
    }
    const confirmedIntentsForOrder = [];

    for (const intent of paymentIntentsData) {
      // Remplacement du bloc de confirmation Stripe par le code fourni
      try {
        console.log("🧾 Tentative de confirmation pour PI :", intent.clientSecret, "boutiqueId :", intent.boutiqueId);
        console.log("📦 Infos de facturation Stripe", {
          name: userData.fullname,
          email: userData.email,
          postal_code: userData?.infosClient?.adresse?.postalCode,
        });

        const result = await stripe.confirmCardPayment(intent.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: userData.fullname || "Client Riveltime",
              email: userData.email || "test@example.com",
              address: {
                postal_code: userData?.infosClient?.adresse?.postalCode || "75000",
              },
            },
          },
        });

        if (result.error) {
          console.error("❌ Erreur Stripe :", result.error.message);
          alert("Erreur de paiement : " + result.error.message);
          setLoading(false);
          return;
        }

        console.log("✅ Paiement confirmé :", result.paymentIntent.id);
        confirmedIntentsForOrder.push({
          paymentIntentId: result.paymentIntent.id,
          boutiqueId: intent.boutiqueId,
        });
      } catch (err) {
        console.error("❌ Erreur inattendue Stripe :", err);
        alert("Une erreur inattendue est survenue.");
        setLoading(false);
        return;
      }
    }

    try {
      for (const intent of confirmedIntentsForOrder) {
        await axios.post('http://localhost:5000/stripe/create', {
          paymentIntentId: intent.paymentIntentId
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

    setSuccess(true);
    onOrderSuccess?.();

    // Redirection vers les commandes après un petit délai pour laisser l'UX respirer
    setTimeout(() => {
    navigate('/client/commandes');
    }, 1000); // ou 0ms si tu veux que ce soit immédiat


    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la commande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="card-element-container">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Commande validée avec succès !</div>}
      <button type="submit" disabled={!stripe || loading || !paymentIntentsData.length}>
        {loading ? 'Traitement...' : 'Payer'}
      </button>
    </form>
  );
};

export default YourCheckoutForm;