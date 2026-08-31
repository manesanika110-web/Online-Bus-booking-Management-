import React from "react";
import { FaSearch, FaChair, FaCreditCard, FaTicketAlt } from "react-icons/fa";
import "../css/HomeSections.css";

const HowToBook = () => {
  const steps = [
    {
      stepNum: "01",
      icon: <FaSearch />,
      title: "Search Bus",
      desc: "Enter your departure city, destination, and journey date to find available buses.",
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      stepNum: "02",
      icon: <FaChair />,
      title: "Select Seat",
      desc: "Choose your favorite seat, sleeper berth, and convenient boarding point.",
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      stepNum: "03",
      icon: <FaCreditCard />,
      title: "Secure Payment",
      desc: "Pay securely using UPI, Credit/Debit Cards, Net Banking, or Digital Wallets.",
      color: "#d97706",
      bg: "#fffbeb",
    },
    {
      stepNum: "04",
      icon: <FaTicketAlt />,
      title: "Instant M-Ticket",
      desc: "Get your confirmed ticket via WhatsApp/SMS & PDF download with live GPS tracking.",
      color: "#d84e55",
      bg: "#fef2f2",
    },
  ];

  return (
    <section className="how-to-book-section">
      <div className="section-header-box">
        <span className="section-sub-tag">SIMPLE 4-STEP PROCESS</span>
        <h2 className="section-title">How to Book Your Bus Ticket</h2>
        <p className="section-description">
          Booking a bus ticket on Bus Vista is fast, simple, and takes less than 60 seconds.
        </p>
      </div>

      <div className="how-to-steps-grid">
        {steps.map((item, index) => (
          <div key={index} className="step-card-box">
            <div className="step-number-tag">{item.stepNum}</div>
            <div className="step-icon-circle" style={{ color: item.color, background: item.bg }}>
              {item.icon}
            </div>
            <h3 className="step-title">{item.title}</h3>
            <p className="step-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowToBook;
