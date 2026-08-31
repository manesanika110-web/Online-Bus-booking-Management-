import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import "../css/PassengerDetailsModal.css";

const PassengerDetailsModal = ({
  isOpen,
  onClose,
  bookingData,
  onProceedToPayment,
}) => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [error, setError] = useState("");

  if (!isOpen || !bookingData) return null;

  const {
    bus,
    selectedSeats = [],
    boardingPoint,
    droppingPoint,
    totalAmount = 0,
    travelDate = "Today",
  } = bookingData;

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) {
      setMobile(val);
      setError("");
    }
  };

  const handleAgeChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 3) {
      setAge(val);
      setError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setError("Please enter your Full Name.");
      return;
    }

    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!age || parseInt(age, 10) < 1 || parseInt(age, 10) > 120) {
      setError("Please enter a valid age.");
      return;
    }

    if (!gender) {
      setError("Please select gender.");
      return;
    }

    setError("");

    const paymentPayload = {
      bus,
      selectedSeats,
      boardingPoint,
      droppingPoint,
      travelDate,
      totalAmount,
      passenger: {
        name: fullName.trim(),
        mobile,
        email: email.trim(),
        age: parseInt(age, 10),
        gender,
      },
    };

    if (onProceedToPayment) {
      onProceedToPayment(paymentPayload);
    } else {
      navigate("/payment", {
        state: paymentPayload,
      });
    }
  };

  return (
    <div className="passenger-modal-backdrop" onClick={onClose}>
      <div
        className="passenger-modal-clean-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          type="button"
          className="clean-modal-close-btn"
          onClick={onClose}
          title="Close"
        >
          <FaTimes />
        </button>

        {/* Modal Heading */}
        <h2 className="clean-modal-title">Passenger Details</h2>

        {/* Optional Mini Journey Tag */}
        <div className="clean-modal-journey-pill">
          <span>{bus?.name}</span>
          <span className="dot-sep">•</span>
          <span>Seats: <strong>{selectedSeats.join(", ")}</strong></span>
          <span className="dot-sep">•</span>
          <span>Total: <strong>₹{totalAmount}</strong></span>
        </div>

        {/* Error Notification */}
        {error && <div className="clean-modal-error">{error}</div>}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="clean-passenger-form">
          {/* 1. FULL NAME */}
          <div className="clean-form-group">
            <label className="clean-field-label">FULL NAME</label>
            <input
              type="text"
              placeholder="Enter Full Name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
              }}
              className="clean-text-input"
              required
            />
          </div>

          {/* 2. MOBILE NUMBER */}
          <div className="clean-form-group">
            <label className="clean-field-label">MOBILE NUMBER</label>
            <input
              type="tel"
              placeholder="Enter 10 Digit Mobile Number"
              value={mobile}
              onChange={handleMobileChange}
              maxLength={10}
              className="clean-text-input"
              required
            />
          </div>

          {/* 3. EMAIL */}
          <div className="clean-form-group">
            <label className="clean-field-label">EMAIL</label>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="clean-text-input"
              required
            />
          </div>

          {/* 4. AGE & GENDER ROW */}
          <div className="clean-form-row">
            {/* AGE */}
            <div className="clean-form-group flex-1">
              <label className="clean-field-label">AGE</label>
              <input
                type="text"
                placeholder="Age"
                value={age}
                onChange={handleAgeChange}
                maxLength={3}
                className="clean-text-input"
                required
              />
            </div>

            {/* GENDER */}
            <div className="clean-form-group flex-1">
              <label className="clean-field-label">GENDER</label>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setError("");
                }}
                className="clean-select-input"
                required
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 5. SUBMIT BUTTON */}
          <button type="submit" className="clean-submit-payment-btn">
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default PassengerDetailsModal;
