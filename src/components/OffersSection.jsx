import React, { useState } from "react";
import { FaTag, FaCopy, FaCheck, FaGift } from "react-icons/fa";
import "../css/HomeSections.css";

const OffersSection = ({ onSelectPromo }) => {
  const [copiedId, setCopiedId] = useState(null);

  const offers = [
    {
      id: 1,
      code: "BUSVISTA20",
      title: "Flat 20% OFF",
      desc: "Save up to ₹200 on your first booking across all Maharashtra routes.",
      validity: "Valid till 31 Aug 2026",
      tag: "NEW USER",
      color: "#d84e55",
    },
    {
      id: 2,
      code: "WEEKEND150",
      title: "Save Flat ₹150",
      desc: "Extra ₹150 discount on all Friday, Saturday & Sunday weekend buses.",
      validity: "Valid Every Weekend",
      tag: "WEEKEND SPECIAL",
      color: "#2563eb",
    },
    {
      id: 3,
      code: "SUPERTRIP",
      title: "₹250 Cashback",
      desc: "Instant ₹250 cashback on round trip bookings when paid via UPI.",
      validity: "Valid on Round Trips",
      tag: "ROUND TRIP",
      color: "#059669",
    },
    {
      id: 4,
      code: "VOLVOPRO",
      title: "Flat 15% OFF",
      desc: "Enjoy 15% instant discount on Volvo multi-axle & Scania AC luxury buses.",
      validity: "Limited Seats",
      tag: "LUXURY FLEET",
      color: "#7c3aed",
    },
  ];

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    if (onSelectPromo) onSelectPromo(code);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  return (
    <section id="offers-section" className="offers-home-section">
      <div className="section-header-box">
        <span className="section-sub-tag">
          <FaGift /> EXCLUSIVE DISCOUNTS
        </span>
        <h2 className="section-title">Trending Offers & Promo Codes</h2>
        <p className="section-description">
          Use these promo codes at checkout to grab the best deals on your bus tickets.
        </p>
      </div>

      <div className="offers-cards-grid">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="offer-home-card"
            style={{ borderTop: `4px solid ${offer.color}` }}
          >
            <div className="offer-tag-row">
              <span
                className="offer-pill-tag"
                style={{ background: `${offer.color}15`, color: offer.color }}
              >
                <FaTag /> {offer.tag}
              </span>
              <span className="offer-valid-text">{offer.validity}</span>
            </div>

            <h3 className="offer-discount-title">{offer.title}</h3>
            <p className="offer-body-desc">{offer.desc}</p>

            <div className="offer-action-bar">
              <div className="offer-code-badge">
                <span>{offer.code}</span>
              </div>
              <button
                className={`offer-copy-btn ${copiedId === offer.id ? "copied" : ""}`}
                onClick={() => handleCopy(offer.id, offer.code)}
              >
                {copiedId === offer.id ? (
                  <>
                    <FaCheck /> Copied
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
    </section>
  );
};

export default OffersSection;
