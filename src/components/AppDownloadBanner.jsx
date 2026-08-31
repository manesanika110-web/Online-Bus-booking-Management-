import React, { useState } from "react";
import { FaMobileAlt, FaGooglePlay, FaApple, FaQrcode, FaCheck, FaPaperPlane } from "react-icons/fa";
import { successAlert } from "../utils/alert";
import "../css/HomeSections.css";

const AppDownloadBanner = () => {
  const [mobileNumber, setMobileNumber] = useState("");

  const handleSendLink = (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) return;
    successAlert(`App download link has been sent to +91 ${mobileNumber} via SMS!`);
    setMobileNumber("");
  };

  return (
    <section className="app-download-section">
      <div className="app-download-container">
        <div className="app-download-content">
          <span className="app-badge-pill">DOWNLOAD THE APP</span>
          <h2>Book Bus Tickets Faster with the Bus Vista App</h2>
          <p>
            Get live bus tracking, exclusive in-app coupons, instant cancellation, and 24/7 priority support right on your phone.
          </p>

          <div className="app-features-checklist">
            <div className="app-check-item">
              <FaCheck className="check-icon" /> Live GPS Bus Tracking
            </div>
            <div className="app-check-item">
              <FaCheck className="check-icon" /> Extra ₹100 OFF on 1st App Booking
            </div>
            <div className="app-check-item">
              <FaCheck className="check-icon" /> Instant WhatsApp Ticket Delivery
            </div>
          </div>

          <form onSubmit={handleSendLink} className="app-sms-form">
            <div className="sms-input-box">
              <span className="country-code">+91</span>
              <input
                type="tel"
                placeholder="Enter 10-digit Mobile Number"
                value={mobileNumber}
                maxLength={10}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <button type="submit" className="sms-send-btn">
              <FaPaperPlane /> Get App Link
            </button>
          </form>

          <div className="store-buttons-row">
            <button className="store-badge-btn" onClick={() => successAlert("Redirecting to Google Play Store...")}>
              <FaGooglePlay className="store-icon" />
              <div className="store-btn-text">
                <small>GET IT ON</small>
                <strong>Google Play</strong>
              </div>
            </button>

            <button className="store-badge-btn" onClick={() => successAlert("Redirecting to Apple App Store...")}>
              <FaApple className="store-icon" />
              <div className="store-btn-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </button>
          </div>
        </div>

        <div className="app-download-qr-box">
          <div className="qr-card">
            <FaQrcode className="qr-code-graphic" />
            <p>Scan QR to Download App instantly</p>
            <span className="rating-pill">⭐ 4.8 / 5 Rated on App Stores</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadBanner;
