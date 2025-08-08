import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HospitalRegister.css";
import axios from "axios";

const AgencyRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    age: "",
    email: "",
    licenseNumber: "",
    phone: "",
    password: "",
    ambulancePlate: "",
    vehicleType: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const vehicleOptions = [
    "Basic Life Support (No oxygen cylinder) - ₹500",
    "Advanced Life Support (With oxygen, medical equipment, trained staff) - ₹1000",
    "Critical Care Ambulance (Ambulance with doctor) - ₹1500",
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.age || isNaN(formData.age) || formData.age < 18)
      newErrors.age = "Valid age (18+) is required";
    if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!formData.licenseNumber.trim())
      newErrors.licenseNumber = "License number is required";
    if (!/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Phone must be exactly 10 digits";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (!formData.ambulancePlate.trim())
      newErrors.ambulancePlate = "Ambulance plate number is required";
    if (!formData.vehicleType)
      newErrors.vehicleType = "Vehicle type is required";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSuccessMessage("");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/agencyregister/register",
        { ...formData, status: "pending" }
      );

      setSuccessMessage(response.data.message);
      setErrors({});
      setFormData({
        firstName: "",
        age: "",
        email: "",
        licenseNumber: "",
        phone: "",
        password: "",
        ambulancePlate: "",
        vehicleType: "",
      });

      alert("Registration successful! Please wait for admin approval.");
      navigate("/agency-login");
    } catch (err) {
      const apiError =
        err.response?.data?.message || "Registration failed. Try again.";
      setErrors({ api: apiError });
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: "2rem" }}>
      <h2>Agency Registration</h2>

      <form onSubmit={handleSubmit}>
        {[
          { name: "firstName", label: "First Name" },
          { name: "age", label: "Age" },
          { name: "email", label: "Email" },
          { name: "licenseNumber", label: "License Number" },
          { name: "phone", label: "Phone" },
          { name: "password", label: "Password", type: "password" },
          { name: "ambulancePlate", label: "Ambulance Plate Number" },
        ].map((field) => (
          <div key={field.name} style={{ marginBottom: "1rem" }}>
            <label>{field.label}</label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
            />
            {errors[field.name] && (
              <p style={{ color: "red", marginTop: "0.3rem" }}>
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}

        <div style={{ marginBottom: "1rem" }}>
          <label>Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.3rem" }}
          >
            <option value="">Select Vehicle Type</option>
            {vehicleOptions.map((option, idx) => (
              <option key={idx} value={option}>
                {option}
              </option>
            ))}
          </select>
          {errors.vehicleType && (
            <p style={{ color: "red", marginTop: "0.3rem" }}>
              {errors.vehicleType}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {errors.api && (
          <p style={{ color: "red", marginTop: "1rem" }}>{errors.api}</p>
        )}

        {successMessage && (
          <p style={{ color: "green", marginTop: "1rem" }}>{successMessage}</p>
        )}
      </form>
    </div>
  );
};

export default AgencyRegister;
