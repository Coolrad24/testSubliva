import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebaseconfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from './CheckoutForm';
import './dashboard.css';

const stripePromise = loadStripe('pk_test_51QPUHdIz5iHsStSgHzSSf5DzLZcDMcJS0SJYbowUKU39t8A8QUNxgYTDayFoW7kefSXzLwOA7lx2zKUT7kjRnwx900QZmcf89a');

const Dashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [propertyDetails, setPropertyDetails] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        await fetchUserContracts(user.uid);
      } else {
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const fetchUserContracts = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/contracts/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setContracts(data.contracts || []);
        await fetchPropertyDetails(data.contracts || []);
      } else {
        console.error('Error fetching contracts:', data.error);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  };

  const fetchPropertyDetails = async (contracts) => {
    const details = {};
    for (const contract of contracts) {
      if (contract.propertyId) {
        try {
          const propertyRef = doc(db, 'properties', contract.propertyId);
          const propertySnap = await getDoc(propertyRef);
          if (propertySnap.exists()) {
            details[contract.propertyId] = propertySnap.data();
          }
        } catch (error) {
          console.error(`Error fetching property details for ID ${contract.propertyId}:`, error);
        }
      }
    }
    setPropertyDetails(details);
  };

  const handleForgoPayment = async (contractId) => {
    try {
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, { paymentStatus: true });
      alert('Payment has been marked as paid.');
      await fetchUserContracts(currentUser.uid);
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status.');
    }
  };

  const handleTerminateContract = async (contractId, buyerEmail) => {
    if (!window.confirm('Are you sure you want to terminate this contract?')) {
      return;
    }

    try {
      const contractRef = doc(db, 'contracts', contractId);
      await deleteDoc(contractRef);

      // Send termination email (backend handles the actual email)
      await fetch('http://localhost:5001/api/send-termination-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: buyerEmail, contractId }),
      });

      alert('Contract has been terminated.');
      await fetchUserContracts(currentUser.uid);
    } catch (error) {
      console.error('Error terminating contract:', error);
      alert('Failed to terminate contract.');
    }
  };

  const handlePayNow = (contract) => {
    setSelectedContract(contract);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const contractRef = doc(db, 'contracts', selectedContract.id);
      const response = await fetch('http://localhost:5001/api/pay-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractId: selectedContract.id,
          ownerId: selectedContract.ownerId,
          amount: selectedContract.offerPrice,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed.');
      }

      await updateDoc(contractRef, { paymentStatus: true });

      alert('Payment successful! The owner has been paid.');
      setIsPaymentModalOpen(false);
      await fetchUserContracts(currentUser.uid);
    } catch (error) {
      console.error('Error updating payment status after payment:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-container">
      <h1>My Contracts</h1>
      {isLoggedIn ? (
        <div className="contracts-list">
          {contracts.length === 0 && <p>No contracts found.</p>}
          {contracts.map((contract) => {
            const isOwner = contract.ownerId === currentUser.uid;
            const property = propertyDetails[contract.propertyId];

            return (
              <div
                key={contract.id}
                className={`contract-card ${isOwner ? 'owner-card' : ''}`}
              >
                {property && (
                  <div className="property-details">
                    <img
                      src={property.featured_image || 'placeholder.jpg'}
                      alt="Property"
                      className="property-image"
                    />
                    <h3>{property.property_name || 'Unknown Property'}</h3>
                    <p>{property.address || 'No address available'}</p>
                  </div>
                )}

                <div className="contract-info">
                  <h4>Contract ID: {contract.id}</h4>
                  <p>Buyer ID: {contract.buyerId}</p>
                  <p>Seller ID: {contract.ownerId}</p>
                  <p>Status: {contract.status}</p>
                </div>

                {isOwner ? (
                  <div className="owner-actions">
                    <p>Payment Status: {contract.paymentStatus === "true" ? 'Paid' : 'Pending'}</p>
                    <button
                      className="forgo-button"
                      onClick={() => handleForgoPayment(contract.id)}
                    >
                      Forgo Payment
                    </button>
                    <button
                      className="terminate-button"
                      onClick={() => handleTerminateContract(contract.id, contract.buyerEmail)}
                    >
                      Terminate Contract
                    </button>
                  </div>
                ) : (
                  <div className="buyer-actions">
                    <p>
                      Balance: $
                      {contract.paymentStatus === "true"
                        ? 0
                        :contract.offerPrice}
                    </p>
                    {contract.paymentStatus === "false" && (
                      <button onClick={() => handlePayNow(contract)}>Pay Now</button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p>Please log in to view your contracts.</p>
      )}

      {isPaymentModalOpen && (
        <div className="payment-modal">
          <h3>Pay ${selectedContract?.offerPrice || 0}</h3>
          <Elements stripe={stripePromise}>
            <CheckoutForm
              amount={selectedContract?.offerPrice * 100}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setIsPaymentModalOpen(false)}
            />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
