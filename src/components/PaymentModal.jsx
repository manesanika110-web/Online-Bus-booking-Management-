import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaArrowLeft,
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
  FaCreditCard,
  FaUniversity,
  FaWallet,
  FaMobileAlt,
} from "react-icons/fa";
import "../css/PaymentModal.css";

const PaymentModal = ({ isOpen, onClose, onBack, paymentData }) => {
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [selectedWallet, setSelectedWallet] = useState("PhonePe");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !paymentData) return null;

  const {
    bus,
    selectedSeats = [],
    passenger,
    boardingPoint,
    droppingPoint,
    totalAmount = 0,
    travelDate = "Today",
  } = paymentData;

  const handlePayNow = (e) => {
    if (e) e.preventDefault();

    if (paymentMethod === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        setError("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
        return;
      }
    }

    if (paymentMethod === "card") {
      if (cardNumber.length !== 16 || isNaN(cardNumber)) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardHolder.trim()) {
        setError("Please enter the card holder name.");
        return;
      }
      const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryPattern.test(expiry)) {
        setError("Expiry date must be in MM/YY format.");
        return;
      }
      if (cvv.length !== 3 || isNaN(cvv)) {
        setError("CVV must be 3 digits.");
        return;
      }
    }

    setError("");
    setIsProcessing(true);

    // Simulate safe processing and redirect to booking success
    setTimeout(() => {
      setIsProcessing(false);
      const bookingId = "BUS" + Math.floor(100000 + Math.random() * 900000);
      const bookingDate = new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const selectedMethodName =
        paymentMethod === "upi"
          ? "UPI"
          : paymentMethod === "card"
          ? "Credit Card"
          : paymentMethod === "netbanking"
          ? `Net Banking (${selectedBank})`
          : `Wallet (${selectedWallet})`;

      navigate("/booking-success", {
        state: {
          bus,
          selectedSeats,
          passenger,
          boardingPoint,
          droppingPoint,
          travelDate,
          totalAmount,
          bookingId,
          bookingDate,
          paymentMethod: selectedMethodName,
        },
      });
    }, 1200);
  };

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div
        className="payment-modal-clean-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Back and Close */}
        <div className="payment-modal-top-actions">
          {onBack ? (
            <button
              type="button"
              className="payment-back-btn"
              onClick={onBack}
              title="Back to Passenger Details"
            >
              <FaArrowLeft /> <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            className="clean-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Heading */}
        <h2 className="clean-payment-title">Payment</h2>

        {/* Booking Summary Box matching Image */}
        <div className="clean-booking-summary-card">
          <h3 className="summary-card-heading">Booking Summary</h3>

          <div className="summary-table-list">
            <div className="summary-table-row">
              <span className="row-label">Passenger</span>
              <span className="row-val font-semibold">{passenger?.name || "Passenger"}</span>
            </div>

            <div className="summary-table-row">
              <span className="row-label">Bus</span>
              <span className="row-val font-semibold">{bus?.name || "Bus Service"}</span>
            </div>

            <div className="summary-table-row">
              <span className="row-label">Route</span>
              <span className="row-val font-semibold">
                {bus?.from} → {bus?.to}
              </span>
            </div>

            <div className="summary-table-row">
              <span className="row-label">Seats</span>
              <span className="row-val font-bold text-red">
                {selectedSeats.join(", ") || "1"}
              </span>
            </div>

            <div className="summary-table-row total-highlight-row">
              <span className="row-label font-bold">Total Amount</span>
              <span className="row-val total-price-val">₹ {totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Select Payment Method Section */}
        <div className="payment-methods-section">
          <h3 className="section-title-label">Select Payment Method</h3>

          <div className="payment-radio-options-list">
            {/* 1. UPI */}
            <label
              className={`payment-method-radio-item ${
                paymentMethod === "upi" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setError("");
                }}
              />
              <span className="radio-text">
                <FaMobileAlt className="method-icon red" /> UPI (Google Pay, PhonePe, Paytm)
              </span>
            </label>

            {/* 2. Credit / Debit Card */}
            <label
              className={`payment-method-radio-item ${
                paymentMethod === "card" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setError("");
                }}
              />
              <span className="radio-text">
                <FaCreditCard className="method-icon blue" /> Credit / Debit Card
              </span>
            </label>

            {/* 3. Net Banking */}
            <label
              className={`payment-method-radio-item ${
                paymentMethod === "netbanking" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="netbanking"
                checked={paymentMethod === "netbanking"}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setError("");
                }}
              />
              <span className="radio-text">
                <FaUniversity className="method-icon green" /> Net Banking
              </span>
            </label>

            {/* 4. Wallet */}
            <label
              className={`payment-method-radio-item ${
                paymentMethod === "wallet" ? "selected" : ""
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === "wallet"}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setError("");
                }}
              />
              <span className="radio-text">
                <FaWallet className="method-icon orange" /> Wallet
              </span>
            </label>
          </div>

          {/* Dynamic Payment Method Inputs */}
          <div className="payment-input-drawer-box">
            {/* UPI Option */}
            {paymentMethod === "upi" && (
              <div className="upi-input-group">
                <label className="input-sub-label">Enter UPI ID</label>
                <div className="input-field-wrap">
                  <input
                    type="text"
                    placeholder="example@okaxis"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setError("");
                    }}
                    className="clean-pay-input"
                  />
                </div>
                <div className="quick-upi-chips">
                  {["@okaxis", "@okhdfcbank", "@paytm", "@ybl"].map((suffix) => (
                    <button
                      key={suffix}
                      type="button"
                      className="upi-suffix-chip"
                      onClick={() => {
                        const base = upiId.split("@")[0] || passenger?.mobile || "user";
                        setUpiId(`${base}${suffix}`);
                        setError("");
                      }}
                    >
                      {suffix}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Card Option */}
            {paymentMethod === "card" && (
              <div className="card-inputs-grid">
                <div className="input-field-wrap">
                  <input
                    type="text"
                    placeholder="Card Number (16 Digits)"
                    value={cardNumber}
                    maxLength={16}
                    onChange={(e) =>
                      setCardNumber(e.target.value.replace(/\D/g, ""))
                    }
                    className="clean-pay-input"
                  />
                </div>

                <div className="input-field-wrap">
                  <input
                    type="text"
                    placeholder="Card Holder Name"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="clean-pay-input"
                  />
                </div>

                <div className="card-split-row">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    maxLength={5}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="clean-pay-input"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={cvv}
                    maxLength={3}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, ""))
                    }
                    className="clean-pay-input"
                  />
                </div>
              </div>
            )}

            {/* Net Banking Option */}
            {paymentMethod === "netbanking" && (
              <div className="netbanking-input-group">
                <label className="input-sub-label">Select Your Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="clean-pay-select"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Bank of Maharashtra">Bank of Maharashtra</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Wallet Option */}
            {paymentMethod === "wallet" && (
              <div className="wallet-options-grid">
                {["PhonePe", "Paytm", "Google Pay", "Amazon Pay"].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`wallet-chip-btn ${
                      selectedWallet === w ? "active" : ""
                    }`}
                    onClick={() => setSelectedWallet(w)}
                  >
                    <FaWallet className="wallet-chip-icon" /> {w}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && <div className="clean-payment-error-toast">{error}</div>}

        {/* Safe Badge */}
        <div className="payment-ssl-safe-badge">
          <FaLock className="ssl-lock-icon" />
          <span>256-Bit SSL Encrypted • 100% Safe & Secure</span>
        </div>

        {/* Pay Now Button */}
        <button
          type="button"
          className="clean-pay-now-submit-btn"
          onClick={handlePayNow}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing Secure Payment..." : `Pay Now • ₹ ${totalAmount}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
