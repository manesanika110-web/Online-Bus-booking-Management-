import React, { useState } from "react";
import {
  FaStar,
  FaMapMarkerAlt,
  FaCamera,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import InCardSeatSelection from "./InCardSeatSelection";
import "../css/SearchResults.css";

const BusCardModern = ({
  bus,
  travelDate,
  onOpenPhotos,
  onOpenBusDetails,
  onOpenPassengerDetails,
}) => {
  const [seatsOpen, setSeatsOpen] = useState(false);

  const toggleSeatsSelection = () => {
    setSeatsOpen((prev) => !prev);
  };

  const handleDetailsClick = () => {
    if (onOpenBusDetails) {
      onOpenBusDetails(bus);
    }
  };

  return (
    <div className="modern-bus-card-container">
      {/* 1. Top Assured / Discount Ribbon Banner */}
      {bus.isAssured && (
        <div className="bus-card-top-banner">
          <div className="assured-badge">
            <span className="shield-icon">🛡️</span>
            <span className="assured-text">Vista Assured</span>
          </div>
          {bus.offerCode && (
            <div className="banner-offer-promo">
              <span>
                Upto ₹{bus.discount || 50} off. Code:
                <strong>{bus.offerCode}</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. Main Bus Card Body */}
      <div className="bus-card-main-content">
        {/* Left Column: Operator & Timing */}
        <div className="bus-info-left-col">
          {/* Operator Meta */}
          <div className="operator-header-row">
            <h3 className="operator-title">{bus.name}</h3>
            <span className="operator-bus-type">{bus.type}</span>
            {bus.routeOrigin && (
              <span className="route-origin-note">{bus.routeOrigin}</span>
            )}
          </div>

          {/* Time & Duration Bar */}
          <div className="bus-timing-schedule-row">
            {/* Departure */}
            <div className="schedule-node departure-node">
              <span className="node-time-text">
                {bus.departureTime24 || bus.departure.split(" ")[0]}
              </span>
              <span className="node-station-name">{bus.from}</span>
            </div>

            {/* Duration Line */}
            <div className="schedule-duration-line">
              <span className="duration-line-bar"></span>
              <span className="duration-pill-tag">{bus.duration}</span>
            </div>

            {/* Arrival */}
            <div className="schedule-node arrival-node">
              <span className="node-time-text">{bus.arrival.split(" ")[0]}</span>
              <span className="node-station-name">{bus.to}</span>
            </div>
          </div>

          {/* Single Berth Indicator Note */}
          {bus.singleBerthInfo && bus.singleBerthInfo !== "None" && (
            <div className="single-berth-badge-row">
              <span className="berth-note-pill">{bus.singleBerthInfo}</span>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Select Seats Action */}
        <div className="bus-pricing-right-col">
          <div className="pricing-meta-box">
            {bus.discount > 0 && (
              <div className="discount-strike-row">
                <span className="save-amount-tag">Save ₹{bus.discount}</span>
                <span className="original-price-strike">
                  ₹{bus.originalPrice || bus.price + bus.discount}
                </span>
              </div>
            )}
            <div className="final-price-row">
              <span className="from-label">From</span>
              <span className="final-price-value">₹{bus.price}</span>
            </div>
          </div>

          {/* Select Seats / Hide Seats Toggle Button */}
          <button
            className={`select-seats-action-btn ${seatsOpen ? "hide-seats-btn" : ""}`}
            onClick={toggleSeatsSelection}
          >
            {seatsOpen ? "Hide Seats" : "Select Seats"}
          </button>

          {/* Seats Left Badge */}
          <div className="seats-remaining-indicator">
            <span className="seats-count-pill">💺 {bus.seats} Seats Left</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Features, Rating & Details Trigger Strip */}
      <div className="bus-card-bottom-strip">
        <div className="features-left-group">
          {/* Rating Pill */}
          <div className="card-rating-pill">
            <span className="rating-score">
              <FaStar className="star-icon" /> {bus.rating}
            </span>
            <span className="rating-divider"></span>
            <span className="reviewers-count">
              <FaUsers className="users-icon" /> {bus.reviewsCount || 450}
            </span>
          </div>

          {/* Boarding / Dropping Pin */}
          <div
            className="feature-icon-badge"
            title="Verified Boarding & Dropping Points"
          >
            <FaMapMarkerAlt />
          </div>

          {/* Bus Age Badge */}
          {bus.busAge && (
            <span className="meta-pill-tag bus-age-pill">🚌 {bus.busAge}</span>
          )}

          {/* Bus Safety Check Badge */}
          {bus.hasSafetyCheck && (
            <span className="meta-pill-tag safety-check-pill">
              <FaCheckCircle className="check-icon" /> Bus Safety Check
            </span>
          )}

          {/* Photos Button */}
          <button className="card-photos-btn" onClick={() => onOpenPhotos(bus)}>
            <FaCamera /> Photos
          </button>
        </div>

        {/* Bus Details Right-Side Drawer Trigger */}
        <div className="details-right-trigger">
          <button
            className="toggle-details-btn"
            onClick={handleDetailsClick}
          >
            <span>Bus details</span>
            <FaChevronDown />
          </button>
        </div>
      </div>

      {/* 4. In-Card Interactive Seat Selection Layout (Opens right below card) */}
      {seatsOpen && (
        <InCardSeatSelection
          bus={bus}
          travelDate={travelDate}
          onClose={() => setSeatsOpen(false)}
          onProceedBooking={(data) => {
            if (onOpenPassengerDetails) {
              onOpenPassengerDetails(data);
            }
          }}
        />
      )}
    </div>
  );
};

export default BusCardModern;
