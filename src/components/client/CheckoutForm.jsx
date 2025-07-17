// src/components/CheckoutForm.jsx
import { useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ clientSecret, user }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    if (!stripe || !elements) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          email: user.email,
        },
      },
    });

    if (result.error) {
      setErrorMsg(result.error.message);
      setIsLoading(false);
    } else {
      if (result.paymentIntent.status === 'requires_capture') {
        setSuccess(true);
      } else {
        setErrorMsg("Erreur inattendue lors du paiement.");
      }
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button disabled={!stripe || isLoading}>Payer</button>
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
      {success && <p style={{ color: 'green' }}>✅ Paiement réussi, en attente de livreur</p>}
    </form>
  );
};

export default CheckoutForm;