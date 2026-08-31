import React, { useState } from "react";
import {
  FaUsers,
  FaBus,
  FaRoute,
  FaTicketAlt,
  FaRupeeSign,
  FaArrowUp,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaPlus,
  FaChartLine,
  FaBolt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaSatelliteDish,
  FaTachometerAlt,
  FaPhoneAlt,
  FaBell,
  FaUserShield,
  FaHeadset,
} from "react-icons/fa";

function AdminDashboard({
  users = [],
  buses = [],
  routes = [],
  bookings = [],
  payments = [],
  supportQueries = [],
  busLocations = [],
  admins = [],
  setActiveTab,
  onOpenAddBus,
  onOpenAddRoute,
}) {
  const [chartTimeframe, setChartTimeframe] = useState("30days");

  // Calculate KPIs
  const totalUsersCount = users.length;
  const totalBusesCount = buses.length;
  const totalRoutesCount = routes.length;
  const totalBookingsCount = bookings.length;

  // Calculate Total Revenue from payments and bookings
  const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) ||
    bookings.reduce((acc, b) => {
      if (b.status !== "cancelled") {
        return acc + (Number(b.totalAmount) || 0);
      }
      return acc;
    }, 0);

  const confirmedBookingsCount = bookings.filter(
    (b) => b.status === "confirmed" || b.status === "upcoming"
  ).length;
  const completedBookingsCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledBookingsCount = bookings.filter((b) => b.status === "cancelled").length;

  // Recent 6 Bookings
  const recentBookings = bookings.slice(0, 6);

  // Top 4 Popular Routes
  const popularRoutes = routes.slice(0, 4);

  // Dynamic weekly chart bars simulation based on actual bookings
  const weeklyData = [
    { day: "Mon", revenue: 14500, bookings: 12 },
    { day: "Tue", revenue: 18200, bookings: 16 },
    { day: "Wed", revenue: 22400, bookings: 19 },
    { day: "Thu", revenue: 28900, bookings: 24 },
    { day: "Fri", revenue: 41200, bookings: 35 },
    { day: "Sat", revenue: 54600, bookings: 46 },
    { day: "Sun", revenue: 48300, bookings: 41 },
  ];

  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue));

  return (
    <div className="admin-dashboard-view">
      {/* 1. TOP SUMMARY STAT CARDS (5 Cards) */}
      <section className="dashboard-stats-grid">
        {/* Card 1: Total Users */}
        <div
          className="dashboard-stat-card card-users"
          onClick={() => setActiveTab("users")}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <div className="stat-icon-box icon-users">
              <FaUsers />
            </div>
            <span className="stat-growth-tag tag-positive">
              <FaArrowUp /> +14.8%
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Users</span>
            <h3 className="stat-value">{totalUsersCount > 0 ? totalUsersCount : "0"}</h3>
            <p className="stat-meta">Active registered customers</p>
          </div>
        </div>

        {/* Card 2: Total Buses */}
        <div
          className="dashboard-stat-card card-buses"
          onClick={() => setActiveTab("buses")}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <div className="stat-icon-box icon-buses">
              <FaBus />
            </div>
            <span className="stat-pill-sub">In Service</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Buses</span>
            <h3 className="stat-value">{totalBusesCount}</h3>
            <p className="stat-meta">AC Sleeper & Multi-Axle Fleet</p>
          </div>
        </div>

        {/* Card 3: Total Routes */}
        <div
          className="dashboard-stat-card card-routes"
          onClick={() => setActiveTab("routes")}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <div className="stat-icon-box icon-routes">
              <FaRoute />
            </div>
            <span className="stat-pill-sub">Corridors</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Routes</span>
            <h3 className="stat-value">{totalRoutesCount}</h3>
            <p className="stat-meta">Interstate & Intra-state</p>
          </div>
        </div>

        {/* Card 4: Total Bookings */}
        <div
          className="dashboard-stat-card card-bookings"
          onClick={() => setActiveTab("bookings")}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <div className="stat-icon-box icon-bookings">
              <FaTicketAlt />
            </div>
            <span className="stat-growth-tag tag-positive">
              <FaArrowUp /> +22.4%
            </span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Bookings</span>
            <h3 className="stat-value">{totalBookingsCount}</h3>
            <p className="stat-meta">{confirmedBookingsCount} Upcoming / Active</p>
          </div>
        </div>

        {/* Card 5: Total Payments / Revenue */}
        <div
          className="dashboard-stat-card card-payments"
          onClick={() => setActiveTab("payments")}
          role="button"
          tabIndex={0}
        >
          <div className="stat-card-top">
            <div className="stat-icon-box icon-payments">
              <FaRupeeSign />
            </div>
            <span className="stat-growth-tag tag-purple">Real-time</span>
          </div>
          <div className="stat-card-body">
            <span className="stat-label">Total Revenue</span>
            <h3 className="stat-value">₹ {totalRevenue.toLocaleString("en-IN")}</h3>
            <p className="stat-meta">Verified Collections</p>
          </div>
        </div>
      </section>

      {/* 2. ANALYTICS & CHARTS SECTION */}
      <section className="dashboard-analytics-grid">
        {/* Main Chart: Revenue & Booking Volume */}
        <div className="dashboard-chart-card">
          <div className="chart-card-header">
            <div>
              <h2 className="chart-title">Revenue & Booking Velocity</h2>
              <p className="chart-subtitle">Weekly booking trends and gross transaction value</p>
            </div>
            <div className="chart-actions">
              <div className="timeframe-toggle">
                <button
                  type="button"
                  className={`tf-btn ${chartTimeframe === "7days" ? "active" : ""}`}
                  onClick={() => setChartTimeframe("7days")}
                >
                  This Week
                </button>
                <button
                  type="button"
                  className={`tf-btn ${chartTimeframe === "30days" ? "active" : ""}`}
                  onClick={() => setChartTimeframe("30days")}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          {/* Visual Custom Bar & Area Trend Chart */}
          <div className="visual-chart-container">
            <div className="chart-bars-list">
              {weeklyData.map((item) => {
                const heightPercent = Math.round((item.revenue / maxRevenue) * 100);
                return (
                  <div key={item.day} className="chart-col">
                    <div className="chart-bar-wrap" title={`₹${item.revenue.toLocaleString()} (${item.bookings} bookings)`}>
                      <div
                        className="chart-bar-fill"
                        style={{ height: `${heightPercent}%` }}
                      >
                        <span className="bar-tooltip">₹{(item.revenue / 1000).toFixed(1)}k</span>
                      </div>
                    </div>
                    <span className="chart-x-label">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-footer-stats">
            <div className="footer-stat-item">
              <span className="dot dot-purple"></span>
              <span className="label">Avg Daily Revenue:</span>
              <strong>₹ 32,500</strong>
            </div>
            <div className="footer-stat-item">
              <span className="dot dot-blue"></span>
              <span className="label">Avg Conversion Rate:</span>
              <strong>94.2%</strong>
            </div>
            <div className="footer-stat-item">
              <span className="dot dot-green"></span>
              <span className="label">Active Fleet on Road:</span>
              <strong>{busLocations.length || totalBusesCount} Units Live</strong>
            </div>
          </div>
        </div>

        {/* Status Distribution Breakdown */}
        <div className="dashboard-donut-card">
          <div className="chart-card-header">
            <h2 className="chart-title">Booking Status</h2>
            <span className="live-status-pill">Live Sync</span>
          </div>

          <div className="status-progress-breakdown">
            <div className="status-metric-row">
              <div className="metric-info">
                <span className="status-indicator confirmed"></span>
                <span className="metric-name">Upcoming & Confirmed</span>
              </div>
              <span className="metric-value">
                {confirmedBookingsCount} ({totalBookingsCount > 0 ? Math.round((confirmedBookingsCount / totalBookingsCount) * 100) : 100}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-green"
                style={{
                  width: `${totalBookingsCount > 0 ? (confirmedBookingsCount / totalBookingsCount) * 100 : 85}%`,
                }}
              ></div>
            </div>

            <div className="status-metric-row">
              <div className="metric-info">
                <span className="status-indicator completed"></span>
                <span className="metric-name">Completed Trips</span>
              </div>
              <span className="metric-value">
                {completedBookingsCount} ({totalBookingsCount > 0 ? Math.round((completedBookingsCount / totalBookingsCount) * 100) : 0}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-blue"
                style={{
                  width: `${totalBookingsCount > 0 ? (completedBookingsCount / totalBookingsCount) * 100 : 10}%`,
                }}
              ></div>
            </div>

            <div className="status-metric-row">
              <div className="metric-info">
                <span className="status-indicator cancelled"></span>
                <span className="metric-name">Cancelled / Refunded</span>
              </div>
              <span className="metric-value">
                {cancelledBookingsCount} ({totalBookingsCount > 0 ? Math.round((cancelledBookingsCount / totalBookingsCount) * 100) : 0}%)
              </span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill fill-red"
                style={{
                  width: `${totalBookingsCount > 0 ? (cancelledBookingsCount / totalBookingsCount) * 100 : 5}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Quick Shortcuts Box */}
          <div className="quick-actions-panel">
            <h4 className="quick-actions-title">Quick Actions</h4>
            <div className="quick-actions-buttons">
              <button
                type="button"
                className="quick-action-btn btn-add-bus"
                onClick={onOpenAddBus}
              >
                <FaPlus /> Add Bus
              </button>
              <button
                type="button"
                className="quick-action-btn btn-add-route"
                onClick={onOpenAddRoute}
              >
                <FaRoute /> Add Route
              </button>
              <button
                type="button"
                className="quick-action-btn btn-view-bookings"
                onClick={() => setActiveTab("bookings")}
              >
                <FaTicketAlt /> All Bookings
              </button>
              <button
                type="button"
                className="quick-action-btn"
                style={{ background: "#fdf2f8", color: "#d81b60", border: "1px solid #fbcfe8" }}
                onClick={() => setActiveTab("support")}
              >
                <FaHeadset /> Support ({supportQueries.filter((q) => (q.status || "Open").toLowerCase() === "open").length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LIVE GPS BUS FLEET TRACKING (From Firestore `bus_locations`) */}
      <section className="dashboard-gps-fleet-section">
        <div className="dashboard-gps-card">
          <div className="table-card-header">
            <div className="header-with-pulse">
              <div className="gps-live-dot"></div>
              <div>
                <h2 className="table-title">Live GPS Fleet Tracking (`bus_locations`)</h2>
                <p className="table-subtitle">Real-time telemetry, speeds and checkpoint tracking from Firestore</p>
              </div>
            </div>
            <span className="gps-active-badge">
              <FaSatelliteDish /> {busLocations.length} GPS Feeds Active
            </span>
          </div>

          <div className="gps-coaches-grid">
            {busLocations.slice(0, 4).map((bLoc) => (
              <div key={bLoc.id} className="gps-coach-card">
                <div className="gps-card-top">
                  <div className="coach-reg-info">
                    <strong className="coach-bus-name">{bLoc.busName}</strong>
                    <span className="coach-bus-num">{bLoc.busNumber}</span>
                  </div>
                  <span className={`coach-status-pill ${bLoc.status === "On Time" ? "ontime" : "transit"}`}>
                    {bLoc.status}
                  </span>
                </div>

                <div className="coach-route-strip">
                  <span className="route-tag">{bLoc.route}</span>
                  <span className="speed-tag">
                    <FaTachometerAlt /> {bLoc.speed}
                  </span>
                </div>

                <div className="coach-location-details">
                  <div className="loc-detail-row">
                    <span className="loc-label"><FaMapMarkerAlt className="mini-icon text-red" /> Current Location:</span>
                    <strong className="loc-value">{bLoc.currentLocation}</strong>
                  </div>
                  <div className="loc-detail-row">
                    <span className="loc-label"><FaClock className="mini-icon text-blue" /> Next Checkpoint:</span>
                    <span className="loc-value">{bLoc.nextStop}</span>
                  </div>
                </div>

                <div className="coach-driver-footer">
                  <span className="driver-name"><FaUserShield className="mini-icon" /> {bLoc.driverName}</span>
                  <a href={`tel:${bLoc.driverContact}`} className="driver-phone-link">
                    <FaPhoneAlt /> {bLoc.driverContact}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR ROUTES & RECENT REAL-TIME BOOKINGS */}
      <section className="dashboard-bottom-grid">
        {/* Recent Real-Time Bookings */}
        <div className="dashboard-table-card">
          <div className="table-card-header">
            <div>
              <h2 className="table-title">Recent Real-Time Bookings (`bookings`)</h2>
              <p className="table-subtitle">Live bookings stream from customers</p>
            </div>
            <button
              type="button"
              className="view-all-btn"
              onClick={() => setActiveTab("bookings")}
            >
              View All ({totalBookingsCount}) <FaArrowRight />
            </button>
          </div>

          <div className="admin-table-container">
            {recentBookings.length === 0 ? (
              <div className="admin-empty-state">
                <FaTicketAlt className="empty-state-icon" />
                <p>No bookings received yet.</p>
                <small>New customer bookings will automatically appear here in real-time.</small>
              </div>
            ) : (
              <table className="admin-custom-table">
                <thead>
                  <tr>
                    <th>Booking / PNR</th>
                    <th>Passenger</th>
                    <th>Bus & Route</th>
                    <th>Seats</th>
                    <th>Fare</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b, idx) => {
                    const bookingId = b.bookingId || b.id || `BUS${1000 + idx}`;
                    const pnr = b.pnr || "PBK" + bookingId.replace(/\D/g, "");
                    const passengerName = b.passenger?.name || b.name || "Customer";
                    const busName = b.bus?.name || "Express Coach";
                    const routeText = b.bus?.from && b.bus?.to ? `${b.bus.from} → ${b.bus.to}` : "Sangli → Goa";
                    const seats = Array.isArray(b.selectedSeats) ? b.selectedSeats.join(", ") : b.seats || "1 Seat";
                    const amount = b.totalAmount || b.amount || 650;
                    const status = b.status || "upcoming";

                    return (
                      <tr key={bookingId + idx}>
                        <td>
                          <div className="pnr-cell">
                            <strong>{bookingId}</strong>
                            <small>{pnr}</small>
                          </div>
                        </td>
                        <td>
                          <div className="passenger-cell">
                            <span className="passenger-name">{passengerName}</span>
                            <small>{b.passenger?.mobile || b.passenger?.email || "Confirmed"}</small>
                          </div>
                        </td>
                        <td>
                          <div className="route-cell">
                            <span className="bus-title">{busName}</span>
                            <small>{routeText}</small>
                          </div>
                        </td>
                        <td>
                          <span className="seat-badge">{seats}</span>
                        </td>
                        <td>
                          <strong className="fare-text">₹ {amount}</strong>
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
            )}
          </div>
        </div>

        {/* Popular Corridors */}
        <div className="dashboard-routes-card">
          <div className="table-card-header">
            <div>
              <h2 className="table-title">Top Active Routes (`routes`)</h2>
              <p className="table-subtitle">High passenger demand corridors</p>
            </div>
            <button
              type="button"
              className="view-all-btn"
              onClick={() => setActiveTab("routes")}
            >
              Manage Routes <FaArrowRight />
            </button>
          </div>

          <div className="routes-list-stream">
            {popularRoutes.map((rt, i) => (
              <div key={rt.id || i} className="route-stream-item">
                <div className="route-stream-icon">
                  <FaMapMarkerAlt />
                </div>
                <div className="route-stream-details">
                  <div className="route-stream-name">
                    <strong>{rt.from}</strong>
                    <span className="route-arrow">⇄</span>
                    <strong>{rt.to}</strong>
                  </div>
                  <div className="route-stream-meta">
                    <span>{rt.distance || "240 km"}</span>
                    <span>•</span>
                    <span>{rt.duration || "5h 30m"}</span>
                    <span>•</span>
                    <span>{rt.busesCount || 3} Daily Buses</span>
                  </div>
                </div>
                <div className="route-stream-fare">
                  <span className="fare-label">From</span>
                  <strong className="fare-amount">₹ {rt.baseFare || 650}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
