import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseconfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './saved.css';
const Saved = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // Redirect to login page if not authenticated
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch the current user's document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          setSavedProperties([]);
          setLoading(false);
          return;
        }

        const savedPropertyIds = userDoc.data().savedProperties || [];

        if (savedPropertyIds.length === 0) {
          setSavedProperties([]);
          setLoading(false);
          return;
        }

        // Query the properties collection to fetch the saved properties
        const propertiesRef = collection(db, 'properties');
        const propertiesQuery = query(
          propertiesRef,
          where('__name__', 'in', savedPropertyIds) // Firestore allows querying by document IDs using `__name__`
        );

        const propertiesSnapshot = await getDocs(propertiesQuery);

        const propertiesData = propertiesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSavedProperties(propertiesData);
        console.log(propertiesData);
      } catch (err) {
        console.error('Error fetching saved properties:', err);
        setError('Failed to load saved properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading your saved properties...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="saved-properties-container bg-gray-50 min-h-screen py-8">
      <div className="max-w-screen-2xl mx-auto px-4">
        {/* Header */}
        <div className="header flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">Saved Properties</h1>
        </div>

        {/* No Saved Properties */}
        {savedProperties.length === 0 ? (
          <div className="no-saved-properties text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-600 mb-4">You haven’t saved any properties yet.</p>
            <Link
              to="/"
              className="bg-blue-600 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400"
            >
              Browse Properties
            </Link>
          </div>
        ) : (
          /* Saved Properties */
          <div className="space-y-6">
            {savedProperties.map((property) => (
              <div
                key={property.id}
                className="property-card bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Property Image */}
                  {property.featured_image && (
                    <div className="featured-image mb-8">
                        <img
                        src={property.featured_image}
                        alt={property.property_name}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                    </div>
                    )}

                  {/* Property Info */}
                  <div className="p-6 w-full">
                    <h2 className="text-2xl font-bold text-gray-800 truncate">
                      {property.property_name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-2 truncate">
                      {property.address}, {property.city}
                    </p>
                    <div className="property-details flex justify-between text-sm text-gray-700 mt-4">
                      <span>{property.bedroom || 0} Beds</span>
                      <span>{property.bathroom || 0} Baths</span>
                      <span>{property.area_size || 0} sqft</span>
                    </div>
                    <p className="text-xl font-semibold text-blue-600 mt-4">
                      ${property.price}
                    </p>

                    {/* View Details Link */}
                    <div className="view-details mt-4">
                      <Link
                        to={`/property/${property.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
