import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion,deleteDoc } from 'firebase/firestore';
import { auth,db } from './firebaseconfig';
import './completecontract.css';

const CompleteContract = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contractData, setContractData] = useState({});
  const [buyerName, setBuyerName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      const contractRef = doc(db, 'contracts', contractId);
      const contractSnap = await getDoc(contractRef);
      if (contractSnap.exists()) {
        setContractData(contractSnap.data());
        setIsLoaded(true);
      } else {
        alert('Invalid contract link.');
        navigate('/');
      }
    };
    fetchContract();
  }, [contractId, navigate]);

  const handleRejectContract = async () => {
    if (!window.confirm("Are you sure you want to reject this contract? This action cannot be undone.")) {
      return;
    }
  
    try {
      // Step 1: Delete the contract from the database
      const contractRef = doc(db, 'contracts', contractId);
      await updateDoc(contractRef, { status: 'rejected' }); // Optionally mark it as rejected before deletion
      await deleteDoc(contractRef);
  
      // Step 2: Update the property's status back to "verified"
      if (contractData.propertyId) {
        const propertyRef = doc(db, 'properties', contractData.propertyId);
        await updateDoc(propertyRef, { status: 'verified' });
      }
  
      alert('Contract has been rejected and the property status updated.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error rejecting contract:', error);
      alert('Failed to reject the contract. Please try again.');
    }
  };
  
  const handleBuyerSign = async () => {
    if (!buyerName.trim()) {
      alert('Please enter your name to sign the contract.');
      return;
    }
  
    const contractRef = doc(db, 'contracts', contractId);
  
    // Step 1: Update the contract to mark it as signed
    await updateDoc(contractRef, {
      buyerName,
      sublesseeSigned: true,
      status: 'completed',
      paymentStatus: 'false',
    });
  
    // Step 2: Add to the user's balance in their Firestore document
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, 'users', user.uid);
  
      // Calculate the due date (one month from today)
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
  
      // Create a new balance entry as an object
      const newBalanceEntry = {
        amountDue: contractData.offerPrice || 0, // Amount due (using agreement price)
        dueDate: dueDate.toISOString().split('T')[0], // Due date (formatted as YYYY-MM-DD)
        propertyId: contractId, // Property/Contract ID
      };
  
      try {
        // Add the new balance entry to the balances array
        await updateDoc(userRef, {
          balances: arrayUnion(newBalanceEntry),
        });
  
        alert('You have successfully signed the contract and updated your balance!');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error updating user balance:', error);
        alert('Failed to update your balance. Please try again.');
      }
    } else {
      alert('User not logged in. Please log in again.');
      navigate('/login');
    }
  };
  

  if (!isLoaded) return <p>Loading...</p>;

  return (
    <div className="contract-container">
      <h1 className="contract-title">Subliva Sublease Agreement</h1>
      <hr />

      <section className="contract-section">
        <h3>1. Agreement Overview</h3>
        <p>
          This contract is between <strong>{contractData.ownerName || '__________'}</strong> (Sublessor) and 
          <strong> {buyerName || '__________'}</strong> (Sublessee) for the sublease of the property located at 
          <strong> {contractData.propertyAddress || '[Property Address]'}</strong>. Both parties agree to the terms and conditions set out in this agreement.
        </p>
      </section>

      <section className="contract-section">
        <h3>2. Agreement Price</h3>
        <p>
          Sublease Price: <strong>${contractData.agreementPrice || '[Agreement Price]'}</strong> per month
          <br />
          Deposit: <strong>${contractData.deposit || '[Deposit Amount]'}</strong>
        </p>
      </section>

      <section className="contract-section">
        <h3>3. Apartment Condition</h3>
        <p>The Sublessor confirms the apartment's condition at the start of the sublease.</p>
        <ul>
          <li>Structural Issues: <strong>{contractData.structuralIssues || 'None reported'}</strong></li>
          <li>Plumbing: <strong>{contractData.plumbingIssues || 'None reported'}</strong></li>
          <li>Electrical: <strong>{contractData.electricalIssues || 'None reported'}</strong></li>
          <li>Appliances: <strong>{contractData.applianceIssues || 'None reported'}</strong></li>
          <li>Other Issues: <strong>{contractData.otherIssues || 'None reported'}</strong></li>
        </ul>
      </section>

      <section className="contract-section">
        <h3>4. Agreement to Terms</h3>
        <p>
          Both parties acknowledge that the above reflects the property's current condition and agree to communicate any changes promptly.
        </p>
      </section>

      <section className="contract-section signatures">
        <div className="signature-block">
          <label>Sublessee (Your Name):</label>
          <input
            type="text"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            placeholder="Enter your full name"
            required
          />
          <p>Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="signature-block">
          <p>
            Sublessor: <strong>{contractData.ownerName || '__________'}</strong>
          </p>
          <p>Date: {contractData.createdAt ? new Date(contractData.createdAt.seconds * 1000).toLocaleDateString() : '__________'}</p>
        </div>
      </section>

      <button className="sign-button" onClick={handleBuyerSign}>
        Sign Contract
      </button>
      <button className="reject-button" onClick={handleRejectContract}>
        Reject Contract
      </button>
    </div>
  );
};

export default CompleteContract;
