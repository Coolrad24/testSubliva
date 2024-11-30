import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./search.css";

const SearchResults = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page
  const [totalPages, setTotalPages] = useState(0); // Total number of pages
  const [suggestions, setSuggestions] = useState([]); // For Google Places suggestions
  const [searchInput, setSearchInput] = useState(""); // For autocomplete input

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("city") || ""; // City search query

  // Filter states
  const [city, setCity] = useState(searchQuery);
  const [bedrooms, setBedrooms] = useState(params.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(params.get("bathrooms") || "");
  const [availabilityDate, setAvailabilityDate] = useState(
    params.get("availableFrom") || ""
  );
  const [availabilityDateend, setAvailabilityDateend] = useState(
    params.get("availableTo") || ""
  );
  const [price, setPrice] = useState(params.get("price") || "");

  // Fetch properties from the backend with filters
  const fetchProperties = (page = 1) => {
    setLoading(true);

    const parts = city.split(",").map((part) => part.trim());
    const parsedCity = parts[0] || ""; // First part is the city
    const parsedState = parts[1] || ""; // Second part is the state (if available)

    let query = `http://localhost:5001/api/property?city=${parsedCity}&page=${page}&limit=10`;
    if (parsedState) query += `&state=${parsedState}`;
    if (bedrooms) query += `&bedrooms=${bedrooms}`;
    if (bathrooms) query += `&bathrooms=${bathrooms}`;
    if (availabilityDate) query += `&availableFrom=${availabilityDate}`;
    if (availabilityDateend) query += `&availableTo=${availabilityDateend}`;
    if (price) query += `&price=${price}`;

    fetch(query)
      .then((res) => res.json())
      .then((data) => {
        setProperties(data.properties || []);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestions([]);
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Fetch properties when the component mounts or when the location.search changes
  useEffect(() => {
    fetchProperties(currentPage);
  }, [location.search, currentPage]);

  const fetchSuggestions = async (input) => {
    if (!input) return;

    try {
      const { data } = await axios.get(`http://localhost:5001/api/places`, {
        params: { input },
      });
      setSuggestions(data.predictions.map((pred) => pred.description));
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setCity(value);

    if (value) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const parts = city.split(",").map((part) => part.trim());
    const parsedCity = parts[0] || ""; // First part is the city
    const parsedState = parts[1] || ""; // Second part is the state

    const queryParams = new URLSearchParams();
    if (parsedCity) queryParams.set("city", `${parsedCity}, ${parsedState}`);
    if (bedrooms) queryParams.set("bedrooms", bedrooms);
    if (bathrooms) queryParams.set("bathrooms", bathrooms);
    if (availabilityDate) queryParams.set("availableFrom", availabilityDate);
    if (availabilityDateend)
      queryParams.set("availableTo", availabilityDateend);
    if (price) queryParams.set("price", price);

    navigate(`/search?${queryParams.toString()}`);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="search-results-container">
      {/* Filter Form */}
      <form onSubmit={handleSubmit} className="filter-form">
        <div className="relative w-full">
          <input
            type="text"
            value={city}
            onChange={handleInputChange}
            placeholder="City"
            className="w-full px-5 py-3 text-lg border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg w-full max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-black text-left"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="number"
          value={bedrooms}
          onChange={(e) => setBedrooms(e.target.value)}
          placeholder="Bedrooms"
          className="input-class"
        />
        <input
          type="number"
          value={bathrooms}
          onChange={(e) => setBathrooms(e.target.value)}
          placeholder="Bathrooms"
          className="input-class"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Max Price"
          className="input-class"
        />
        <input
          type="date"
          value={availabilityDate}
          onChange={(e) => setAvailabilityDate(e.target.value)}
          className="input-class"
        />
        <input
          type="date"
          value={availabilityDateend}
          onChange={(e) => setAvailabilityDateend(e.target.value)}
          className="input-class"
        />
        <button type="submit" className="btn-class">
          Apply Filters
        </button>
      </form>

      {/* Main Content */}
      <div className="results-container">
        {/* Property List */}
        <div className="property-listing">
          {loading ? (
            <p>Loading properties...</p>
          ) : properties.length === 0 ? (
            <p>Sorry, no results found.</p>
          ) : (
            <>
              <h1>{properties.length} Subleases Available</h1>
              <div className="grid grid-cols-1 gap-6">
                {properties.map((property) => (
                  <div className="property-card" key={property.id}>
                    <Link to={`/property/${property.id}`}>
                      <img
                        src={property.featured_image}
                        alt={property.property_name}
                      />
                      <div className="property-content p-4">
                        {/* Property Name */}
                        <h2 className="text-lg font-semibold text-gray-800">
                          {property.property_name}
                        </h2>
                        {/* Address */}
                        <p className="text-sm text-gray-600">
                          {property.address}, {property.city}, {property.state}
                        </p>
                        {/* Price */}
                        <p className="text-blue-500 font-medium mt-2">
                          ${property.price.toLocaleString()}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Google Maps */}
        <div className="map-container">
          <iframe
            src={
              properties.length > 0
                ? `https://www.google.com/maps/embed/v1/search?key=AIzaSyAmtpmge5OnqAfzmyIuSkWLpWrFQkhhz9Y&q=${properties
                    .map((property) => `${property.address}, ${property.city}`)
                    .join("|")}`
                : `https://www.google.com/maps/embed/v1/place?key=AIzaSyAmtpmge5OnqAfzmyIuSkWLpWrFQkhhz9Y&q=Green+Street,+Champaign,+Illinois`
            }
            title="Property Map"
          ></iframe>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
