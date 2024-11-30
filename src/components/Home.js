import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import heroImage from '../Images/image.png';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: 'all',
    priceRange: 'all',
    bedrooms: 'all'
  });

  useEffect(() => {
    fetch('/backend/database/properties.json')
      .then(response => response.json())
      .then(data => {
        setProperties(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching properties:', error);
        setLoading(false);
      });
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredProperties = properties.filter(property => {
    if (filters.city !== 'all' && property.city !== filters.city) return false;
    
    if (filters.bedrooms !== 'all' && property.bedroom !== parseInt(filters.bedrooms)) return false;
    
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (max && (property.price < min || property.price > max)) return false;
      if (!max && property.price < min) return false;
    }
    
    return true;
  });

  if (loading) {
    return <div className="loading">Loading properties...</div>;
  }

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Find Your Perfect Sublease</h1>
        <p>Discover amazing properties available for rent</p>
      </div>

      <div className="filters-section">
        <select 
          name="city" 
          value={filters.city}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="all">All Cities</option>
          {[...new Set(properties.map(p => p.city))].map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select 
          name="priceRange" 
          value={filters.priceRange}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="all">All Prices</option>
          <option value="0-200000">$0 - $200,000</option>
          <option value="200000-300000">$200,000 - $300,000</option>
          <option value="300000">$300,000+</option>
        </select>

        <select 
          name="bedrooms" 
          value={filters.bedrooms}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="all">All Bedrooms</option>
          {[...new Set(properties.map(p => p.bedroom))].sort().map(beds => (
            <option key={beds} value={beds}>{beds} Bedrooms</option>
          ))}
        </select>
      </div>

      <div className="properties-grid">
        {filteredProperties.map(property => (
          <div key={property.property_id} className="property-card">
            <div className="property-image">
              <img 
                src={`/admin/upload/property/${property.featured_image}`} 
                alt={property.property_name}
              />
              {property.is_featured === 'Y' && (
                <span className="featured-badge">Featured</span>
              )}
            </div>
            <div className="property-info">
              <h3>{property.property_name}</h3>
              <p className="property-location">
                <i className="fas fa-map-marker-alt"></i> 
                {property.address}, {property.city}
              </p>
              <div className="property-details">
                <span><i className="fas fa-bed"></i> {property.bedroom} Beds</span>
                <span><i className="fas fa-bath"></i> {property.bathroom} Baths</span>
                <span><i className="fas fa-ruler-combined"></i> {property.area_size} sqft</span>
              </div>
              <div className="property-footer">
                <div className="price">
                  ${property.price.toLocaleString()}
                  <span className="price-period">/{property.after_price}</span>
                </div>
                <Link to={`/property/${property.property_id}`} className="view-details-btn">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;