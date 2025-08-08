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
//             <th>Registration ID</th>
//             <th>Hospital Name</th>
//             <th>Email</th>
//             <th>Phone</th>
//             <th>Verification</th>
//             <th>Active Status</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {partners.map((partner, index) => (
//             <tr key={partner._id}>
//               <td>{`HOSP-${String(index + 1).padStart(4, "0")}`}</td>
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
import { Table, Button, Tag, message, Spin } from "antd";
import axios from "axios";
import "../styles/RequestVerificationTable.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

const HospitalVerificationTable = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/hospitalregister`);
      setHospitals(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/hospitalregister/${id}/verify`);
      message.success("Hospital verified successfully ✅");
      fetchHospitals();
    } catch (err) {
      message.error("Verification failed");
    }
  };

  const toggleActiveStatus = async (id, isActive) => {
    try {
      await axios.put(`${API_BASE_URL}/api/hospitalregister/${id}/activate`, {
        isActive: !isActive,
      });
      message.success(
        `Hospital ${!isActive ? "activated" : "deactivated"} successfully`
      );
      fetchHospitals();
    } catch (err) {
      message.error("Failed to update active status");
    }
  };

  const columns = [
    {
      title: "Registration ID",
      key: "regId",
      render: (_, __, index) => `HOSP-${String(index + 1).padStart(4, "0")}`,
    },
    {
      title: "Hospital Name",
      dataIndex: "hospitalName",
      key: "hospitalName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Verification",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified) =>
        isVerified ? (
          <Tag color="green">Verified</Tag>
        ) : (
          <Tag color="red">Pending</Tag>
        ),
    },
    {
      title: "Active Status",
      key: "isActive",
      render: (_, record) =>
        record.isVerified ? (
          record.isActive ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="red">Inactive</Tag>
          )
        ) : (
          "-"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) =>
        !record.isVerified ? (
          <Button type="primary" onClick={() => handleVerify(record._id)}>
            Verify
          </Button>
        ) : (
          <Button
            style={{
              backgroundColor: record.isActive ? "#e74c3c" : "#2ecc71",
              color: "white",
              border: "none",
            }}
            onClick={() => toggleActiveStatus(record._id, record.isActive)}
          >
            {record.isActive ? "Deactivate" : "Activate"}
          </Button>
        ),
    },
  ];

  return (
    <div className="request-verification-container">
      <h2>Hospital Verification Requests</h2>
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Table
          columns={columns}
          dataSource={hospitals}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
          className="request-verification-table"
        />
      )}
    </div>
  );
};

export default HospitalVerificationTable;
