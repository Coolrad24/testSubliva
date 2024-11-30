import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { auth } from "./firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./banner.css";

const Banner = () => {
  const [banner, setBanner] = useState(null);
  const [properties, setProperties] = useState([]);
  const [recommendedProperties, setRecommendedProperties] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [visitedPropertyIds, setVisitedPropertyIds] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState([]); // For Google Places suggestions
  const navigate = useNavigate();
  useEffect(() => {
    const handleClickOutside = () => {
      setSuggestions([]);
    };
  
    document.addEventListener("click", handleClickOutside);
  
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  
  // Check login status and fetch user activity if logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);

        try {
          // Fetch the user's visited property IDs
          const { data } = await axios.get(
            `http://localhost:5001/api/userActivity/${user.uid}`
          );
          const visitedIds = data.visitedProperties.slice(0, 5); // Limit to 5 IDs
          setVisitedPropertyIds(visitedIds);
          console.log(visitedIds);
          fetchRecommendations(visitedIds, user.uid); // Fetch recommendations based on history
        } catch (error) {
          console.error("Error fetching user activity:", error);
        }
      } else {
        setIsLoggedIn(false);
      }
    });
    
    return unsubscribe;
  }, []);

  // Fetch property recommendations based on user history
  const fetchRecommendations = async (visitedIds, userId) => {
    try {
      const { data: recommendedData } = await axios.post(
        `http://localhost:5001/api/recommendations/${userId}`,
        { visitedIds }, // Correctly pass visitedIds in the body
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setRecommendedProperties(recommendedData);
      console.log("Recommended properties:", recommendedData);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  // Fetch banner data
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/banner/1")
      .then(({ data }) => setBanner(data))
      .catch((err) => console.error("Error fetching banner:", err));
  }, []);

  // Fetch property details based on visited property IDs
  useEffect(() => {
    if (isLoggedIn && visitedPropertyIds.length > 0) {
      Promise.all(
        visitedPropertyIds.map((id) =>
          axios
            .get(`http://localhost:5001/api/properties/${id}`)
            .then((res) => res.data)
        )
      )
        .then((data) => setProperties(data))
        .catch((err) => console.error("Error fetching properties:", err));
    }
  }, [isLoggedIn, visitedPropertyIds]);

  // Fetch suggestions from Google Places API
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
  // Handle input change with suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    setSuggestions([]);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?city=${encodeURIComponent(searchInput)}`);
    }
  };

  return (
    <>
      {/* Banner Section */}
      {banner && (
        <section
          className="flat-slider home-1"
          style={{ backgroundImage: `url('/images/banner/banner-property-10.jpg')` }}
        ></section>
      )}
     <div className="banner-container">
        {/* Hero Section */}
        <div
          className="hero-section relative"
          style={{
            backgroundImage: `url('/images/banner/banner-property-10.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "100vh", // Full viewport height
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1>Find your place</h1>
            {/* Search Form */}
            <div className="search-container">
              <form
                onSubmit={handleSearch}
                className="flex items-center space-x-3"
                onClick={(e) => e.stopPropagation()} // Prevent click from propagating to the document
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Where should we go?"
                    value={searchInput}
                    onChange={handleInputChange}
                    className="w-full px-5 py-3 text-lg border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-800"
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
                <button
                  type="submit"
                  className="search-button"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>


        <div className="featured-section">
          <div className="section-header">
            <h2>Featured Properties</h2>
            <p>Explore our hand-picked properties</p>
          </div>

          <div className="property-categories">
            <div className="category-card">
              <img src="/images/apartment.jpg" alt="Apartments" />
              <h3>Apartments</h3>
              <p>Find your next apartment</p>
            </div>
            <div className="category-card">
              <img src="/images/house.jpg" alt="Houses" />
              <h3>Houses</h3>
              <p>Discover available houses</p>
            </div>
            <div className="category-card">
              <img src="/images/commercial.jpg" alt="Commercial" />
              <h3>Commercial</h3>
              <p>Browse commercial spaces</p>
            </div>
          </div>
        </div>
        {/* Recommended Properties */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h4 className="text-2xl font-bold text-gray-800">Recommended Properties</h4>
              <p className="text-gray-600 mt-2">Properties you might like based on your views</p>
            </div>
            {isLoggedIn && recommendedProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProperties.map((property) => (
                  <div
                    key={property.property_id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    <a href={`/property/${property.property_id}`} className="block">
                      <div className="relative h-48">
                        <img
                          src={property.featured_image}
                          alt={property.property_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h6 className="text-lg font-bold text-gray-800 truncate">
                          {property.property_name}
                        </h6>
                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {property.address}, {property.city}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-gray-600">No recommendations available at this time.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Banner;
