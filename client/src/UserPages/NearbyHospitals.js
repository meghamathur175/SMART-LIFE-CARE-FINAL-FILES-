import React, { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/NearbyHospitals.css";

const libraries = ["places"];
const ITEMS_PER_PAGE = 20;
const SEARCH_RADIUS_METERS = 7000;

function NearbyHospitalsList() {
  const { state } = useLocation();
  const pickupLocation = state?.pickup || "";
  const hospitalType = state?.hospitalType || "All";
  const navigate = useNavigate();

  const [navigating, setNavigating] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const containerRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const enrichHospitals = useCallback(async (hospitalsList, originLocation) => {
    const directionsService = new window.google.maps.DirectionsService();

    const enrichedList = await Promise.all(
      hospitalsList.map(
        (hospital) =>
          new Promise((resolve) => {
            directionsService.route(
              {
                origin: originLocation,
                destination: hospital.geometry.location,
                travelMode: "DRIVING",
              },
              (result, status) => {
                if (status === "OK" && result?.routes?.[0]?.legs?.[0]) {
                  const leg = result.routes[0].legs[0];
                  let km = 0;
                  const distanceText = leg.distance.text;

                  if (distanceText.includes("km")) {
                    km = parseFloat(parseFloat(distanceText.replace(/,/g, "").replace("km", "").trim()).toFixed(2));
                  } else if (distanceText.includes("m")) {
                    const meters = parseFloat(distanceText.replace(/,/g, "").replace("m", "").trim());
                    km = parseFloat((meters / 1000).toFixed(2));
                  }

                  if (km <= 7) {
                    resolve({
                      ...hospital,
                      distance: isNaN(km) ? "N/A" : `${km.toFixed(2)} km`,
                      duration: leg.duration.text,
                      cost: isNaN(km) ? "N/A" : `₹${Math.ceil(km * 45)}`,
                    });
                  } else {
                    resolve(null);
                  }
                } else {
                  resolve({
                    ...hospital,
                    distance: "N/A",
                    duration: "N/A",
                    cost: "N/A",
                  });
                }
              }
            );
          })
      )
    );

    return enrichedList.filter((h) => h != null);
  }, []);

  const searchByAddress = useCallback(() => {
    if (!pickupLocation.trim()) {
      setError("Pickup location is not provided.");
      return;
    }

    if (!containerRef.current) {
      setError("Map container not ready yet, please wait.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchInitiated(true);

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: pickupLocation }, (results, status) => {
      if (status === "OK" && results[0]) {
        const location = results[0].geometry.location;
        const request = {
          location,
          radius: SEARCH_RADIUS_METERS,
          type: "hospital",
        };

        const allHospitals = [];

        const fetchHospitals = (service, request, location) => {
          const processPage = (results, status, pagination) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.length) {
              const openHospitals = results.filter(
                (h) =>
                  h.business_status !== "CLOSED_TEMPORARILY" &&
                  h.business_status !== "CLOSED_PERMANENTLY" &&
                  !h.permanently_closed
              );

              allHospitals.push(...openHospitals);

              if (pagination && pagination.hasNextPage) {
                setTimeout(() => pagination.nextPage(), 2000);
              } else {
                const filtered = hospitalType === "All"
                  ? allHospitals
                  : allHospitals.filter((h) =>
                      h.name?.toLowerCase().includes(hospitalType.toLowerCase())
                    );

                enrichHospitals(filtered, location)
                  .then((enriched) => {
                    if (enriched.length === 0) {
                      setError("No hospitals found within 7 km driving distance.");
                      setHospitals([]);
                    } else {
                      setHospitals(enriched);
                    }
                    setLoading(false);
                  })
                  .catch(() => {
                    setError("Failed to enrich hospital data.");
                    setLoading(false);
                  });
              }
            } else {
              setHospitals([]);
              setLoading(false);
              setError("No hospitals found nearby.");
            }
          };

          service.nearbySearch(request, processPage);
        };

        const service = new window.google.maps.places.PlacesService(containerRef.current);
        fetchHospitals(service, request, location);
      } else {
        setLoading(false);
        setHospitals([]);
        setError("Pickup location not found. Please check the location.");
      }
    });
  }, [pickupLocation, enrichHospitals, hospitalType]);

  const navigateToBookAmbulancePage = (hospital) => {
    if (navigating) return;
    setNavigating(true);

    setTimeout(() => {
      const hospitalData = {
        place_id: hospital.place_id,
        name: hospital.name,
        vicinity: hospital.vicinity,
        distance: hospital.distance,
        duration: hospital.duration,
        cost: hospital.cost,
        rating: hospital.rating,
        geometry: {
          location: {
            lat: hospital.geometry.location.lat(),
            lng: hospital.geometry.location.lng(),
          },
        },
      };

      navigate("/nearby-hospitals/book-ambulance", {
        state: {
          hospital: hospitalData,
          pickupLocation,
          destAddress: hospital.vicinity,
        },
      });
    }, 1000);
  };

  useEffect(() => {
    if (pickupLocation && isLoaded && !searchInitiated) {
      searchByAddress();
    }
  }, [pickupLocation, isLoaded, searchInitiated, searchByAddress]);

  if (loadError)
    return (
      <div className="hospitals-container">
        <h2>Error loading Google Maps API</h2>
      </div>
    );

  const totalPages = Math.ceil(hospitals.length / ITEMS_PER_PAGE);
  const paginatedHospitals = hospitals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="hospitals-container">
      <h2>Nearby Hospitals</h2>
      <p>
        <strong>Pickup Location:</strong> {pickupLocation || "Not provided"}
      </p>

      <div ref={containerRef} style={{ display: "none" }} />

      {loading && <p>Loading nearby hospitals...</p>}
      {error && !loading && <p className="error-message">{error}</p>}

      {!loading && paginatedHospitals.length > 0 && (
        <ul className="hospital-list">
          {paginatedHospitals.map((hospital) => (
            <li
              key={hospital.place_id}
              className={`hospital-card ${navigating ? "disabled" : ""}`}
              onClick={() => !navigating && navigateToBookAmbulancePage(hospital)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !navigating) {
                  navigateToBookAmbulancePage(hospital);
                }
              }}
              aria-disabled={navigating}
            >
              <h3>{hospital.name}</h3>
              <div className="hospital-details">
                <p className="hospital-detail">
                  <span className="label">Address:</span> <span className="value">{hospital.vicinity || "Not Available"}</span>
                </p>
                <p className="hospital-detail">
                  <span className="label">Distance:</span> <span className="value">{hospital.distance}</span>
                </p>
                <p className="hospital-detail">
                  <span className="label">Time:</span> <span className="value">{hospital.duration}</span>
                </p>
                <p className="hospital-detail">
                  <span className="label">Cost:</span> <span className="value">{hospital.cost}</span>
                </p>
                <p className="hospital-detail">
                  <span className="label">Rating:</span> <span className="value">{hospital.rating || "Not Available"}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && hospitals.length > 0 && (
        <div className="pagination">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            ◀ Prev
          </button>
          {Array.from({ length: totalPages }, (_, idx) => (
            <button
              key={idx}
              className={`page-btn ${currentPage === idx + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(idx + 1)}
            >
              {idx + 1}
            </button>
          ))}
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next ▶
          </button>
        </div>
      )}

      {!loading && searchInitiated && hospitals.length === 0 && !error && (
        <p>No hospitals found. Try a different location.</p>
      )}

      {navigating && (
        <div className="overlay" role="alert" aria-live="assertive">
          <div className="spinner" aria-label="Navigating to booking page"></div>
          <p>Redirecting to booking page...</p>
        </div>
      )}
    </div>
  );
}

export default NearbyHospitalsList;
