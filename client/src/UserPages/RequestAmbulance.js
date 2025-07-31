import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RequestAmbulance.css";

function RequestAmbulance() {
  const pickupRef = useRef(null);
  const destinationRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const destinationMarkerRef = useRef(null);
  const navigate = useNavigate();

  const [navigating, setNavigating] = useState(false);
  const [showRequestTypeModal, setShowRequestTypeModal] = useState(false);
  const [showHospitalTypeModal, setShowHospitalTypeModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [showDestinationForm, setShowDestinationForm] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [hospitalType, setHospitalType] = useState("");
  const [destinationCoords, setDestinationCoords] = useState(null);

  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const geocoderRef = useRef(null);

  useEffect(() => {
    const initializeMap = () => {
      const mapElement = document.getElementById("map");
      if (!window.google || !mapElement || !pickupRef.current) {
        console.error("Google Maps initialization error.");
        return;
      }

      new window.google.maps.places.Autocomplete(pickupRef.current, {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      });

      const map = new window.google.maps.Map(mapElement, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });

      mapRef.current = map;
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
      });
      geocoderRef.current = new window.google.maps.Geocoder();
    };

    const loadScript = () => {
      if (window.google?.maps?.places) return initializeMap();

      const existingScript = document.querySelector(
        "script[src*='maps.googleapis']"
      );
      if (existingScript) {
        existingScript.addEventListener("load", initializeMap);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => console.error("Failed to load Google Maps script.");
      document.body.appendChild(script);
    };

    loadScript();

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, []);

  useEffect(() => {
    if (!window.google || !destinationRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      destinationRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "in" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        alert("Please select a valid destination.");
        return;
      }

      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setDestinationCoords(location);

      if (mapRef.current) {
        mapRef.current.setCenter(location);
        mapRef.current.setZoom(15);

        if (destinationMarkerRef.current)
          destinationMarkerRef.current.setMap(null);

        destinationMarkerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapRef.current,
          title: "Destination",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          },
        });
      }
    });
  }, [showDestinationForm]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latLng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        if (mapRef.current) {
          mapRef.current.setCenter(latLng);
          mapRef.current.setZoom(15);

          if (markerRef.current) markerRef.current.setMap(null);

          markerRef.current = new window.google.maps.Marker({
            position: latLng,
            map: mapRef.current,
            title: "Your Location",
          });
        }

        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location: latLng }, (results, status) => {
            if (status === "OK" && results[0]) {
              pickupRef.current.value = results[0].formatted_address;
            } else {
              alert("Unable to find address for your location.");
            }
          });
        }
      },
      (error) => {
        console.error(error);
        alert("Unable to fetch your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startRequestFlow = () => {
    if (!pickupRef.current.value.trim()) {
      alert("Please enter a pickup location.");
      return;
    }
    setShowRequestTypeModal(true);
  };

  const handleRequestTypeSelection = (type) => {
    setRequestType(type);
    setShowRequestTypeModal(false);
    setShowHospitalTypeModal(true);
  };

  const handleHospitalTypeSelection = (type) => {
    setHospitalType(type);
    setShowHospitalTypeModal(false);

    if (requestType === "Within Station") {
      setShowRadiusModal(true);
    } else {
      setShowDestinationForm(true);
    }
  };

  const handleRadiusSelection = (radius) => {
    setShowRadiusModal(false);
    triggerNavigate(radius);
  };

  const handleSubmitDestination = () => {
    const destination = destinationRef.current.value.trim();
    if (!destination) return alert("Please enter a destination.");
    triggerNavigate(null, destination);
  };

  const triggerNavigate = (radius = null, destination = null) => {
    setNavigating(true);

    const state = {
      pickup: pickupRef.current.value.trim(),
      requestType,
      hospitalType,
    };

    if (radius) state.radius = radius;
    if (destination) state.destination = destination;

    const redirectTo =
      requestType === "Out of Station" ? "/available-drivers" : "/nearby-hospitals";

    setTimeout(() => {
      navigate(redirectTo, { state });
    }, 1000);
  };

  return (
    <div className="request-layout">
      <div className="content-container">
        <div className="map-section">
          <div id="map"></div>
        </div>

        <div className="form-section">
          <div className="form-box">
            <h2>Find Nearby Ambulance Services 🚑</h2>
            <input
              ref={pickupRef}
              type="text"
              placeholder="Enter Pickup Location"
              required
              autoComplete="off"
            />
            <button className="primary-btn" onClick={handleUseCurrentLocation}>
              Use My Current Location
            </button>

            {navigating && (
              <div className="request-overlay">
                <div className="request-spinner"></div>
                <p>Redirecting...</p>
              </div>
            )}

            <button className="primary-btn" onClick={startRequestFlow}>
              See Nearby Services
            </button>
          </div>
        </div>
      </div>

      {showRequestTypeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Select Request Type</h3>
            <div className="hospital-type-grid">
              {["Within Station", "Out of Station"].map((type) => (
                <button
                  key={type}
                  onClick={() => handleRequestTypeSelection(type)}
                  className="hospital-type-btn"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showHospitalTypeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Select Hospital Type</h3>
            <div className="hospital-type-grid">
              {["Accident", "Cardiac", "Maternity", "Pediatric", "General"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleHospitalTypeSelection(type)}
                    className="hospital-type-btn"
                  >
                    {type}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {showRadiusModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Select Radius</h3>
            <div className="hospital-type-grid">
              {[10, 30, 50].map((km) => (
                <button
                  key={km}
                  onClick={() => handleRadiusSelection(km)}
                  className="hospital-type-btn"
                >
                  {km} KM
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showDestinationForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enter Destination</h3>
            <input
              ref={destinationRef}
              type="text"
              placeholder="Enter destination..."
              className="destination-input"
              style={{ marginBottom: "1rem" }}
            />
            <button
              onClick={handleSubmitDestination}
              className="hospital-type-btn"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RequestAmbulance;
