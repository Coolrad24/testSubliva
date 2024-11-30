import React, { useEffect, useRef, useState } from "react";

const MapWithMarkers = ({ properties }) => {
  const mapRef = useRef(null);
  const [geocodedProperties, setGeocodedProperties] = useState([]);

  useEffect(() => {
    const geocodeAddress = async (address) => {
      return new Promise((resolve, reject) => {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve({
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          } else {
            console.error(`Geocode error: ${status}`);
            reject(`Geocode error: ${status}`);
          }
        });
      });
    };

    const fetchGeocodedProperties = async () => {
      try {
        const geocoded = await Promise.all(
          properties.map(async (property) => {
            const { address, city } = property;
            const location = await geocodeAddress(`${address}, ${city}`);
            return { ...property, latitude: location.lat, longitude: location.lng };
          })
        );
        setGeocodedProperties(geocoded);
      } catch (error) {
        console.error(error);
      }
    };

    if (properties.length > 0) fetchGeocodedProperties();
  }, [properties]);

  useEffect(() => {
    if (geocodedProperties.length === 0) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: geocodedProperties.length
        ? { lat: geocodedProperties[0].latitude, lng: geocodedProperties[0].longitude }
        : { lat: 40.1164, lng: -88.2434 }, // Default to Champaign, IL
      zoom: 13,
    });

    geocodedProperties.forEach((property) => {
      const marker = new window.google.maps.Marker({
        position: { lat: property.latitude, lng: property.longitude },
        map,
        title: property.property_name,
      });

      marker.addListener("click", () => {
        window.location.href = `/property/${property.id}`;
      });
    });
  }, [geocodedProperties]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg shadow-md"
      style={{ minHeight: "400px" }}
    ></div>
  );
};

export default MapWithMarkers;
