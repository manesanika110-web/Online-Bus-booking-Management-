import React from "react";
import { useNavigate } from "react-router-dom"; // रिएक्ट राउटर नेव्हिगेशनसाठी
import { FaShieldAlt, FaRupeeSign, FaBus } from "react-icons/fa"; // प्रोफेशनल आयकॉन्स
import "../css/AboutUs.css";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="about-step-card">
      <div className="about-header-banner">
        <h3> ABOUT US</h3>
      </div>
      <div className="about-body-content">
        <h4>About Us</h4>
        <div className="image-placeholder-box">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=500&q=80"
            alt="Bus"
          />
        </div>
        <p className="about-description-text">
          We are committed to make your journey comfortable and memorable. Book
          bus tickets online with ease and hassle-free.
        </p>
        <div className="highlights-badges-row">
          <span className="badge-item">🛡️ Safe journey</span>
          <span className="badge-item">💰 Affordable Prices</span>
          <span className="badge-item">🚌 Premium Fleet</span>
        </div>
        <button
          className="btn-contact-redirect"
          onClick={() => navigate("/contact-us")}
        >
          Contact Us
        </button>
      </div>
    </div>
  );
};

export default AboutUs;
