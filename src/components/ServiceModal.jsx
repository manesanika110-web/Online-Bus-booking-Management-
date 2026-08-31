import React, { useState } from "react";
import { FaTimes, FaHotel, FaTrain, FaPlane, FaCheckCircle, FaBell } from "react-icons/fa";
import { successAlert } from "../utils/alert";
import "../css/Modal.css";

const ServiceModal = ({ isOpen, onClose, serviceType = "Hotels" }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const getServiceInfo = () => {
    switch (serviceType) {
      case "Hotels":
        return {
          title: "Hotel Bookings",
          icon: <FaHotel className="modal-header-icon" />,
          subtitle: "Book Premium & Budget Hotels at Unbeatable Prices",
          desc: "We are integrating over 50,000+ verified hotels, resorts, and homestays across India with instant confirmation and free cancellation.",
          perks: ["Up to 40% OFF on first 1000 bookings", "Free Breakfast & WiFi included", "Zero Cancellation Charges"],
        };
      case "Trains":
        return {
          title: "Train Ticket Booking",
          icon: <FaTrain className="modal-header-icon" />,
          subtitle: "IRCTC Authorized Train Ticket Reservation",
          desc: "Book train tickets with confirmed seat prediction, live running train status, platform locator, and food in train delivery.",
          perks: ["Zero Gateway Fee on UPI", "Live PNR Confirmation Status", "Instant Tatkal Booking Alert"],
        };
      case "Flights":
        return {
          title: "Flight Bookings",
          icon: <FaPlane className="modal-header-icon" />,
          subtitle: "Domestic & International Cheap Air Tickets",
          desc: "Compare airfares across IndiGo, Air India, SpiceJet, Akasa Air and Vistara with exclusive cashbacks and zero convenience fee.",
          perks: ["Flat ₹800 OFF on First Flight", "Web Check-In Assistant", "Free Seat Selection Promo"],
        };
      default:
        return {
          title: "Travel Service",
          icon: <FaHotel className="modal-header-icon" />,
          subtitle: "Coming Soon on Bus Vista",
          desc: "We are launching this service very soon.",
          perks: ["Exclusive Discounts", "Fast & Secure", "24/7 Support"],
        };
    }
  };

  const info = getServiceInfo();

  const handleNotify = (e) => {
    e.preventDefault();
    if (!email) return;
    successAlert(`Thank you! We will notify ${email} with an exclusive 30% discount coupon as soon as ${info.title} launches.`);
    setEmail("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content service-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            {info.icon}
            <h3>{info.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="service-banner-box">
            <span className="coming-soon-pill">Launching Soon 🚀</span>
            <h4>{info.subtitle}</h4>
            <p>{info.desc}</p>
          </div>

          <div className="perks-checklist">
            <h5>Key Features you will enjoy:</h5>
            {info.perks.map((perk, idx) => (
              <div key={idx} className="perk-item">
                <FaCheckCircle className="perk-check" />
                <span>{perk}</span>
              </div>
            ))}
          </div>

          <div className="notify-box">
            <h5>
              <FaBell /> Get Notified & Receive 30% Early Bird Discount
            </h5>
            <form onSubmit={handleNotify} className="notify-form">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="notify-btn">
                Notify Me
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
