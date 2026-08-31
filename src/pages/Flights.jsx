import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
  FaExchangeAlt,
  FaCheckCircle,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaSuitcase,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import { successAlert } from "../utils/alert";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "../css/Flights.css";

const sampleFlights = [
  {
    id: "FLT6E2041",
    flightNo: "6E-2041",
    airline: "IndiGo",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80",
    from: "Pune (PNQ)",
    to: "Delhi (DEL)",
    departure: "06:15 AM",
    arrival: "08:25 AM",
    duration: "02h 10m",
    flightType: "Non-Stop",
    baggage: "15 kg Check-in, 7 kg Cabin",
    price: 4850,
  },
  {
    id: "FLTAI864",
    flightNo: "AI-864",
    airline: "Air India",
    logo: "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=120&q=80",
    from: "Mumbai (BOM)",
    to: "Goa (GOI)",
    departure: "09:30 AM",
    arrival: "10:45 AM",
    duration: "01h 15m",
    flightType: "Non-Stop",
    baggage: "20 kg Check-in, 7 kg Cabin",
    price: 3250,
  },
  {
    id: "FLTQP1311",
    flightNo: "QP-1311",
    airline: "Akasa Air",
    logo: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=120&q=80",
    from: "Pune (PNQ)",
    to: "Bangalore (BLR)",
    departure: "02:45 PM",
    arrival: "04:10 PM",
    duration: "01h 25m",
    flightType: "Non-Stop",
    baggage: "15 kg Check-in, 7 kg Cabin",
    price: 3600,
  },
  {
    id: "FLTUK992",
    flightNo: "UK-992",
    airline: "Vistara Premium",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=120&q=80",
    from: "Kolhapur (KLH)",
    to: "Mumbai (BOM)",
    departure: "11:00 AM",
    arrival: "12:05 PM",
    duration: "01h 05m",
    flightType: "Direct Flight",
    baggage: "15 kg Check-in, 7 kg Cabin",
    price: 2950,
  },
];

const Flights = () => {
  const navigate = useNavigate();

  const [fromAirport, setFromAirport] = useState("Pune (PNQ)");
  const [toAirport, setToAirport] = useState("Delhi (DEL)");
  const [departDate, setDepartDate] = useState("2026-08-22");
  const [passengers, setPassengers] = useState("1 Adult, Economy");

  const handleSwap = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  const handleBookFlight = (flight) => {
    const pnr = "FLT" + Math.floor(100000 + Math.random() * 900000);
    const bookingId = "FBK" + Math.floor(100000 + Math.random() * 900000);

    const newFlightBooking = {
      bookingId,
      pnr,
      serviceType: "flight",
      flightNo: flight.flightNo,
      airline: flight.airline,
      from: flight.from,
      to: flight.to,
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.duration,
      travelDate: departDate,
      seat: "12F (Window)",
      gate: "Terminal 2, Gate 4B",
      totalAmount: flight.price,
      status: "upcoming",
      bookingDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    };

    const user = auth?.currentUser;
    const uid = user?.uid || "";

    const userEmail = user?.email || "";
    newFlightBooking.userId = uid;
    newFlightBooking.userEmail = userEmail;

    const saved = JSON.parse(localStorage.getItem("flightBookings")) || [];
    saved.push(newFlightBooking);
    localStorage.setItem("flightBookings", JSON.stringify(saved));

    if (db) {
      try {
        setDoc(doc(db, "bookings", bookingId), newFlightBooking, { merge: true });
        const paymentId = "PAY_" + bookingId;
        setDoc(
          doc(db, "payments", paymentId),
          {
            transactionId: paymentId,
            paymentId: paymentId,
            bookingId,
            pnr,
            passengerName: user?.displayName || "Customer",
            email: userEmail,
            amount: flight.price,
            method: "Card",
            status: "Success",
            timestamp: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
        if (uid) {
          setDoc(doc(db, "users", uid, "flightBookings", bookingId), newFlightBooking);
        }
      } catch (e) {
        console.log(e);
      }
    }

    successAlert(`Flight ticket confirmed on ${flight.airline} (${flight.flightNo})! PNR: ${pnr}`).then(() => {
      navigate("/my-bookings", { state: { activeService: "flights" } });
    });
  };

  return (
    <div className="flights-page-wrapper">
      <Navbar />

      {/* Hero Search Section */}
      <section className="flights-hero-banner">
        <div className="flights-hero-container">
          <span className="flights-badge">
            <FaPlane /> VISTA AIRWAYS CONNECT
          </span>
          <h1>Domestic & International Flight Tickets</h1>
          <p>Book airline tickets at lowest airfares with instant e-ticket generation</p>

          {/* Search Box */}
          <div className="flights-search-card">
            <div className="flight-search-field">
              <label>From Airport</label>
              <input
                type="text"
                value={fromAirport}
                onChange={(e) => setFromAirport(e.target.value)}
                placeholder="From Airport"
                className="flight-input"
              />
            </div>

            <button type="button" className="swap-btn" onClick={handleSwap}>
              <FaExchangeAlt />
            </button>

            <div className="flight-search-field">
              <label>To Airport</label>
              <input
                type="text"
                value={toAirport}
                onChange={(e) => setToAirport(e.target.value)}
                placeholder="To Airport"
                className="flight-input"
              />
            </div>

            <div className="flight-search-field">
              <label>Departure Date</label>
              <input
                type="date"
                value={departDate}
                onChange={(e) => setDepartDate(e.target.value)}
                className="flight-input"
              />
            </div>

            <div className="flight-search-field">
              <label>Travel Class</label>
              <select
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="flight-input"
              >
                <option value="1 Adult, Economy">1 Adult, Economy</option>
                <option value="2 Adults, Economy">2 Adults, Economy</option>
                <option value="1 Adult, Premium Economy">1 Adult, Premium Economy</option>
                <option value="1 Adult, Business">1 Adult, Business</option>
              </select>
            </div>

            <button type="button" className="flight-search-submit-btn">
              <FaSearch /> Search Flights
            </button>
          </div>
        </div>
      </section>

      {/* Flight Listings */}
      <main className="flights-main-content">
        <div className="flights-list-container">
          <div className="list-header-row">
            <h2>
              Flights from <strong>{fromAirport}</strong> to <strong>{toAirport}</strong> ({sampleFlights.length} Flights)
            </h2>
            <span className="dgca-badge">
              <FaShieldAlt /> 100% DGCA Certified
            </span>
          </div>

          <div className="flight-cards-list">
            {sampleFlights.map((flight) => (
              <div key={flight.id} className="flight-card-item">
                <div className="flight-airline-col">
                  <div className="airline-icon-wrap">
                    <FaPlane />
                  </div>
                  <div>
                    <strong>{flight.airline}</strong>
                    <small>{flight.flightNo}</small>
                  </div>
                </div>

                {/* Times & Route */}
                <div className="flight-route-col">
                  <div className="node-time-box">
                    <strong>{flight.departure}</strong>
                    <small>{flight.from}</small>
                  </div>

                  <div className="flight-duration-center">
                    <span className="duration-tag">{flight.duration}</span>
                    <div className="plane-line-graphic">
                      <span className="dot"></span>
                      <span className="line"></span>
                      <FaPlane className="plane-icon" />
                    </div>
                    <span className="type-tag">{flight.flightType}</span>
                  </div>

                  <div className="node-time-box text-right">
                    <strong>{flight.arrival}</strong>
                    <small>{flight.to}</small>
                  </div>
                </div>

                {/* Baggage & Fare */}
                <div className="flight-booking-col">
                  <div className="baggage-tag">
                    <FaSuitcase /> {flight.baggage}
                  </div>
                  <div className="flight-fare-wrap">
                    <strong className="flight-fare">₹{flight.price}</strong>
                    <small>/ passenger</small>
                  </div>
                  <button
                    type="button"
                    className="book-flight-btn"
                    onClick={() => handleBookFlight(flight)}
                  >
                    Book Flight
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Flights;
