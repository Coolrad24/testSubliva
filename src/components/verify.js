import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db, storage } from './firebaseconfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import './verify.css';
const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { propertyId } = location.state || {};

  const [proofOfLease, setProofOfLease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle file selection for proof of lease
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const validTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (file && validTypes.includes(file.type)) {
      setProofOfLease(file);
      setError(null);
    } else {
      setError('Please upload a valid image or PDF file.');
    }
  };

  // Handle proof of lease upload
  const handleVerificationSubmit = async () => {
    if (!proofOfLease) {
      setError('Please upload a proof of lease image.');
      return;
    }
    if (!propertyId) {
      setError('Property ID is missing.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated. Please log in.');
        setLoading(false);
        return;
      }
      const uid = user.uid;

      // Upload the file to Firebase Storage
      const storageRef = ref(storage, `proofs_of_lease/${uid}/${proofOfLease.name}`);
      await uploadBytes(storageRef, proofOfLease);
      const downloadURL = await getDownloadURL(storageRef);

      // Add a document to the 'leases' collection in Firestore
      const leaseDoc = {
        userId: uid,
        userEmail: auth.currentUser.email,
        propertyId: propertyId,
        proofOfLeaseURL: downloadURL,
        uploadedAt: new Date(),
        status: 'pending',
      };

      await addDoc(collection(db, 'leases'), leaseDoc);

      // Update the property status to 'verified' in the 'pending' collection
      const propertyRef = doc(db, 'pending', propertyId);
      await updateDoc(propertyRef, { status: 'pending' });

      setSuccess('Proof of lease submitted successfully. Property status updated to verified.');
      // Optionally, navigate to another page or reset the form
      // navigate('/some-page');
    } catch (error) {
      console.error('Error submitting proof of lease: ', error);
      setError('Failed to submit proof of lease.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Proof of Lease Verification</h2>
      {loading && <p>Loading...</p>}
      {propertyId ? (
        <>
          <div className="form-group">
            <label>Upload Proof of Lease</label>
            <input type="file" onChange={handleFileChange} />
          </div>
          <button onClick={handleVerificationSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Proof'}
          </button>
        </>
      ) : (
        <p>Error: Property ID is missing. Please return to the previous step.</p>
      )}
      {error && (
        <p className="error" style={{ color: 'red' }}>
          {error}
        </p>
      )}
      {success && (
        <p className="success" style={{ color: 'green' }}>
          {success}
        </p>
      )}
    </div>
  );
};

export default Verify;
