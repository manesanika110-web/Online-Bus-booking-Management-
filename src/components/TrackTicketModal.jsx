import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaSearch,
  FaBus,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaPhoneAlt,
  FaTachometerAlt,
  FaClock,
  FaRoute,
  FaShieldAlt,
  FaSyncAlt,
  FaCompass,
  FaLayerGroup,
  FaPlus,
  FaMinus,
  FaCrosshairs,
} from "react-icons/fa";
import "../css/TrackTicketModal.css";

const sampleTrackBookings = [
  {
    bookingId: "BUS861529",
    pnr: "PBK861529",
    regNo: "MH-10-AZ-4421",
    busName: "SRS Travels Volvo Multi-Axle AC",
    from: "Sangli",
    to: "Pune",
    departure: "03:45 AM",
    arrival: "08:45 AM",
    date: "17 August 2026",
    speed: "68 km/h",
    remainingDistance: "42 km (80% Completed)",
    eta: "38 mins (08:45 AM)",
    currentLocation: "Near Shirwal Toll Plaza - NH 48",
    nextStop: "Shirwal Food Mall (15 mins break)",
    driverName: "Dattatray Shinde",
    driverPhone: "+91 98221 44321",
  },
  {
    bookingId: "BUS942318",
    pnr: "PBK942318",
    regNo: "MH-14-BT-9902",
    busName: "Atmaram Gobus AC Sleeper",
    from: "Sangli",
    to: "Goa",
    departure: "02:30 AM",
    arrival: "08:15 AM",
    date: "18 August 2026",
    speed: "62 km/h",
    remainingDistance: "75 km (65% Completed)",
    eta: "1h 15m (08:15 AM)",
    currentLocation: "Amboli Ghat Highway Section",
    nextStop: "Sawantwadi Bypass",
    driverName: "Ramesh Patil",
    driverPhone: "+91 98902 11234",
  },
];

const TrackTicketModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const [ticketQuery, setTicketQuery] = useState("");
  const [activeTracking, setActiveTracking] = useState(null);
  const [mapType, setMapType] = useState("roadmap"); // 'roadmap' | 'satellite'
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLiveSimulating, setIsLiveSimulating] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(0);

  // Load initial active booking on open
  useEffect(() => {
    if (isOpen) {
      const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
      if (savedBookings.length > 0) {
        const latest = savedBookings[savedBookings.length - 1];
        setActiveTracking({
          bookingId: latest.bookingId || "BUS861529",
          pnr: latest.pnr || "PBK861529",
          regNo: "MH-10-AZ-4421",
          busName: latest.bus?.name || "SRS Travels AC Sleeper",
          from: latest.bus?.from || "Sangli",
          to: latest.bus?.to || "Pune",
          departure: latest.bus?.departure || "03:45 AM",
          arrival: latest.bus?.arrival || "08:45 AM",
          date: latest.travelDate || latest.bookingDate || "17 August 2026",
          speed: "68 km/h",
          remainingDistance: "42 km (82% Completed)",
          eta: "38 mins",
          currentLocation: "Near Shirwal Toll Plaza - NH 48",
          nextStop: "Shirwal Food Mall (15 mins break)",
          driverName: "Dattatray Shinde",
          driverPhone: "+91 98221 44321",
        });
      } else {
        setActiveTracking(sampleTrackBookings[0]);
      }
    }
  }, [isOpen]);

  // Live seconds ticker
  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setInterval(() => {
        setLiveSeconds((prev) => prev + 1);
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const q = ticketQuery.trim().toLowerCase();
    if (!q) return;

    const savedBookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const all = [...savedBookings, ...sampleTrackBookings];

    const match = all.find(
      (b) =>
        b.bookingId?.toLowerCase().includes(q) ||
        b.pnr?.toLowerCase().includes(q) ||
        b.bus?.from?.toLowerCase().includes(q) ||
        b.from?.toLowerCase().includes(q)
    );

    if (match) {
      setActiveTracking({
        bookingId: match.bookingId || "BUS861529",
        pnr: match.pnr || "PBK" + (match.bookingId || "861529").slice(-6),
        regNo: match.regNo || "MH-10-AZ-4421",
        busName: match.bus?.name || match.busName || "SRS Travels AC Sleeper",
        from: match.bus?.from || match.from || "Sangli",
        to: match.bus?.to || match.to || "Pune",
        departure: match.bus?.departure || match.departure || "03:45 AM",
        arrival: match.bus?.arrival || match.arrival || "08:45 AM",
        date: match.travelDate || match.date || "17 August 2026",
        speed: "68 km/h",
        remainingDistance: "42 km (82% Completed)",
        eta: "38 mins",
        currentLocation: "Near Shirwal Toll Plaza - NH 48",
        nextStop: "Shirwal Food Mall (15 mins break)",
        driverName: "Dattatray Shinde",
        driverPhone: "+91 98221 44321",
      });
    } else {
      setActiveTracking({
        bookingId: ticketQuery.toUpperCase(),
        pnr: "PBK" + ticketQuery.slice(-6).toUpperCase(),
        regNo: "MH-09-EX-7788",
        busName: "Express Luxury Coach",
        from: "Kolhapur",
        to: "Sangli",
        departure: "06:00 AM",
        arrival: "07:30 AM",
        date: "Today",
        speed: "55 km/h",
        remainingDistance: "18 km (70% Completed)",
        eta: "20 mins",
        currentLocation: "Near Jaysingpur Bypass",
        nextStop: "Sangli Main ST Stand",
        driverName: "Mahesh Sawant",
        driverPhone: "+91 98223 99887",
      });
    }
  };

  return (
    <div className="track-modal-overlay" onClick={onClose}>
      <div
        className="track-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="track-modal-header">
          <div className="track-header-left">
            <div className="track-icon-badge">
              <FaBus />
            </div>
            <div>
              <h2>Live GPS Bus Tracking</h2>
              <p>Real-time telemetry, live vehicle location, and ETA</p>
            </div>
          </div>

          <div className="track-header-actions">
            <span className="live-pulsing-badge">
              <span className="live-dot"></span> LIVE GPS ACTIVE
            </span>
            <button className="track-close-btn" onClick={onClose} title="Close">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="track-search-bar-strip">
          <form onSubmit={handleSearch} className="track-search-form">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by PNR or Booking ID (e.g. PBK861529)..."
              value={ticketQuery}
              onChange={(e) => setTicketQuery(e.target.value)}
              className="track-search-input"
            />
            <button type="submit" className="track-search-btn">
              Track
            </button>
          </form>

          {/* Quick Preset Chips */}
          <div className="quick-track-chips">
            <span className="chips-label">Quick Track:</span>
            {sampleTrackBookings.map((b) => (
              <button
                key={b.pnr}
                type="button"
                className={`quick-chip-btn ${
                  activeTracking?.pnr === b.pnr ? "active" : ""
                }`}
                onClick={() => setActiveTracking(b)}
              >
                📍 {b.pnr} ({b.from} → {b.to})
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Left Telemetry Operations + Right Live Map */}
        <div className="track-main-grid-layout">
          {/* Left Telemetry Box (Matching User Image 5) */}
          <div className="telemetry-panel-left">
            {/* Top Status & Reg */}
            <div className="telemetry-top-card">
              <div className="reg-pnr-row">
                <span className="live-status-pill online">
                  <FaCheckCircle /> ON-TIME & ACTIVE
                </span>
                <span className="bus-reg-tag">
                  Reg No: <strong>{activeTracking?.regNo}</strong>
                </span>
              </div>
              <div className="pnr-display-row">
                <span>PNR:</span>
                <strong className="pnr-red">{activeTracking?.pnr}</strong>
              </div>
            </div>

            {/* Route & Times */}
            <div className="telemetry-route-card">
              <div className="telemetry-route-header">
                <div className="route-city-col">
                  <strong>{activeTracking?.from}</strong>
                  <small>Departure: {activeTracking?.departure}</small>
                </div>
                <div className="route-arrow-col">➜</div>
                <div className="route-city-col text-right">
                  <strong>{activeTracking?.to}</strong>
                  <small>Arrival: {activeTracking?.arrival}</small>
                </div>
              </div>
              <div className="travel-date-tag">
                <FaCalendarAlt /> Travel Date: {activeTracking?.date}
              </div>
            </div>

            {/* TELEMETRY OPERATIONS SECTION */}
            <div className="telemetry-stats-section">
              <h4 className="telemetry-sec-title">TELEMETRY OPERATIONS</h4>

              <div className="telemetry-two-col-grid">
                <div className="telemetry-stat-card">
                  <span className="stat-label">CURRENT VELOCITY</span>
                  <strong className="stat-value speed-val">
                    <FaTachometerAlt /> {activeTracking?.speed}
                  </strong>
                </div>

                <div className="telemetry-stat-card">
                  <span className="stat-label">DISTANCE REMAINING</span>
                  <strong className="stat-value">
                    {activeTracking?.remainingDistance}
                  </strong>
                </div>
              </div>

              <div className="telemetry-full-stat-card">
                <span className="stat-label">ESTIMATED TIME OF ARRIVAL (ETA)</span>
                <strong className="stat-value eta-val">
                  <FaClock /> {activeTracking?.eta}
                </strong>
              </div>

              <div className="telemetry-full-stat-card current-loc">
                <span className="stat-label">CURRENT LIVE LOCATION</span>
                <strong className="stat-value loc-val">
                  📍 {activeTracking?.currentLocation}
                </strong>
              </div>

              <div className="telemetry-full-stat-card">
                <span className="stat-label">NEXT REST STOP</span>
                <strong className="stat-value">
                  ☕ {activeTracking?.nextStop}
                </strong>
              </div>
            </div>

            {/* Driver & Contact Footer */}
            <div className="telemetry-driver-footer">
              <div className="driver-info-meta">
                <small>Driver & Conductor</small>
                <strong>{activeTracking?.driverName}</strong>
              </div>
              <a
                href={`tel:${activeTracking?.driverPhone}`}
                className="call-driver-btn"
              >
                <FaPhoneAlt /> Call Driver
              </a>
            </div>

            <div className="telemetry-sync-time">
              <FaSyncAlt className="spin-icon" /> Last Updated: Just now (Live GPS 5G)
            </div>
          </div>

          {/* Right Live Interactive GPS Radar Map Simulation */}
          <div className={`live-radar-map-panel ${mapType}`}>
            {/* Map Header Controls */}
            <div className="map-floating-top-controls">
              <div className="map-type-toggle-group">
                <button
                  type="button"
                  className={`map-toggle-btn ${
                    mapType === "roadmap" ? "active" : ""
                  }`}
                  onClick={() => setMapType("roadmap")}
                >
                  <FaLayerGroup /> Roadmap
                </button>
                <button
                  type="button"
                  className={`map-toggle-btn ${
                    mapType === "satellite" ? "active" : ""
                  }`}
                  onClick={() => setMapType("satellite")}
                >
                  <FaCompass /> Satellite
                </button>
              </div>

              <div className="map-zoom-controls">
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
                  title="Zoom In"
                >
                  <FaPlus />
                </button>
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                  title="Zoom Out"
                >
                  <FaMinus />
                </button>
                <button
                  type="button"
                  className="map-zoom-btn"
                  onClick={() => setZoomLevel(1)}
                  title="Recenter Bus"
                >
                  <FaCrosshairs />
                </button>
              </div>
            </div>

            {/* Map Canvas with Highway Route and Moving Radar Bus */}
            <div
              className="map-canvas-container"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Route SVG Curve */}
              <svg className="route-svg-layer" viewBox="0 0 600 400">
                <path
                  d="M 60 340 Q 180 290 280 230 T 520 70"
                  className="highway-path-bg"
                />
                <path
                  d="M 60 340 Q 180 290 280 230 T 360 170"
                  className="highway-path-completed"
                />
              </svg>

              {/* Waypoint 1: Departure Point */}
              <div className="map-waypoint-marker origin-marker" style={{ left: "50px", top: "320px" }}>
                <div className="waypoint-pin green">
                  <span className="dot"></span>
                </div>
                <div className="waypoint-tooltip">
                  <strong>{activeTracking?.from} (Origin)</strong>
                  <small>Departed: {activeTracking?.departure}</small>
                </div>
              </div>

              {/* Waypoint 2: Next Rest Stop */}
              <div className="map-waypoint-marker stop-marker" style={{ left: "420px", top: "130px" }}>
                <div className="waypoint-pin yellow">
                  <span>☕</span>
                </div>
                <div className="waypoint-tooltip">
                  <strong>Shirwal Food Stop</strong>
                  <small>ETA: 15 mins</small>
                </div>
              </div>

              {/* Waypoint 3: Destination Point */}
              <div className="map-waypoint-marker dest-marker" style={{ left: "505px", top: "50px" }}>
                <div className="waypoint-pin red">
                  <FaMapMarkerAlt />
                </div>
                <div className="waypoint-tooltip">
                  <strong>{activeTracking?.to} (Terminal)</strong>
                  <small>ETA: {activeTracking?.arrival}</small>
                </div>
              </div>

              {/* LIVE MOVING BUS RADAR PIN */}
              <div
                className="live-bus-radar-marker"
                style={{ left: "340px", top: "155px" }}
              >
                <div className="radar-pulse-ring ring-1"></div>
                <div className="radar-pulse-ring ring-2"></div>
                <div className="bus-marker-icon-box">
                  <FaBus />
                </div>
                <div className="bus-live-tag-popup">
                  <div className="popup-top">
                    <span className="live-blink-circle"></span>
                    <strong>{activeTracking?.busName}</strong>
                  </div>
                  <div className="popup-sub">
                    <span>{activeTracking?.speed}</span> • <span>{activeTracking?.currentLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Floating Map Info Bar */}
            <div className="map-floating-bottom-bar">
              <div className="highway-tag">
                🛣️ <strong>NH 48 Highway Corridor</strong>
              </div>
              <div className="traffic-status-tag">
                🟢 Traffic: <strong>Smooth & Free Flowing (68 km/h)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackTicketModal;
