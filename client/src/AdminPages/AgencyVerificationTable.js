import React, { useEffect, useState } from "react";
import { Table, Button, Tag, message, Spin } from "antd";
import axios from "axios";
import "../styles/RequestVerificationTable.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

const AgencyVerificationTable = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/agencyregister`);
      setAgencies(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch agencies");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/api/agencyregister/${id}/verify`);
      message.success("Agency verified successfully ✅");
      fetchAgencies();
    } catch (err) {
      message.error("Verification failed");
    }
  };

  const toggleActiveStatus = async (id, isActive) => {
    try {
      await axios.put(`${API_BASE_URL}/api/agencyregister/${id}/activate`, {
        isActive: !isActive,
      });
      message.success(
        `Agency ${!isActive ? "activated" : "deactivated"} successfully`
      );
      fetchAgencies();
    } catch (err) {
      message.error("Failed to update active status");
    }
  };

  const columns = [
    {
      title: "Registration ID",
      key: "regId",
      render: (_, __, index) => `AGNC-${String(index + 1).padStart(4, "0")}`,
    },
    {
      title: "Agency Name",
      dataIndex: "firstName",
      key: "firstName",
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
      <h2>Agency Verification Requests</h2>
      {loading ? (
        <Spin size="large" />
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <Table
          columns={columns}
          dataSource={agencies}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
          className="request-verification-table"
        />
      )}
    </div>
  );
};

export default AgencyVerificationTable;
