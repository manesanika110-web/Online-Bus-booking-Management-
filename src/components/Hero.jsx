import React from "react";
import "./../css/Hero.css";
import SearchBox from "./SearchBox";
import { FaShieldAlt, FaTicketAlt, FaHeadset, FaStar } from "react-icons/fa";

function Hero() {
  return (
    <section className="busvista-hero-section">
      <div className="hero-dark-overlay">
        <div className="hero-content-wrapper">
          <div className="hero-badge-pill">
            <FaStar className="star-icon" /> Over 10+ Million Happy Journeys
          </div>

          <h1 className="hero-main-title">
            India's No. 1 Bus Ticket Booking Platform
          </h1>

          <p className="hero-subtitle">
            Fast, secure and verified bus bookings across India
          </p>

          <SearchBox />

          {/* Key Trust Stats / Highlights */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <div className="stat-icon-circle">
                <FaShieldAlt />
              </div>
              <div className="stat-text">
                <strong>100% Safe & Verified</strong>
                <span>Certified Bus Partners</span>
              </div>
            </div>

            <div className="hero-stat-item">
              <div className="stat-icon-circle">
                <FaTicketAlt />
              </div>
              <div className="stat-text">
                <strong>Instant M-Ticket</strong>
                <span>Paperless WhatsApp & SMS</span>
              </div>
            </div>

            <div className="hero-stat-item">
              <div className="stat-icon-circle">
                <FaHeadset />
              </div>
              <div className="stat-text">
                <strong>24/7 Helpline</strong>
                <span>Round-the-clock Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
