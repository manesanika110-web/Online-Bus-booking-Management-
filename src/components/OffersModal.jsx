import React, { useState } from "react";
import { FaTimes, FaGift, FaCopy, FaCheck, FaTag, FaBus } from "react-icons/fa";
import "../css/Modal.css";

const OffersModal = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  if (!isOpen) return null;

  const offers = [
    {
      id: 1,
      code: "BUSVISTA20",
      title: "Flat 20% OFF",
      desc: "Save up to ₹200 on your first bus booking across Maharashtra & Goa.",
      minBooking: "Min. booking ₹500",
      validTill: "Valid till 31 Aug 2026",
      tag: "FIRST USER",
      color: "#d84e55",
    },
    {
      id: 2,
      code: "WEEKEND150",
      title: "Flat ₹150 OFF",
      desc: "Get instant ₹150 discount on Friday to Sunday travel journeys.",
      minBooking: "Min. booking ₹700",
      validTill: "Valid every Weekend",
      tag: "WEEKEND SPECIAL",
      color: "#2563eb",
    },
    {
      id: 3,
      code: "SUPERTRIP",
      title: "Round Trip Deal",
      desc: "Flat ₹250 Cashback on booking both onward and return tickets.",
      minBooking: "Min. booking ₹1000",
      validTill: "Valid this month",
      tag: "ROUND TRIP",
      color: "#059669",
    },
    {
      id: 4,
      code: "SLEEPER10",
      title: "AC Sleeper 10% OFF",
      desc: "Get 10% discount on luxury Volvo, Scania and Bharat Benz AC sleepers.",
      minBooking: "No min. booking",
      validTill: "Limited Seats",
      tag: "LUXURY FLEET",
      color: "#7c3aed",
    },
  ];

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content offers-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <FaGift className="modal-header-icon gift-icon-color" />
            <h3>Active Offers & Promo Codes</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Apply these promo codes during booking checkout to save more on your travels!
          </p>

          <div className="offers-modal-list">
            {offers.map((offer) => (
              <div key={offer.id} className="offer-modal-card" style={{ borderLeft: `5px solid ${offer.color}` }}>
                <div className="offer-card-top">
                  <span className="offer-card-tag" style={{ background: `${offer.color}15`, color: offer.color }}>
                    <FaTag /> {offer.tag}
                  </span>
                  <span className="offer-validity">{offer.validTill}</span>
                </div>

                <h4>{offer.title}</h4>
                <p className="offer-desc-text">{offer.desc}</p>
                <span className="min-condition">{offer.minBooking}</span>

                <div className="offer-coupon-strip">
                  <div className="coupon-code-box">
                    <span className="code-text">{offer.code}</span>
                  </div>
                  <button
                    className={`copy-coupon-btn ${copiedCode === offer.code ? "copied" : ""}`}
                    onClick={() => handleCopy(offer.code)}
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <FaCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <FaCopy /> Copy Code
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersModal;
