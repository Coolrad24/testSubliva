import React, { useState, useEffect } from 'react';
import { auth } from './firebaseconfig'; // Import Firebase configuration
import { useNavigate } from 'react-router-dom'; // Import React Router for navigation
import axios from 'axios';
import './history.css';

const History = () => {
  const [propertiesDetails, setPropertiesDetails] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Fetch the visited properties directly using your userActivity endpoint
          const response = await axios.get(`http://localhost:5000/api/userActivity/${user.uid}`);
          const visitedProperties = response.data.visitedProperties; // Fetch all visited properties
          console.log(visitedProperties);
          // Set up pagination
          const pageSize = 20;
          setTotalPages(Math.ceil(visitedProperties.length / pageSize));

          // Get properties for the current page
          const paginatedProperties = visitedProperties.slice((currentPage - 1) * pageSize, currentPage * pageSize);
          
          // Set the properties details
          setPropertiesDetails(paginatedProperties);
        } catch (error) {
          console.error('Error fetching visited properties:', error);
        }
      } else {
        // Redirect to login if user is not authenticated
        navigate('/login');
      }
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, [currentPage, navigate]);

  return (
    <div className="history-container">
      <h2>Your Property Visit History</h2>
      <div className="property-grid">
        {propertiesDetails.length > 0 ? (
          propertiesDetails.map((property) => (
            <div className="property-card" key={property.id}>
              {property.status === 'sold' && <div className="sold-badge">Sold</div>}
              <img src={property.featured_image} alt={property.property_name} />
              <div className="property-details">
                <h3>{property.property_name}</h3>
                <p>{property.address}, {property.city}</p>
                <ul>
                  <li><strong>Bedrooms:</strong> {property.bedroom}</li>
                  <li><strong>Bathrooms:</strong> {property.bathroom}</li>
                  <li><strong>Size:</strong> {property.area_size} sqft</li>
                </ul>
                <p className="property-price">${property.price} / {property.after_price}</p>
                <a href={`/property/${property.id}`}>View Property</a>
              </div>
            </div>
          ))
        ) : (
          <p>No visited properties found.</p>
        )}
      </div>

      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
        )}
        {currentPage < totalPages && (
          <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
        )}
      </div>
    </div>
  );
};

export default History;
