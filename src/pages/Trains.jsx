import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaTrain,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaSearch,
  FaExchangeAlt,
  FaCheckCircle,
  FaClock,
  FaChair,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";
import { successAlert } from "../utils/alert";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import "../css/Trains.css";

const sampleTrains = [
  {
    id: "TRN20658",
    trainNo: "20658",
    trainName: "Vande Bharat Express",
    from: "Sangli (SLI)",
    to: "Pune Jn (PUNE)",
    departure: "05:30 AM",
    arrival: "09:45 AM",
    duration: "04h 15m",
    runsOn: "Mon, Tue, Wed, Thu, Fri, Sat",
    classes: [
      { code: "CC", name: "Chair Car", fare: 780, status: "AVAILABLE - 42" },
      { code: "EC", name: "Executive Chair", fare: 1450, status: "AVAILABLE - 12" },
    ],
  },
  {
    id: "TRN11030",
    trainNo: "11030",
    trainName: "Koyna Express",
    from: "Kolhapur (KOP)",
    to: "Mumbai CSMT (CSMT)",
    departure: "08:15 AM",
    arrival: "08:05 PM",
    duration: "11h 50m",
    runsOn: "All Days (Daily)",
    classes: [
      { code: "SL", name: "Sleeper Class", fare: 290, status: "AVAILABLE - 110" },
      { code: "3A", name: "AC 3 Tier", fare: 780, status: "AVAILABLE - 28" },
      { code: "2A", name: "AC 2 Tier", fare: 1120, status: "RAC - 4" },
    ],
  },
  {
    id: "TRN12124",
    trainNo: "12124",
    trainName: "Deccan Queen Superfast",
    from: "Pune Jn (PUNE)",
    to: "Mumbai CSMT (CSMT)",
    departure: "07:15 AM",
    arrival: "10:25 AM",
    duration: "03h 10m",
    runsOn: "All Days (Daily)",
    classes: [
      { code: "2S", name: "Second Sitting", fare: 125, status: "AVAILABLE - 240" },
      { code: "CC", name: "AC Chair Car", fare: 485, status: "AVAILABLE - 65" },
      { code: "EV", name: "Vistadome 360", fare: 915, status: "AVAILABLE - 8" },
    ],
  },
  {
    id: "TRN12780",
    trainNo: "12780",
    trainName: "Goa Express",
    from: "Pune Jn (PUNE)",
    to: "Madgaon Goa (MAO)",
    departure: "04:30 PM",
    arrival: "05:40 AM",
    duration: "13h 10m",
    runsOn: "All Days (Daily)",
    classes: [
      { code: "SL", name: "Sleeper Class", fare: 420, status: "AVAILABLE - 45" },
      { code: "3A", name: "AC 3 Tier", fare: 1140, status: "AVAILABLE - 19" },
      { code: "2A", name: "AC 2 Tier", fare: 1650, status: "AVAILABLE - 6" },
    ],
  },
];

const Trains = () => {
  const navigate = useNavigate();

  const [fromStation, setFromStation] = useState("Sangli");
  const [toStation, setToStation] = useState("Pune");
  const [journeyDate, setJourneyDate] = useState("2026-08-20");
  const [selectedClass, setSelectedClass] = useState("All Classes");

  const handleSwap = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleBookTrain = (train, cls) => {
    const pnr = "TRN" + Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 10);
    const bookingId = "TBK" + Math.floor(100000 + Math.random() * 900000);

    const newTrainBooking = {
      bookingId,
      pnr,
      serviceType: "train",
      trainNo: train.trainNo,
      trainName: train.trainName,
      from: train.from,
      to: train.to,
      departure: train.departure,
      arrival: train.arrival,
      duration: train.duration,
      travelDate: journeyDate,
      selectedClass: cls.code + " (" + cls.name + ")",
      berth: cls.code === "CC" ? "C2-34 (Window)" : "B2-19 (Lower Berth)",
      totalAmount: cls.fare,
      status: "upcoming",
      bookingDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
    };

    const user = auth?.currentUser;
    const uid = user?.uid || "";
    const userEmail = user?.email || "";

    newTrainBooking.userId = uid;
    newTrainBooking.userEmail = userEmail;

    const saved = JSON.parse(localStorage.getItem("trainBookings")) || [];
    saved.push(newTrainBooking);
    localStorage.setItem("trainBookings", JSON.stringify(saved));

    if (db) {
      try {
        setDoc(doc(db, "bookings", bookingId), newTrainBooking, { merge: true });
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
            amount: cls.fare,
            method: "UPI",
            status: "Success",
            timestamp: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          { merge: true }
        );
        if (uid) {
          setDoc(doc(db, "users", uid, "trainBookings", bookingId), newTrainBooking);
        }
      } catch (e) {
        console.log(e);
      }
    }

    successAlert(`Train ticket booked on ${train.trainName}! PNR: ${pnr}`).then(() => {
      navigate("/my-bookings", { state: { activeService: "trains" } });
    });
  };

  return (
    <div className="trains-page-wrapper">
      <Navbar />

      {/* Hero Search Section */}
      <section className="trains-hero-banner">
        <div className="trains-hero-container">
          <span className="trains-badge">
            <FaTrain /> VISTA RAIL CONNECT
          </span>
          <h1>IRCTC Authorized Train Ticket Booking</h1>
          <p>Instant train seat availability, PNR confirmation & zero cancellation fee options</p>

          {/* Search Box */}
          <div className="trains-search-card">
            <div className="train-search-field">
              <label>From Station</label>
              <input
                type="text"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                placeholder="From Station (e.g. Sangli)"
                className="train-input"
              />
            </div>

            <button type="button" className="swap-btn" onClick={handleSwap}>
              <FaExchangeAlt />
            </button>

            <div className="train-search-field">
              <label>To Station</label>
              <input
                type="text"
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                placeholder="To Station (e.g. Pune)"
                className="train-input"
              />
            </div>

            <div className="train-search-field">
              <label>Journey Date</label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="train-input"
              />
            </div>

            <div className="train-search-field">
              <label>Quota / Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="train-input"
              >
                <option value="All Classes">All Classes</option>
                <option value="Sleeper (SL)">Sleeper (SL)</option>
                <option value="AC 3 Tier (3A)">AC 3 Tier (3A)</option>
                <option value="AC 2 Tier (2A)">AC 2 Tier (2A)</option>
                <option value="Chair Car (CC)">Chair Car (CC)</option>
              </select>
            </div>

            <button type="button" className="train-search-submit-btn">
              <FaSearch /> Search Trains
            </button>
          </div>
        </div>
      </section>

      {/* Train Listings */}
      <main className="trains-main-content">
        <div className="trains-list-container">
          <div className="list-header-row">
            <h2>
              Trains from <strong>{fromStation}</strong> to <strong>{toStation}</strong> ({sampleTrains.length} Trains)
            </h2>
            <span className="irctc-badge">
              <FaShieldAlt /> Official IRCTC Partner
            </span>
          </div>

          <div className="train-cards-list">
            {sampleTrains.map((train) => (
              <div key={train.id} className="train-card-item">
                <div className="train-header-row">
                  <div className="train-name-block">
                    <FaTrain className="train-icon-red" />
                    <div>
                      <h3>
                        {train.trainName} <span>({train.trainNo})</span>
                      </h3>
                      <small>Runs On: {train.runsOn}</small>
                    </div>
                  </div>
                </div>

                {/* Journey Schedule */}
                <div className="train-schedule-strip">
                  <div className="station-node">
                    <strong className="time">{train.departure}</strong>
                    <span className="station">{train.from}</span>
                  </div>

                  <div className="duration-line-node">
                    <span className="dur-text">{train.duration}</span>
                    <div className="track-graphic">
                      <span className="dot"></span>
                      <span className="line"></span>
                      <FaArrowRight className="arrow" />
                    </div>
                    <span className="date-sub">{journeyDate}</span>
                  </div>

                  <div className="station-node text-right">
                    <strong className="time">{train.arrival}</strong>
                    <span className="station">{train.to}</span>
                  </div>
                </div>

                {/* Class Availability Cards */}
                <div className="class-availability-row">
                  {train.classes.map((cls, index) => (
                    <div key={index} className="class-tier-box">
                      <div className="class-top">
                        <strong>{cls.code}</strong>
                        <span className="class-fare">₹{cls.fare}</span>
                      </div>
                      <small className="class-name">{cls.name}</small>
                      <div className="status-badge-green">
                        <FaCheckCircle /> {cls.status}
                      </div>
                      <button
                        type="button"
                        className="book-class-btn"
                        onClick={() => handleBookTrain(train, cls)}
                      >
                        Book Ticket
                      </button>
                    </div>
                  ))}
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

export default Trains;
