import React from "react";
import {
  FaTimes,
  FaStar,
  FaBus,
  FaMapMarkerAlt,
  FaClock,
  FaRupeeSign,
  FaCheckCircle,
  FaShieldAlt,
  FaArrowRight,
  FaWifi,
  FaUsers,
} from "react-icons/fa";
import "../css/BusDetailsRightDrawer.css";

const BusDetailsRightDrawer = ({ isOpen, onClose, bus }) => {
  if (!isOpen || !bus) return null;

  const defaultPhoto =
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80";
  const busPhoto = bus.photos && bus.photos.length > 0 ? bus.photos[0] : defaultPhoto;

  const boardingPoints = bus.boardingPoints || [
    { time: bus.departure || "02:45 AM", location: `${bus.from} Main Stand`, landmark: "Opp. City Bus Station" },
    { time: "03:15 AM", location: `${bus.from} Bypass Highway`, landmark: "Near Toll Plaza Overbridge" },
  ];

  const droppingPoints = bus.droppingPoints || [
    { time: bus.arrival || "08:30 AM", location: `${bus.to} Gandhi Circle`, landmark: "Near Taxi Stand" },
    { time: "09:00 AM", location: `${bus.to} Main Terminal Stand`, landmark: "Platform No. 4" },
  ];

  const amenitiesList = bus.amenities || [
    "AC Climate Control",
    "Charging Point",
    "Clean Blanket & Pillow",
    "Water Bottle",
    "Reading Light",
    "Emergency Exit",
    "Live GPS Tracking",
  ];

  return (
    <div className="bus-drawer-backdrop" onClick={onClose}>
      <div
        className="bus-details-right-drawer clean-details-drawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header */}
        <div className="drawer-header-section">
          <button className="drawer-close-circle-btn" onClick={onClose} title="Close">
            <FaTimes />
          </button>
          <h3 className="drawer-heading-title">Bus Details</h3>
        </div>

        {/* 2. Scrollable Body Content with Main Bus Info */}
        <div className="drawer-clean-body">
          {/* Operator Meta Header */}
          <div className="clean-operator-header">
            <div className="operator-text-group">
              <h2 className="clean-bus-name">{bus.name}</h2>
              <p className="clean-bus-type">{bus.type}</p>
              {bus.routeOrigin && (
                <span className="clean-route-hint">{bus.routeOrigin}</span>
              )}
            </div>
            <div className="clean-rating-badge">
              <FaStar className="star-icon" />
              <span>{bus.rating || 4.7}</span>
              <small>({bus.reviewsCount || 450})</small>
            </div>
          </div>

          {/* Bus Photo Banner */}
          <div className="clean-bus-photo-card">
            <img src={busPhoto} alt={bus.name} />
            <div className="photo-route-overlay">
              <span>{bus.from} ➔ {bus.to}</span>
            </div>
          </div>

          {/* Schedule & Timing Box */}
          <div className="clean-schedule-card">
            <div className="schedule-time-block">
              <span className="time-val">{bus.departureTime24 || bus.departure?.split(" ")[0]}</span>
              <span className="city-val">{bus.from}</span>
              <small className="schedule-badge">Departure</small>
            </div>

            <div className="schedule-mid-duration">
              <span className="duration-text">{bus.duration || "05h 45m"}</span>
              <div className="duration-line-arrow">
                <span className="dot"></span>
                <span className="line"></span>
                <FaArrowRight className="arrow" />
              </div>
              <span className="route-type-tag">Direct Service</span>
            </div>

            <div className="schedule-time-block text-right">
              <span className="time-val">{bus.arrival?.split(" ")[0]}</span>
              <span className="city-val">{bus.to}</span>
              <small className="schedule-badge">Arrival</small>
            </div>
          </div>

          {/* Pricing & Seats Overview */}
          <div className="clean-price-seats-row">
            <div className="fare-box">
              <span className="fare-label">Ticket Fare</span>
              <div className="fare-val-group">
                <strong className="final-fare">₹ {bus.price}</strong>
                {bus.discount > 0 && (
                  <span className="strike-fare">
                    ₹{bus.originalPrice || bus.price + bus.discount}
                  </span>
                )}
              </div>
            </div>

            <div className="seats-box">
              <span className="seats-label">Availability</span>
              <strong className="seats-available-tag">
                💺 {bus.seats} Seats Left
              </strong>
            </div>
          </div>

          {/* Boarding Points Section */}
          <div className="clean-info-section">
            <h4 className="section-title-sm">
              <FaMapMarkerAlt className="section-icon red" /> Boarding Points ({bus.from})
            </h4>
            <div className="points-timeline">
              {boardingPoints.map((bp, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-bullet"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{bp.location}</strong>
                      <span className="point-time">{bp.time}</span>
                    </div>
                    <p className="point-subtext">{bp.landmark || bp.contact || "Main Highway Stand"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dropping Points Section */}
          <div className="clean-info-section">
            <h4 className="section-title-sm">
              <FaMapMarkerAlt className="section-icon green" /> Dropping Points ({bus.to})
            </h4>
            <div className="points-timeline">
              {droppingPoints.map((dp, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-bullet drop"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{dp.location}</strong>
                      <span className="point-time drop">{dp.time}</span>
                    </div>
                    <p className="point-subtext">{dp.landmark || dp.contact || "Central Bus Terminal"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Amenities Section */}
          <div className="clean-info-section">
            <h4 className="section-title-sm">
              <FaShieldAlt className="section-icon blue" /> Amenities Provided
            </h4>
            <div className="clean-amenities-grid">
              {amenitiesList.map((item, idx) => (
                <div key={idx} className="amenity-chip-item">
                  <FaCheckCircle className="amenity-check" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy Table */}
          <div className="clean-info-section">
            <h4 className="section-title-sm">
              <FaClock className="section-icon orange" /> Cancellation & Refund Policy
            </h4>
            <table className="clean-policy-table">
              <thead>
                <tr>
                  <th>Cancellation Time</th>
                  <th>Refund Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Before 24 hours of departure</td>
                  <td><span className="refund-high">90% Refund</span></td>
                </tr>
                <tr>
                  <td>Between 12 to 24 hours</td>
                  <td><span className="refund-med">75% Refund</span></td>
                </tr>
                <tr>
                  <td>Between 4 to 12 hours</td>
                  <td><span className="refund-low">50% Refund</span></td>
                </tr>
                <tr>
                  <td>Less than 4 hours</td>
                  <td><span className="refund-zero">0% (No Refund)</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Bottom Footer Action */}
        <div className="drawer-clean-footer">
          <button className="drawer-close-outline-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusDetailsRightDrawer;
