// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "../styles/RequestVerificationTable.css";

// const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

// const RequestVerificationTable = () => {
//   const [partners, setPartners] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchPartners();
//   }, []);

//   const fetchPartners = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(`${API_BASE_URL}/api/hospitalregister`);
//       setPartners(res.data);
//       setError("");
//     } catch (err) {
//       setError("Failed to fetch partners");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerify = async (id) => {
//     try {
//       await axios.put(`${API_BASE_URL}/api/hospitalregister/${id}/verify`);
//       alert("Hospital verified successfully ✅");
//       fetchPartners();
//     } catch (err) {
//       alert("Verification failed");
//     }
//   };

//   const toggleActiveStatus = async (id, isActive) => {
//     try {
//       await axios.put(`${API_BASE_URL}/api/hospitalregister/${id}/activate`, {
//         isActive: !isActive,
//       });
//       alert(`Hospital ${!isActive ? "activated" : "deactivated"} successfully`);
//       fetchPartners();
//     } catch (err) {
//       alert("Failed to update active status");
//     }
//   };

//   return (
//     <div className="request-verification-container">
//       <h2>Hospital Verification Requests</h2>
//       {loading && <p>Loading...</p>}
//       {error && <p style={{ color: "red" }}>{error}</p>}

//       <table className="request-verification-table">
//         <thead>
//           <tr>
//             <th>Hospital Name</th>
//             <th>Email</th>
//             <th>Phone</th>
//             <th>Verification</th>
//             <th>Active Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {partners.map((partner) => (
//             <tr key={partner._id}>
//               <td>{partner.hospitalName}</td>
//               <td>{partner.email}</td>
//               <td>{partner.phone}</td>
//               <td>{partner.isVerified ? "✅ Verified" : "❌ Pending"}</td>
//               <td>
//                 {partner.isVerified
//                   ? partner.isActive
//                     ? "🟢 Active"
//                     : "🔴 Inactive"
//                   : "-"}
//               </td>
//               <td>
//                 {!partner.isVerified ? (
//                   <button onClick={() => handleVerify(partner._id)}>
//                     Verify
//                   </button>
//                 ) : (
//                   <button
//                     style={{
//                       backgroundColor: partner.isActive ? "#e74c3c" : "#2ecc71",
//                       color: "white",
//                       padding: "5px 10px",
//                       border: "none",
//                       cursor: "pointer",
//                     }}
//                     onClick={() =>
//                       toggleActiveStatus(partner._id, partner.isActive)
//                     }
//                   >
//                     {partner.isActive ? "Deactivate" : "Activate"}
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default RequestVerificationTable;

import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/RequestVerificationTable.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

const RequestVerificationTable = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/hospitalregister`);
      setPartners(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch partners");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/hospitalregister/${id}/verify`);
      alert("Hospital verified successfully ✅");
      fetchPartners();
    } catch (err) {
      alert("Verification failed");
    }
  };

  const toggleActiveStatus = async (id, isActive) => {
    try {
      await axios.put(`${API_BASE_URL}/api/hospitalregister/${id}/activated`, {
        isActive: !isActive,
      });
      alert(`Hospital ${!isActive ? "activated" : "deactivated"} successfully`);
      fetchPartners();
    } catch (err) {
      alert("Failed to update active status");
    }
  };

  return (
    <div className="request-verification-container">
      <h2>Hospital Verification Requests</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <table className="request-verification-table">
        <thead>
          <tr>
            <th>Registration ID</th>
            <th>Hospital Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Verification</th>
            <th>Active Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner, index) => (
            <tr key={partner._id}>
              <td>{`HOSP-${String(index + 1).padStart(4, "0")}`}</td>
              <td>{partner.hospitalName}</td>
              <td>{partner.email}</td>
              <td>{partner.phone}</td>
              <td>{partner.isVerified ? "✅ Verified" : "❌ Pending"}</td>
              <td>
                {partner.isVerified
                  ? partner.isActive
                    ? "🟢 Active"
                    : "🔴 Inactive"
                  : "-"}
              </td>
              <td>
                {!partner.isVerified ? (
                  <button onClick={() => handleVerify(partner._id)}>
                    Verify
                  </button>
                ) : (
                  <button
                    style={{
                      backgroundColor: partner.isActive ? "#e74c3c" : "#2ecc71",
                      color: "white",
                      padding: "5px 10px",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      toggleActiveStatus(partner._id, partner.isActive)
                    }
                  >
                    {partner.isActive ? "Deactivate" : "Activate"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestVerificationTable;
