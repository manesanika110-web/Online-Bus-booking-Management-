import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaCheckCircle,
  FaBus,
  FaArrowRight,
  FaPrint,
  FaHome,
  FaTicketAlt,
  FaQrcode,
  FaShieldAlt,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaPhoneAlt,
  FaDownload,
  FaInfoCircle,
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import BusVistaLogo from "../components/BusVistaLogo";
import "../css/BookingSuccess.css";

function BookingSuccess() {
  const ticketRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);

  // Safely extract booking info
  const state = location.state || {};
  const {
    bus = {
      name: "SRS Travels Superfast",
      type: "Non AC Seater / Sleeper (2 + 2)",
      from: "Sangli",
      to: "Goa",
      departure: "08:15 PM",
      arrival: "04:30 AM",
      duration: "08h 15m",
    },
    passenger = {
      name: "Piyu",
      mobile: "9876543210",
      email: "piyu@gmail.com",
      age: "24",
      gender: "Female",
    },
    selectedSeats = ["B3"],
    boardingPoint = { location: "Sangli Stand / Vishrambag" },
    droppingPoint = { location: "Goa ST Stand / Mapusa" },
    totalAmount = 650,
    bookingId = "BUS" + Math.floor(100000 + Math.random() * 900000),
    bookingDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    travelDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    pnr = "PBK" + Math.floor(100000 + Math.random() * 900000),
    paymentMethod = state.paymentMethod || "UPI",
  } = state;

  // Save to localStorage and Firestore
  useEffect(() => {
    const saveBookingData = async () => {
      const user = auth?.currentUser;
      const uid = user?.uid || "";
      const userEmail = user?.email || passenger?.email || "";

      const cleanData = JSON.parse(
        JSON.stringify({
          bookingId: bookingId || "BUS100001",
          pnr: pnr || "PBK100001",
          userId: uid,
          userEmail: userEmail,
          bookingDate: bookingDate || "",
          travelDate: travelDate || bookingDate || "",
          passenger: passenger || {},
          bus: bus || {},
          selectedSeats: selectedSeats || [],
          boardingPoint: boardingPoint || {},
          droppingPoint: droppingPoint || {},
          totalAmount: totalAmount || 0,
          paymentMethod: paymentMethod,
          status: "upcoming",
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        })
      );

      if (uid) {
        const userKey = `bookings_${uid}`;
        const userBookings = JSON.parse(localStorage.getItem(userKey)) || [];
        const exists = userBookings.some((item) => item.bookingId === bookingId);
        if (!exists) {
          userBookings.unshift(cleanData);
          localStorage.setItem(userKey, JSON.stringify(userBookings));
        }
      }

      const oldBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      const alreadyExists = oldBookings.some((item) => item.bookingId === bookingId);
      if (!alreadyExists) {
        oldBookings.unshift(cleanData);
        localStorage.setItem("bookings", JSON.stringify(oldBookings));
      }

      if (db) {
        try {
          // 1. Top-level bookings collection for real-time admin sync
          await setDoc(doc(db, "bookings", String(cleanData.bookingId)), cleanData, {
            merge: true,
          });

          // 2. Top-level payments collection for financial auditing
          const paymentId = "PAY_" + cleanData.bookingId;
          await setDoc(
            doc(db, "payments", paymentId),
            {
              transactionId: paymentId,
              paymentId: paymentId,
              bookingId: cleanData.bookingId,
              pnr: cleanData.pnr,
              passengerName: cleanData.passenger?.name || "Customer",
              email: cleanData.userEmail || "",
              mobile: cleanData.passenger?.mobile || "",
              amount: cleanData.totalAmount,
              method: paymentMethod,
              status: "Success",
              timestamp: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            },
            { merge: true }
          );

          // 3. User subcollection if logged in
          if (user) {
            await setDoc(doc(db, "users", user.uid, "bookings", cleanData.bookingId), cleanData, {
              merge: true,
            });
          }
        } catch (err) {
          console.error("Error saving booking to Firestore:", err);
        }
      }
    };

    saveBookingData();
  }, [bookingId]);

  // Professional PDF Download
  const handleDownloadPDF = async () => {
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

      const passengerName = passenger?.name ? passenger.name.replace(/\s+/g, "_") : "Passenger";
      pdf.save(`BusVista_Ticket_${pnr}_${passengerName}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dynamic-booking-success-page">
      {/* Background Ambient Overlay */}
      <div className="success-bg-image-overlay"></div>

      <div className="success-main-content-container">
        {/* Top Header (Hidden during print) */}
        <div className="success-top-header no-print">
          <div className="success-icon-pulse-wrapper">
            <FaCheckCircle className="confirmed-check-icon" />
          </div>
          <h1 className="booking-confirmed-title">Booking Confirmed!</h1>
          <p className="booking-confirmed-subtitle">
            Your bus reservation is confirmed. SMS & E-ticket sent to{" "}
            <strong>+91 {passenger?.mobile || "9876543210"}</strong>
          </p>
        </div>

        {/* ========================================================
            AUTHENTIC & PROFESSIONAL ORIGINAL E-TICKET
            ======================================================== */}
        <div ref={ticketRef} className="authentic-original-ticket printable-ticket-container">
          {/* 1. Official Header with Logo & 24x7 Helpline */}
          <div className="ticket-official-header-strip">
            <div className="header-brand-col">
              <div className="ticket-brand-logo-wrap">
                <BusVistaLogo size={34} />
                <div>
                  <h2 className="brand-logo-text">Bus Vista</h2>
                  <span className="brand-official-tag">Official Travel E-Ticket</span>
                </div>
              </div>
            </div>

            <div className="header-meta-col">
              <div className="helpline-badge">
                <FaPhoneAlt className="helpline-ico" />
                <span>24x7 Helpline: 1800-102-8745</span>
              </div>
              <div className="pnr-confirmed-tag-row">
                <span className="official-pnr-box">
                  PNR: <strong>{pnr}</strong>
                </span>
                <span className="official-status-badge">
                  <FaCheckCircle /> CONFIRMED
                </span>
              </div>
            </div>
          </div>

          {/* 2. Bus Operator Info Strip */}
          <div className="ticket-operator-highlight-bar">
            <div className="operator-main-info">
              <div className="bus-icon-square">
                <FaBus />
              </div>
              <div>
                <h3 className="operator-full-name">{bus?.name || "SRS Travels Superfast"}</h3>
                <span className="operator-bus-model">{bus?.type || "Non AC Seater / Sleeper (2 + 2)"}</span>
              </div>
            </div>
            <div className="booking-ref-badge">
              <span>Booking ID</span>
              <strong>{bookingId}</strong>
            </div>
          </div>

          {/* 3. Perforated Notch Divider Bar */}
          <div className="perforated-notch-divider">
            <div className="notch left-notch"></div>
            <div className="dashed-cut-line"></div>
            <div className="notch right-notch"></div>
          </div>

          {/* 4. Journey Timeline & Schedule */}
          <div className="ticket-journey-schedule-grid">
            <div className="schedule-col departure">
              <span className="col-lbl">DEPARTURE</span>
              <h4 className="city-name">{bus?.from || "Sangli"}</h4>
              <span className="schedule-time">{bus?.departure || "08:15 PM"}</span>
              <span className="station-location-sub">
                <FaMapMarkerAlt /> {boardingPoint?.location || "Sangli Stand"}
              </span>
            </div>

            <div className="schedule-duration-col">
              <span className="duration-bubble">{bus?.duration || "06h 30m"}</span>
              <div className="duration-arrow-track">
                <span className="track-dot"></span>
                <span className="track-line"></span>
                <FaArrowRight className="track-arrow" />
              </div>
              <span className="travel-date-badge">
                <FaCalendarAlt /> {travelDate}
              </span>
            </div>

            <div className="schedule-col arrival">
              <span className="col-lbl">ARRIVAL</span>
              <h4 className="city-name">{bus?.to || "Goa"}</h4>
              <span className="schedule-time">{bus?.arrival || "04:30 AM"}</span>
              <span className="station-location-sub">
                <FaMapMarkerAlt /> {droppingPoint?.location || "Goa ST Stand"}
              </span>
            </div>
          </div>

          {/* 5. Passenger & Booking Details Table Grid */}
          <div className="ticket-passenger-details-table">
            <div className="table-cell">
              <span className="cell-title">PASSENGER NAME</span>
              <span className="cell-data font-bold">
                <FaUser className="user-ico" /> {passenger?.name || "Passenger"}
              </span>
            </div>

            <div className="table-cell">
              <span className="cell-title">CONTACT MOBILE</span>
              <span className="cell-data font-mono">+91 {passenger?.mobile || "9876543210"}</span>
            </div>

            <div className="table-cell">
              <span className="cell-title">SEAT NUMBER(S)</span>
              <span className="cell-data seat-crimson-badge">
                💺 {Array.isArray(selectedSeats) ? selectedSeats.join(", ") : selectedSeats}
              </span>
            </div>

            <div className="table-cell">
              <span className="cell-title">BOOKING DATE</span>
              <span className="cell-data">{bookingDate}</span>
            </div>
          </div>

          {/* 6. Total Fare Strip */}
          <div className="ticket-fare-summary-bar">
            <div className="fare-left">
              <span className="fare-lbl">TOTAL FARE PAID</span>
              <div className="fare-digits-wrap">
                <strong className="fare-amount-bold">₹ {totalAmount}</strong>
                <span className="fare-paid-pill">PAID ONLINE</span>
              </div>
            </div>

            <div className="fare-security-seal">
              <FaShieldAlt className="seal-ico" />
              <div>
                <strong>100% VERIFIED M-TICKET</strong>
                <small>No physical print needed • Show on mobile</small>
              </div>
            </div>
          </div>

          {/* 7. Barcode & QR Verification Section */}
          <div className="ticket-verification-barcode-footer">
            <div className="barcode-simulation-container">
              <div className="barcode-lines-render">
                <span>||||||| | ||||| ||| ||||||| | ||||| |||||| || | |||||||</span>
              </div>
              <span className="barcode-number-text">PBK-{pnr}-{bookingId}</span>
            </div>

            <div className="qr-code-verified-box">
              <FaQrcode className="qr-ico" />
              <span className="qr-scan-text">SCAN FOR LIVE TICKET STATUS</span>
            </div>
          </div>

          {/* 8. Passenger Instructions Note */}
          <div className="ticket-guidelines-footer">
            <p>
              <FaInfoCircle className="info-icon" />
              <strong>Boarding Guidelines:</strong> Please report at boarding point 15 mins before departure. Valid Government ID (Aadhaar / Voter ID / Driving License) required during travel.
            </p>
          </div>
        </div>

        {/* ========================================================
            Action Buttons (Hidden during print)
            ======================================================== */}
        {/* ========================================================
            Action Buttons (Hidden during print)
            ======================================================== */}
        <div className="success-page-actions-group no-print">
          <div className="bottom-nav-buttons-row" style={{ display: "flex", gap: "16px", width: "100%", justifyContent: "center" }}>
            <button
              type="button"
              className="success-action-btn view-bookings-btn"
              onClick={() =>
                navigate("/my-bookings", {
                  state: {
                    bus,
                    passenger,
                    selectedSeats,
                    totalAmount,
                    bookingId,
                    bookingDate,
                    travelDate,
                  },
                })
              }
            >
              <FaTicketAlt />
              <span>My Bookings</span>
            </button>

            <button
              type="button"
              className="success-action-btn back-home-outline-btn"
              onClick={() => navigate("/")}
            >
              <FaHome />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSuccess;
