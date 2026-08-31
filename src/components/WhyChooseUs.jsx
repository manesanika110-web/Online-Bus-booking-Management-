import React from "react";
import {
  FaShieldAlt,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaHeadset,
  FaUndo,
  FaStar,
} from "react-icons/fa";
import "../css/HomeSections.css";

const WhyChooseUs = () => {
  const features = [
    {
      icon: <FaShieldAlt />,
      title: "100% Safe & Verified Buses",
      desc: "All buses are certified, thoroughly inspected, and driven by licensed professional drivers.",
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Real-Time Bus Tracking",
      desc: "Track your bus live on GPS and receive timely updates on boarding point and arrival times.",
      color: "#d84e55",
      bg: "#fef2f2",
    },
    {
      icon: <FaRupeeSign />,
      title: "Lowest Price Guaranteed",
      desc: "Zero hidden charges, transparent pricing, and exclusive promo codes to save on every trip.",
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      icon: <FaHeadset />,
      title: "24/7 Dedicated Support",
      desc: "Our customer support team is available round-the-clock via phone, chat, and email assistance.",
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      icon: <FaUndo />,
      title: "Instant Refund & Cancellation",
      desc: "Hassle-free ticket cancellation with immediate refund directly to your original payment mode.",
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      icon: <FaStar />,
      title: "4.8/5 Star Rated Service",
      desc: "Over 500,000+ happy travelers have trusted Bus Vista for comfortable intercity travel.",
      color: "#db2777",
      bg: "#fdf2f8",
    },
  ];

  return (
    <section className="why-choose-section">
      <div className="section-header-box">
        <span className="section-sub-tag">WHY BUS VISTA</span>
        <h2 className="section-title">We Deliver The Best Travel Experience</h2>
        <p className="section-description">
          Here is why millions of passengers prefer Bus Vista for their daily and holiday travel needs.
        </p>
      </div>

      <div className="why-choose-grid">
        {features.map((item, index) => (
          <div key={index} className="why-feature-card">
            <div
              className="why-icon-badge"
              style={{ color: item.color, background: item.bg }}
            >
              {item.icon}
            </div>
            <div className="why-text-box">
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;
