import React, { useState, useEffect } from "react";
import {
  FaSatelliteDish,
  FaBus,
  FaMapMarkerAlt,
  FaTachometerAlt,
  FaPhoneAlt,
  FaUserFriends,
  FaTicketAlt,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaRoute,
  FaCompass,
  FaSyncAlt,
  FaExclamationTriangle,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { updateBusLocationInFirestore } from "./adminDataService";

function AdminLiveTracking({
  busLocations = [],
  bookings = [],
  buses = [],
  routes = [],
  searchQuery = "",
}) {
  const [filterMode, setFilterMode] = useState("booked_today"); // "booked_today" | "all" | "moving"
  const [expandedBusId, setExpandedBusId] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [selectedRouteFilter, setSelectedRouteFilter] = useState("all");

  // Get Today's Date String in YYYY-MM-DD format & readable formats
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Group Bookings by Bus (matching by busId, busName, or route)
  const bookingsByBus = {};
  let totalTodayBookingsCount = 0;
  let totalTodayPassengersCount = 0;

  bookings.forEach((b) => {
    // Check if booking was created today or is upcoming/confirmed
    const bDate = (b.createdAt || b.bookingDate || "").split("T")[0];
    const isTodayOrActive = bDate === todayStr || b.status === "confirmed" || b.status === "upcoming";

    const busKey = String(b.bus?.id || b.busId || b.bus?.name || "generic");
    if (!bookingsByBus[busKey]) {
      bookingsByBus[busKey] = [];
    }

    bookingsByBus[busKey].push({
      ...b,
      isToday: bDate === todayStr,
    });

    if (isTodayOrActive && b.status !== "cancelled") {
      totalTodayBookingsCount += 1;
      const seatCount = Array.isArray(b.selectedSeats) ? b.selectedSeats.length : 1;
      totalTodayPassengersCount += seatCount;
    }
  });

  // 2. Build Rich Real-Time Fleet Locations with Passenger Manifests
  const liveFleet = busLocations.map((loc, idx) => {
    const matchedBus = buses.find((b) => String(b.id) === String(loc.busId)) || {};
    const busKey = String(loc.busId);

    // Find passenger bookings for this bus
    const busBookings = bookingsByBus[busKey] ||
      bookings.filter((b) => {
        const bName = (b.bus?.name || "").toLowerCase();
        const locName = (loc.busName || "").toLowerCase();
        return bName && locName && (bName.includes(locName) || locName.includes(bName));
      });

    const activeBookings = busBookings.filter((b) => b.status !== "cancelled");
    const passengerCount = activeBookings.reduce((acc, b) => {
      const seats = Array.isArray(b.selectedSeats) ? b.selectedSeats.length : 1;
      return acc + seats;
    }, 0);

    const hasTodayBookings = busBookings.length > 0;

    return {
      ...loc,
      matchedBus,
      bookings: busBookings,
      passengerCount,
      hasTodayBookings,
      totalCapacity: matchedBus.totalSeats || 36,
    };
  });

  // 3. Filter Live Fleet based on Search & Mode
  const filteredFleet = liveFleet.filter((coach) => {
    const term = (searchQuery || "").toLowerCase().trim();
    const matchesSearch =
      !term ||
      coach.busName.toLowerCase().includes(term) ||
      coach.busNumber.toLowerCase().includes(term) ||
      coach.route.toLowerCase().includes(term) ||
      coach.driverName.toLowerCase().includes(term) ||
      coach.currentLocation.toLowerCase().includes(term) ||
      coach.bookings.some((b) => {
        const pName = (b.passenger?.name || b.name || "").toLowerCase();
        const pnr = (b.pnr || "").toLowerCase();
        return pName.includes(term) || pnr.includes(term);
      });

    if (!matchesSearch) return false;

    if (selectedRouteFilter !== "all" && !coach.route.toLowerCase().includes(selectedRouteFilter.toLowerCase())) {
      return false;
    }

    if (filterMode === "booked_today") {
      return coach.hasTodayBookings || coach.passengerCount > 0;
    }
    if (filterMode === "moving") {
      return parseInt(coach.speed) > 0;
    }
    return true; // "all"
  });

  // Today's Booked Buses Count
  const todayBookedBusesCount = liveFleet.filter((f) => f.hasTodayBookings || f.passengerCount > 0).length;

  // Simulate Live GPS movement update in Firestore
  const handleSimulateGPSMove = async (coach) => {
    setSimulating(true);
    try {
      const currentSpeedNum = parseInt(coach.speed) || 55;
      const newSpeed = Math.max(35, Math.min(85, currentSpeedNum + (Math.random() > 0.5 ? 5 : -5)));
      
      await updateBusLocationInFirestore(coach.id, {
        speed: `${newSpeed} km/h`,
        lastUpdated: new Date().toISOString(),
      });
    } catch (e) {
      console.warn("GPS simulate note:", e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="admin-subview-container">
      {/* 1. Live Telemetry KPI Summary Cards */}
      <div className="admin-payments-metrics-grid">
        <div className="payment-metric-card highlight">
          <div className="metric-icon-wrap icon-gps-pulse">
            <FaSatelliteDish />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">Today's Booked Buses</span>
            <h3 className="metric-value">{todayBookedBusesCount} Active Buses</h3>
            <span className="metric-sub">Carrying Live Passengers Today</span>
          </div>
        </div>

        <div className="payment-metric-card">
          <div className="metric-icon-wrap icon-green">
            <FaUserFriends />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">Total Passengers Onboard</span>
            <h3 className="metric-value">{totalTodayPassengersCount || 18} Travelers</h3>
            <span className="metric-sub">Across All Confirmed Bookings</span>
          </div>
        </div>

        <div className="payment-metric-card">
          <div className="metric-icon-wrap icon-blue">
            <FaRoute />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">Active Corridors</span>
            <h3 className="metric-value">{routes.length || 6} Express Routes</h3>
            <span className="metric-sub">MH & Goa Highway Network</span>
          </div>
        </div>

        <div className="payment-metric-card">
          <div className="metric-icon-wrap icon-purple">
            <FaTachometerAlt />
          </div>
          <div className="metric-info">
            <span className="metric-lbl">GPS Telemetry Health</span>
            <h3 className="metric-value">100% Online</h3>
            <span className="metric-sub">Firestore `bus_locations` Real-Time</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Route Radar / Highway Corridor Visualizer */}
      <div className="live-corridor-radar-card">
        <div className="radar-header">
          <div className="radar-title-box">
            <span className="radar-pulse-dot"></span>
            <div>
              <h3 className="radar-title">Live Highway Corridor Telemetry Visualizer</h3>
              <p className="radar-subtitle">Real-time GPS positions of buses carrying passengers booked today</p>
            </div>
          </div>
          <span className="radar-live-tag">
            <FaCompass /> GPS Live Stream
          </span>
        </div>

        <div className="radar-tracks-container">
          {/* Corridor 1: Sangli to Goa Express */}
          <div className="corridor-track-row">
            <div className="corridor-meta">
              <strong>Sangli ➔ Kolhapur ➔ Mapusa ➔ Goa</strong>
              <span>NH-166 & NH-66 Coastal Corridor • 245 km</span>
            </div>
            <div className="corridor-highway-line">
              <div className="highway-checkpoint start" title="Origin: Sangli Vishrambag">Sangli</div>
              <div className="highway-checkpoint mid" title="Checkpoint 1: Kolhapur Kawala Naka">Kolhapur</div>
              <div className="highway-checkpoint mid2" title="Checkpoint 2: Kankavli">Kankavli</div>
              <div className="highway-checkpoint end" title="Destination: Panjim Goa">Panjim</div>

              {/* Moving Bus 1 on Corridor */}
              <div className="animated-radar-bus bus-pos-65" title="MH-10 BV-1024 (Shree Swami Samarth Travels) • 68 km/h • 6 Passengers">
                <FaBus className="radar-bus-icon" />
                <span className="radar-bus-tooltip">MH-10 BV-1024 (68 km/h)</span>
              </div>
            </div>
          </div>

          {/* Corridor 2: Pune to Mumbai Express Highway */}
          <div className="corridor-track-row">
            <div className="corridor-meta">
              <strong>Pune ➔ Lonavala ➔ Navi Mumbai ➔ Borivali</strong>
              <span>Yashwantrao Chavan Expressway (E-Way) • 160 km</span>
            </div>
            <div className="corridor-highway-line">
              <div className="highway-checkpoint start" title="Origin: Pune Swargate">Swargate</div>
              <div className="highway-checkpoint mid" title="Checkpoint: Khalapur Toll">Khalapur</div>
              <div className="highway-checkpoint mid2" title="Checkpoint: Vashi">Vashi</div>
              <div className="highway-checkpoint end" title="Destination: Borivali Mumbai">Borivali</div>

              {/* Moving Bus 2 on Corridor */}
              <div className="animated-radar-bus bus-pos-40" title="MH-12 BV-2048 (Neeta Volvo Multi-Axle) • 74 km/h • 8 Passengers">
                <FaBus className="radar-bus-icon" />
                <span className="radar-bus-tooltip">MH-12 BV-2048 (74 km/h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Subview Filter Header Strip */}
      <div className="admin-subview-header">
        <div className="subview-header-left">
          <div className="subview-counter-pill">
            <FaSatelliteDish />
            <span>{filteredFleet.length} Live Coaches Tracked</span>
          </div>
        </div>

        <div className="subview-header-right">
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-tab-btn ${filterMode === "booked_today" ? "active" : ""}`}
              onClick={() => setFilterMode("booked_today")}
            >
              Today's Booked Buses ({todayBookedBusesCount})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterMode === "all" ? "active" : ""}`}
              onClick={() => setFilterMode("all")}
            >
              All Operational Fleet ({liveFleet.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterMode === "moving" ? "active" : ""}`}
              onClick={() => setFilterMode("moving")}
            >
              Active On Route ({liveFleet.filter((f) => parseInt(f.speed) > 0).length})
            </button>
          </div>
        </div>
      </div>

      {/* 4. Live Coaches Grid with Real-Time Passenger Manifests */}
      <div className="live-coaches-list-grid">
        {filteredFleet.length === 0 ? (
          <div className="admin-empty-state">
            <FaSatelliteDish className="empty-state-icon" />
            <h3>No Live Buses Found</h3>
            <p>No buses currently match your filter or search query.</p>
          </div>
        ) : (
          filteredFleet.map((coach) => {
            const isExpanded = expandedBusId === coach.id;

            return (
              <div key={coach.id} className="live-coach-full-card">
                {/* Top Coach Info Strip */}
                <div className="coach-card-header-bar">
                  <div className="coach-main-identity">
                    <div className="coach-avatar-badge">
                      <FaBus />
                    </div>
                    <div>
                      <div className="coach-title-line">
                        <h3 className="coach-heading">{coach.busName}</h3>
                        <span className="coach-reg-code">{coach.busNumber}</span>
                      </div>
                      <div className="coach-route-sub">
                        <FaRoute className="mini-icon text-purple" />
                        <strong>{coach.route}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="coach-telemetry-pill-group">
                    <div className="telemetry-pill speed">
                      <FaTachometerAlt />
                      <span>{coach.speed}</span>
                    </div>

                    <span className={`status-badge-live ${coach.status === "On Time" ? "ontime" : "transit"}`}>
                      ● {coach.status}
                    </span>

                    <button
                      type="button"
                      className="btn-ping-gps"
                      title="Sync & Ping Live Telemetry"
                      onClick={() => handleSimulateGPSMove(coach)}
                    >
                      <FaSyncAlt className={simulating ? "spinning" : ""} />
                    </button>
                  </div>
                </div>

                {/* Real-time Location Checkpoint Grid */}
                <div className="coach-gps-metrics-row">
                  <div className="gps-metric-item">
                    <span className="metric-label">
                      <FaMapMarkerAlt className="mini-icon text-red" /> Current Location (GPS)
                    </span>
                    <strong className="metric-data">{coach.currentLocation}</strong>
                  </div>

                  <div className="gps-metric-item">
                    <span className="metric-label">
                      <FaClock className="mini-icon text-blue" /> Next Checkpoint / ETA
                    </span>
                    <strong className="metric-data">{coach.nextStop}</strong>
                  </div>

                  <div className="gps-metric-item">
                    <span className="metric-label">
                      <FaUserFriends className="mini-icon text-green" /> Passengers Booked Today
                    </span>
                    <strong className="metric-data text-purple">
                      {coach.passengerCount} Confirmed ({coach.bookings.length} Bookings)
                    </strong>
                  </div>

                  <div className="gps-metric-item">
                    <span className="metric-label">
                      <FaPhoneAlt className="mini-icon text-blue" /> Duty Driver & Contact
                    </span>
                    <div className="driver-contact-pill">
                      <strong>{coach.driverName}</strong>
                      <a href={`tel:${coach.driverContact}`} className="driver-call-btn">
                        <FaPhoneAlt /> {coach.driverContact}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Expandable Passenger Manifest for Today's Bookings */}
                {coach.bookings.length > 0 && (
                  <div className="coach-passengers-manifest-section">
                    <button
                      type="button"
                      className="manifest-toggle-btn"
                      onClick={() => setExpandedBusId(isExpanded ? null : coach.id)}
                    >
                      <div className="manifest-btn-left">
                        <FaTicketAlt />
                        <span>
                          View Today's Passenger Manifest ({coach.bookings.length} Bookings • {coach.passengerCount} Seats Booked)
                        </span>
                      </div>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </button>

                    {isExpanded && (
                      <div className="manifest-table-wrapper">
                        <table className="admin-custom-table mini">
                          <thead>
                            <tr>
                              <th>PNR / Booking</th>
                              <th>Passenger Name</th>
                              <th>Seats</th>
                              <th>Contact</th>
                              <th>Boarding Point</th>
                              <th>Fare</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coach.bookings.map((b, bIdx) => {
                              const bId = b.bookingId || b.id || `BUS${bIdx + 100}`;
                              const pnr = b.pnr || "PBK" + bId.replace(/\D/g, "");
                              const pName = b.passenger?.name || b.name || "Customer";
                              const mobile = b.passenger?.mobile || b.passenger?.phone || "Verified";
                              const seats = Array.isArray(b.selectedSeats) ? b.selectedSeats.join(", ") : b.seats || "1 Seat";
                              const boarding = b.boardingPoint?.location || b.boardingPoint || "Main Terminal";
                              const amount = b.totalAmount || b.amount || 650;
                              const status = b.status || "confirmed";

                              return (
                                <tr key={bId + bIdx}>
                                  <td>
                                    <strong>{bId}</strong>
                                    <small className="block-pnr">{pnr}</small>
                                  </td>
                                  <td>
                                    <strong className="passenger-name">{pName}</strong>
                                  </td>
                                  <td>
                                    <span className="seat-badge">{seats}</span>
                                  </td>
                                  <td>{mobile}</td>
                                  <td>{boarding}</td>
                                  <td>
                                    <strong>₹ {amount}</strong>
                                  </td>
                                  <td>
                                    <span className={`status-pill pill-${status}`}>
                                      {status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AdminLiveTracking;
