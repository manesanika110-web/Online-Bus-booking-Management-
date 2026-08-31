import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaQrcode,
  FaBus,
  FaArrowRight,
  FaTicketAlt,
  FaDownload,
  FaArrowLeft,
  FaCheckCircle,
  FaShieldAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import "../css/ETicket.css";

const ETicket = () => {
  const ticketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  const booking = location.state?.booking || {
    bookingId: "BUS945471",
    pnr: "PBK861529",
    bus: {
      name: "Konduskar Travels",
      type: "Non AC Seater / Sleeper",
      from: "Sangli",
      to: "Goa",
      departure: "08:15 PM",
      arrival: "04:30 AM",
      duration: "08h 15m",
    },
    passenger: {
      name: "Riya Roy",
      mobile: "9876543210",
      email: "riya@gmail.com",
      age: "24",
      gender: "Female",
    },
    selectedSeats: ["LB3"],
    travelDate: "18 August 2026",
    totalAmount: 650,
  };

  const bus = booking.bus || {
    name: booking.busName || "Konduskar Travels",
    type: booking.type || "Non AC Seater / Sleeper",
    from: booking.from || "Sangli",
    to: booking.to || "Goa",
    departure: booking.time || booking.departure || "08:15 PM",
  };

  const passenger =
    typeof booking.passenger === "string"
      ? { name: booking.passenger }
      : booking.passenger || {};

  const pnr = booking.pnr || "PBK" + (booking.bookingId || "861529");
  const travelDate =
    booking.travelDate || booking.bookingDate || booking.date || "18 August 2026";
  const mobile = booking.mobile || passenger.mobile || "9876543210";
  const email = booking.email || passenger.email || "riya@gmail.com";
  const age = booking.age || passenger.age || "24";
  const gender = booking.gender || passenger.gender || "Female";
  const seats = Array.isArray(booking.selectedSeats)
    ? booking.selectedSeats.join(", ")
    : booking.seats || booking.selectedSeats || "LB3";
  const totalAmount = booking.totalAmount || booking.amount || 650;

  // 🖨️ Download PDF logic
  const handleDownload = async () => {
    const input = ticketRef.current;
    if (!input) return;
    setDownloading(true);

    try {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let y = margin;
      if (imgHeight > pageHeight - margin * 2) {
        const scale = (pageHeight - margin * 2) / imgHeight;
        pdf.addImage(imgData, "PNG", margin, margin, imgWidth * scale, imgHeight * scale);
      } else {
        pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
      }

      const fileName = passenger?.name
        ? `Bus-Ticket-${passenger.name.replace(/\s+/g, "_")}`
        : `Bus-Ticket-${pnr}`;

      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="eticket-page-wrapper">
      {/* Background ambient lighting */}
      <div className="eticket-page-bg-ambient"></div>

      <div className="ticket-step-card">
        {/* Printable Ticket Container */}
        <div ref={ticketRef} className="printable-ticket">
          {/* 1. Header Banner (Red + Black Theme) */}
          <div className="ticket-header-banner">
            <div className="ticket-header-left">
              <span className="brand-pill">BUSVISTA</span>
              <h3>E-TICKET</h3>
            </div>
            <div className="ticket-header-badge">
              <FaShieldAlt /> <span>OFFICIAL PASS</span>
            </div>
          </div>

          <div className="ticket-content">
            {/* Top Meta Strip */}
            <div className="ticket-meta-headline">
              <div className="headline-left">
                <FaTicketAlt className="ticket-red-icon" />
                <span className="pnr-title">PNR No:</span>
                <strong className="pnr-number-highlight">{pnr}</strong>
              </div>
              <span className="eticket-confirmed-badge">
                <FaCheckCircle /> CONFIRMED
              </span>
            </div>

            {/* Perforated Notch Divider Bar */}
            <div className="eticket-notch-divider">
              <div className="notch left"></div>
              <div className="dash-line"></div>
              <div className="notch right"></div>
            </div>

            {/* Route Container */}
            <div className="route-container">
              <div className="route-station from">
                <span className="route-lbl">FROM</span>
                <h5>{bus.from || "Sangli"}</h5>
                <p className="route-date">
                  <FaCalendarAlt /> {travelDate}
                </p>
              </div>

              <div className="route-arrow-box">
                <div className="route-line-decor">
                  <span className="decor-dot"></span>
                  <span className="decor-line"></span>
                  <FaArrowRight className="decor-arrow" />
                </div>
              </div>

              <div className="route-station to">
                <span className="route-lbl">TO</span>
                <h5>{bus.to || "Goa"}</h5>
                <p className="route-time">
                  <FaClock /> {bus.departure || "08:15 PM"}
                </p>
              </div>
            </div>

            {/* Info Details List (Preserving all ticket information) */}
            <div className="info-details-list">
              <div className="info-row bus-row">
                <span className="info-label">
                  <FaBus className="row-icon" /> Bus Name:
                </span>
                <strong className="info-value">{bus.name || "SRS Travels"}</strong>
              </div>

              <div className="info-grid-2col">
                <div className="info-row">
                  <span className="info-label">Passenger:</span>
                  <strong className="info-value">{passenger.name || "Passenger"}</strong>
                </div>

                <div className="info-row">
                  <span className="info-label">Mobile:</span>
                  <strong className="info-value">+91 {mobile}</strong>
                </div>

                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <strong className="info-value">{email}</strong>
                </div>

                <div className="info-row">
                  <span className="info-label">Age:</span>
                  <strong className="info-value">{age} Yrs</strong>
                </div>

                <div className="info-row">
                  <span className="info-label">Gender:</span>
                  <strong className="info-value">{gender}</strong>
                </div>

                <div className="info-row">
                  <span className="info-label">Seats:</span>
                  <strong className="info-value seat-red-tag">💺 {seats}</strong>
                </div>
              </div>

              <div className="info-row total-fare-row">
                <span className="info-label total-lbl">Total Amount Paid:</span>
                <div className="fare-value-box">
                  <span className="fare-bold-text">₹ {totalAmount}</span>
                  <span className="paid-tag">PAID ONLINE</span>
                </div>
              </div>
            </div>

            {/* QR Section */}
            <div className="qr-section">
              <div className="qr-box-inner">
                <FaQrcode size={54} className="qr-code-icon" />
              </div>
              <div className="qr-text-meta">
                <span className="qr-scan-label">Scan for Live Verification</span>
                <small className="qr-sub-text">Show this E-Ticket on your phone during boarding</small>
              </div>
            </div>

            {/* Security Barcode Strip */}
            <div className="eticket-barcode-decor">
              <span className="barcode-font">||||| | |||| ||| |||| | |||||| || | ||||</span>
              <small>SECURE TRAVEL DOCUMENT • BUSVISTA</small>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden during PDF print) */}
        <div className="no-print eticket-actions-row">
          <button
            type="button"
            className="btn-back-action"
            onClick={() => navigate("/my-bookings")}
          >
            <FaArrowLeft /> <span>Back</span>
          </button>

          <button
            type="button"
            className="btn-download-pdf-action"
            onClick={handleDownload}
            disabled={downloading}
          >
            <FaDownload />
            <span>{downloading ? "Generating PDF..." : "Download PDF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETicket;
