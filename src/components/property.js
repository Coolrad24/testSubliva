import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseconfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import './property.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  const formatTimestamp = (timestamp) =>
    timestamp instanceof Timestamp
      ? timestamp.toDate().toLocaleString()
      : 'Unavailable';

  const logUserVisit = async () => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'userActivity', currentUser.uid);

    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          visitedProperties: arrayUnion(id),
        });
      } else {
        await setDoc(userDocRef, { visitedProperties: [id] });
      }
    } catch (error) {
      console.error('Error logging property visit:', error);
    }
  };

  const saveProperty = async () => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userDocRef, { savedProperties: arrayUnion(id) });
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving property:', error);
    }
  };
  const startConversation = async (propertyId, propertyName, ownerId) => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
  
    try {
      // Query to check if a conversation already exists between the current user and the property owner
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', currentUser.uid),
        where('propertyId', '==', propertyId)
      );
      const existingConv = await getDocs(q);
  
      // If a conversation exists, navigate to it
      if (!existingConv.empty) {
        navigate(`/messages?conversation=${existingConv.docs[0].id}`);
        return;
      }
  
      // If no conversation exists, create a new one
      const conversationData = {
        participants: [currentUser.uid, ownerId],
        propertyId,
        propertyName,
        propertyOwner: ownerId, // Add the owner's ID
        propertyPrice: property.price, // Include the price from the current property
        propertyStatus: property.status,
        messages: [], // Initial empty messages array
        lastMessage: '',
        lastMessageTime: new Date(),
        unreadCount: {
          [currentUser.uid]: 0,
          [ownerId]: 0,
        },
      };
  
      // Add the new conversation to the "conversations" collection
      const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);
  
      // Update both users' "messages" fields with the new conversation ID
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const ownerUserRef = doc(db, 'users', ownerId);
  
      await updateDoc(currentUserRef, {
        messages: arrayUnion(conversationRef.id),
      });
      await updateDoc(ownerUserRef, {
        messages: arrayUnion(conversationRef.id),
      });
  
      // Navigate to the newly created conversation
      navigate(`/messages?conversation=${conversationRef.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/properties/${id}`);
        const data = await response.json();
        if (response.ok) {
          data.createdAt = new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds);
          if (data.updatedAt) {
            data.updatedAt = new Timestamp(data.updatedAt.seconds, data.updatedAt.nanoseconds);
          }
          setProperty(data);
          logUserVisit();
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return <p>Loading property details...</p>;
  if (!property) return <p>Property not found.</p>;

  return (
    <div className="property-details-container bg-gray-50 min-h-screen py-8">
      <div className="max-w-screen-lg mx-auto px-4">
        {/* Header Section */}
        <div className="property-header text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{property.property_name}</h1>
          <p className="text-gray-600 mt-2">
            {property.address}, {property.city}, {property.state} ({property.zip_code})
          </p>
        </div>

        {/* Featured Image */}
        {property.featured_image && (
          <div className="featured-image mb-8">
            <img
              src={property.featured_image}
              alt={property.property_name}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Gallery Section */}
        {property.gallery_images && property.gallery_images.length > 0 && (
          <div className="gallery-section mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Gallery</h2>
            <div className="gallery-grid grid grid-cols-2 sm:grid-cols-3 gap-4">
              {property.gallery_images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Property Information Table */}
        <div className="property-info bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{property.address} {property.city} ,{property.state}</h2>
          <table className="w-full text-left text-gray-700">
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Price:</td>
                <td className="py-2">${property.price}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Bedrooms:</td>
                <td className="py-2">{property.bedroom}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Bathrooms:</td>
                <td className="py-2">{property.bathroom}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Area Size:</td>
                <td className="py-2">{property.area_size || 'N/A'} sqft</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Garage:</td>
                <td className="py-2">{property.garage || 'None'}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Description:</td>
                <td className="py-2">{property.description}</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Status:</td>
                <td className="py-2">{property.status}</td>
              </tr>
              
              <tr>
                <td className="py-2 font-medium">Listed On:</td>
                <td className="py-2">{formatTimestamp(property.createdAt)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Save Property or Contact Owner Section */}
        <div className="actions text-center space-y-4">
          {currentUser?.uid !== property.owner && (
            <>
              <button
                onClick={saveProperty}
                className={`${
                  isSaved ? 'bg-green-500' : 'bg-blue-500'
                } text-white py-3 px-6 rounded-lg shadow hover:opacity-90 focus:ring-2 focus:ring-blue-400`}
                disabled={isSaved}
              >
                {isSaved ? 'Saved' : 'Save Property'}
              </button>
              <button
                onClick={() =>
                  startConversation(property.id, property.property_name, property.owner)
                }
                className="bg-blue-500 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"
              >
                Contact Owner
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
