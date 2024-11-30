import React from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ amount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        'YOUR_CLIENT_SECRET', // Replace with the client secret from your backend
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'John Doe', // Replace with dynamic user details
            },
          },
        }
      );

      if (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        alert('Payment successful!');
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay ${amount / 100}
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
};

export default CheckoutForm;
