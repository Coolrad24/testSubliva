import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseconfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import './Settings.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    newPassword: '',
    confirmPassword: '',
    notifications: {
      email: true,
      messages: true,
      marketing: false
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prevState => ({
              ...prevState,
              name: userData.name || '',
              email: auth.currentUser.email,
              phone: userData.phone || '',
              notifications: userData.notifications || {
                email: true,
                messages: true,
                marketing: false
              }
            }));
            setUser(userData);
          }
        } catch (err) {
          setError('Failed to load user data');
          console.error(err);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        notifications: {
          ...prevState.notifications,
          [name]: checked
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleReauthentication = async (e) => {
    e.preventDefault();
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      setShowReauthModal(false);
      setCurrentPassword('');
      // Continue with the pending update
      if (formData.email !== user.email) {
        await updateEmail(auth.currentUser, formData.email);
      }
      if (formData.newPassword) {
        await updatePassword(auth.currentUser, formData.newPassword);
      }
      handleSaveChanges(e);
    } catch (err) {
      setError('Invalid password');
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
      }

      // Check if email or password is being changed
      if (formData.email !== auth.currentUser.email || formData.newPassword) {
        setShowReauthModal(true);
        return;
      }

      // Update user document in Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        notifications: formData.notifications
      });

      setSuccess('Settings updated successfully');
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  if (loading) {
    return <div className="settings-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-container">
      <h1>Account Settings</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSaveChanges} className="settings-form">
        <div className="settings-section">
          <h2>Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone number"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Password</h2>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter new password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="email"
                checked={formData.notifications.email}
                onChange={handleInputChange}
              />
              Email Notifications
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="messages"
                checked={formData.notifications.messages}
                onChange={handleInputChange}
              />
              Message Notifications
            </label>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="marketing"
                checked={formData.notifications.marketing}
                onChange={handleInputChange}
              />
              Marketing Emails
            </label>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="save-button">
            Save Changes
          </button>
        </div>
      </form>

      {showReauthModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Confirm Your Password</h2>
            <p>Please enter your current password to continue</p>
            <form onSubmit={handleReauthentication}>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowReauthModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings; 