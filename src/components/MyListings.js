import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseconfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm'; // Import your CheckoutForm
import './MyListings.css';

const stripePromise = loadStripe('pk_test_51QPUHdIz5iHsStSgHzSSf5DzLZcDMcJS0SJYbowUKU39t8A8QUNxgYTDayFoW7kefSXzLwOA7lx2zKUT7kjRnwx900QZmcf89a');

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentListing, setCurrentListing] = useState(null);

  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSize, setAreaSize] = useState('');
  const [price, setPrice] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchListings = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const propertiesRef = collection(db, 'properties');
        const pendingRef = collection(db, 'pending');

        const propertiesQuery = query(
          propertiesRef,
          where('owner', '==', currentUser.uid)
        );

        const pendingQuery = query(
          pendingRef,
          where('owner', '==', currentUser.uid)
        );

        const [propertiesSnapshot, pendingSnapshot] = await Promise.all([
          getDocs(propertiesQuery),
          getDocs(pendingQuery),
        ]);

        const propertiesData = propertiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          status: 'verified',
          collection: 'properties',
          ...doc.data(),
        }));

        const pendingData = pendingSnapshot.docs.map((doc) => ({
          id: doc.id,
          status: 'pending',
          collection: 'pending',
          ...doc.data(),
        }));

        setListings([...propertiesData, ...pendingData]);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [currentUser]);

  const handleFeatureClick = (listing) => {
    setCurrentListing(listing);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const { id, collection } = currentListing;

      const response = await fetch('http://localhost:5001/api/mark-featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, collectionName: collection }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark listing as featured');
      }

      setListings((prevListings) =>
        prevListings.map((item) =>
          item.id === id ? { ...item, status: 'featured' } : item
        )
      );

      setIsPaymentModalOpen(false);
      alert('Payment successful! Your listing is now featured.');
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Failed to feature listing. Please try again.');
    }
  };

  const handleCancelPayment = () => {
    setIsPaymentModalOpen(false);
    setCurrentListing(null);
  };

  const handleEditClick = (listing) => {
    setCurrentListing(listing);
    setBedrooms(listing.bedroom || '');
    setBathrooms(listing.bathroom || '');
    setAreaSize(listing.area_size || '');
    setPrice(listing.price || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentListing) {
      setError('Listing data is not available.');
      return;
    }

    try {
      const { id, collection } = currentListing;
      const docRef = doc(db, collection, id);

      await updateDoc(docRef, {
        bedroom: parseInt(bedrooms) || 0,
        bathroom: parseInt(bathrooms) || 0,
        area_size: parseInt(areaSize) || 0,
        price: parseFloat(price) || 0,
        updatedAt: serverTimestamp(),
      });

      setListings((prevListings) =>
        prevListings.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                bedroom: parseInt(bedrooms) || 0,
                bathroom: parseInt(bathrooms) || 0,
                area_size: parseInt(areaSize) || 0,
                price: parseFloat(price) || 0,
              }
            : listing
        )
      );

      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError('Failed to update listing. Please try again later.');
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentListing(null);
    setError(null);
  };

  if (loading) {
    return <div className="loading">Loading your listings...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="my-listings-container bg-gray-50 min-h-screen py-8">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="listings-header flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">My Listings</h1>
          <Link
            to="/list"
            className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
          >
            Create New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="no-listings text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-4">
              You haven't created any listings yet.
            </p>
            <Link
              to="/list"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="listing-card bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="listing-image flex-shrink-0 w-full md:w-1/3">
                    {listing.featured_image ? (
                      <img
                        src={listing.featured_image}
                        alt={listing.property_name}
                        className="w-full h-64 md:h-full object-cover"
                      />
                    ) : (
                      <div className="no-image bg-gray-200 h-64 md:h-full flex items-center justify-center text-gray-500 text-sm">
                        No Image Available
                      </div>
                    )}
                  </div>

                  <div className="p-6 w-full">
                    <h2 className="text-2xl font-bold text-gray-800 truncate">
                      {listing.property_name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {listing.address}, {listing.city}
                    </p>
                    <div className="property-details flex justify-between text-sm text-gray-700 mt-4">
                      <span>{listing.bedroom || 0} Beds</span>
                      <span>{listing.bathroom || 0} Baths</span>
                      <span>{listing.area_size || 0} sqft</span>
                    </div>
                    <p className="text-xl font-semibold text-blue-600 mt-4">
                      ${listing.price}
                    </p>
                    <div className="availability mt-4 flex items-center">
                      <p>
                        Status:{' '}
                        <strong
                          className={`${
                            listing.status === 'featured'
                              ? 'text-yellow-500'
                              : listing.status === 'Active'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {listing.status}
                        </strong>
                      </p>
                      {listing.status === 'featured' && (
                        <span className="ml-2 text-yellow-500 text-lg">⭐</span>
                      )}
                    </div>

                    <div className="listing-actions flex justify-between items-center mt-6">
                      <Link
                        to={`/property/${listing.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                      <button
                        className="text-sm text-gray-500 hover:text-gray-800"
                        onClick={() => handleEditClick(listing)}
                      >
                        Edit Listing
                      </button>
                      {listing.status === 'verified' && (
                        <button
                          className="text-sm text-green-500 hover:underline"
                          onClick={() => handleFeatureClick(listing)}
                        >
                          Feature Listing
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Listing</h2>
              {error && (
                <div className="error text-red-500 text-sm mb-4">{error}</div>
              )}
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700">
                    Bedrooms:
                  </label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700">
                    Bathrooms:
                  </label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700">
                    Square Footage:
                  </label>
                  <input
                    type="number"
                    value={areaSize}
                    onChange={(e) => setAreaSize(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700">
                    Price:
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
                <div className="modal-actions flex justify-between mt-6">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-400"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isPaymentModalOpen && (
          <Elements stripe={stripePromise}>
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                  Feature Listing - $10
                </h2>
                <CheckoutForm
                  amount={1000}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handleCancelPayment}
                />
              </div>
            </div>
          </Elements>
        )}
      </div>
    </div>
  );
};

export default MyListings;
