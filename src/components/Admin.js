import React, { useState, useEffect } from 'react';
import { auth, db,functions } from './firebaseconfig'; // Adjust the import path as needed
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import axios from 'axios';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  setDoc,
  updateDoc,
  getDoc,
} from 'firebase/firestore';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [pendingLeases, setPendingLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entryDenied, setEntryDenied] = useState(false);

  // Admin UID
  const adminUID = 'iankQOyiyYfDUChVKbcC3otq8al2';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentUser.uid === adminUID) {
          setUser(currentUser);
          fetchPendingLeases();
        } else {
          setEntryDenied(true);
          setLoading(false);
        }
      } else {
        setEntryDenied(true);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPendingLeases = async () => {
    try {
      const leasesRef = collection(db, 'leases');
      const querySnapshot = await getDocs(leasesRef);
      const leases = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((lease) => lease.status === 'pending');
      setPendingLeases(leases);
    } catch (error) {
      console.error('Error fetching pending leases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (lease) => {
    try {
      const propertyId = lease.propertyId;
      
      // Send approval email
      const emailData = {
        to: lease.userEmail,
        subject: 'Your Lease Has Been Approved',
        text: `Congratulations! Your lease for property ${propertyId} has been approved.`,
      };
  
      console.log('Email data being sent:', emailData);  // Log the email data before sending
      await axios.post('http://localhost:5001/send-email', emailData);
  
      // Handle property and lease update
      const pendingPropertyRef = doc(db, 'pending', propertyId);
      const pendingPropertySnapshot = await getDoc(pendingPropertyRef);
  
      if (pendingPropertySnapshot.exists()) {
        const propertyData = pendingPropertySnapshot.data();
        const propertiesRef = doc(db, 'properties', propertyId);
        await setDoc(propertiesRef, {
          ...propertyData,
          status: 'verified',
        });
        await deleteDoc(pendingPropertyRef);
      }
  
      // Update lease status to 'approved'
      const leaseRef = doc(db, 'leases', lease.id);
      await updateDoc(leaseRef, { status: 'approved' });
  
      setPendingLeases(pendingLeases.filter((l) => l.id !== lease.id));
      alert('Lease accepted and property moved to properties.');
    } catch (error) {
      console.error('Error accepting lease:', error);
      alert('Failed to accept lease.');
    }
  };
  
  const handleReject = async (lease) => {
    try {
      // Send rejection email
      const emailData = {
        to: lease.userEmail,
        subject: 'Your Lease Has Been Rejected',
        text: `We're sorry to inform you that your lease for property ${lease.propertyId} has been rejected.`,
      };
      
      console.log('Email data being sent:', emailData);  // Log the email data before sending
      await axios.post('http://localhost:5001/send-email', emailData);
  
      // Handle property and lease update
      const leaseRef = doc(db, 'leases', lease.id);
      await updateDoc(leaseRef, { status: 'rejected' });
  
      const pendingPropertyRef = doc(db, 'pending', lease.propertyId);
      await deleteDoc(pendingPropertyRef);
  
      setPendingLeases(pendingLeases.filter((l) => l.id !== lease.id));
      alert('Lease rejected and property removed from pending.');
    } catch (error) {
      console.error('Error rejecting lease:', error);
      alert('Failed to reject lease.');
    }
  };
  
  

  if (loading) {
    return <p>Loading...</p>;
  }

  if (entryDenied) {
    return <p>Access Denied</p>;
  }

  return (
    <div>
      <h2>Pending Leases</h2>
      {pendingLeases.length === 0 ? (
        <p>No pending leases.</p>
      ) : (
        pendingLeases.map((lease) => (
          <div
            key={lease.id}
            style={{ border: '1px solid black', padding: '10px', margin: '10px' }}
          >
            <h3>Lease ID: {lease.id}</h3>
            <p>Property ID: {lease.propertyId}</p>
            <p>Owner Email: {lease.ownerEmail}</p>
            <p>
              Uploaded At:{' '}
              {lease.uploadedAt && lease.uploadedAt.toDate().toString()}
            </p>
            <p>Proof of Lease:</p>
            {lease.proofOfLeaseURL ? (
              <a
                href={lease.proofOfLeaseURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Proof of Lease
              </a>
            ) : (
              <p>No proof of lease file available.</p>
            )}
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleAccept(lease)}>Approve</button>
              <button onClick={() => handleReject(lease)}>Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminPage;
