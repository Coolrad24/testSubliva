import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseconfig';
import axios from 'axios';

const Contract = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { offerPrice, propertyId, contractId } = location.state || {};

  const [contractDetails, setContractDetails] = useState({
    ownerName: '',
    agreementPrice: offerPrice || '',
    deposit: '',
    propertyAddress: '',
    ownerSigned: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContractDetails({ ...contractDetails, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const contractRef = doc(db, 'contracts', contractId);

      // Fetch contract details to get buyer email
      const contractSnap = await getDoc(contractRef);
      const buyerEmail = contractSnap.data()?.buyerEmail;
      console.log(buyerEmail);
      // Update the contract document with owner's input
      await updateDoc(contractRef, {
        ...contractDetails,
        ownerSigned: true,
        status: 'pending-sublessee',
      });

      // Generate a unique link for the sublessee to complete their part
      const sublesseeLink = `${window.location.origin}/complete-contract/${contractId}`;

      // Send the link via email to the sublessee
      const emailData = {
        to: buyerEmail,
        subject: 'Complete Your Subliva Sublease Agreement',
        text: `Please complete your sublease agreement using the following link: ${sublesseeLink}`,
      };

      await axios.post('http://localhost:5001/send-email', emailData);

      alert('Contract created and email sent to sublessee!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to send the contract.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Subliva Sublease Agreement</h2>
      <p>
        This contract is between <strong>{contractDetails.ownerName || '__________'}</strong> (Sublessor) and 
        <strong> {contractDetails.sublesseeEmail || 'Sublessee'}</strong> for the sublease of the property located at 
        <strong> {contractDetails.propertyAddress || '[Property Address]'}</strong>. For the Dates {contractDetails.startDate || '[Start Date]'} to {contractDetails.endDate || '[End Date]'} Both parties agree to the terms and conditions set out in this agreement.
      </p>

      <h4>1. Agreement Price</h4>
      <label>Sublease Price ($/month): </label>
      <input 
        type="number" 
        name="agreementPrice" 
        value={contractDetails.agreementPrice} 
        onChange={handleChange} 
        placeholder="[Agreement Price]" 
      />
      <br />
      <label>Deposit Amount: </label>
      <input 
        type="number" 
        name="deposit" 
        value={contractDetails.deposit} 
        onChange={handleChange} 
        placeholder="[Deposit Amount]" 
      />

      <h4>2. Apartment Condition</h4>
      <p>The Sublessor confirms the apartment's condition at the start of the sublease:</p>
      <textarea 
        name="apartmentCondition" 
        placeholder="List any known issues here..." 
        style={{ width: '100%', height: '100px' }} 
        onChange={handleChange}
      />

      <h4>3. Agreement to Terms</h4>
      <p>
        Both parties acknowledge that the above reflects the property's current condition and agree to communicate any changes promptly. 
        Upon accepting this agreement, the sublessor confirms all information is accurate.
      </p>

      <h4>4. Signatures</h4>
      <label>Owner Name: </label>
      <input 
        type="text" 
        name="ownerName" 
        value={contractDetails.ownerName} 
        onChange={handleChange} 
        placeholder="[Owner Name]" 
      />
      <br />
      <p>
        Sublessor: {contractDetails.ownerName || '[Signature]'} Date: {new Date().toLocaleDateString()}
      </p>
      <p>
        Sublessee: [Pending Signature]
      </p>

      <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Submit and Send Link to Sublessee
      </button>
    </div>
  );
};

export default Contract;
