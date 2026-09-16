import React, { useState, useEffect, useRef } from "react";
import {
  FaBars,
  FaSearch,
  FaBell,
  FaSyncAlt,
  FaUserShield,
  FaSignOutAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaChevronDown,
  FaClock,
  FaTicketAlt,
  FaRupeeSign,
  FaUser,
  FaBus,
  FaHeadset,
  FaExclamationCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

function AdminNavbar({
  activeTab,
  onToggleSidebar,
  searchQuery,
  setSearchQuery,
  isLiveSynced = true,
  lastUpdated,
  bookings = [],
  supportQueries = [],
  admins = [],
  onRefresh,
  setActiveTab,
}) {
  const navigate = useNavigate();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  // Close dropdowns when clicking outside anywhere on document
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setProfileDropdown(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      ) {
        setNotifDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Derive dynamic live notifications from actual bookings and support queries
  const liveAlerts = [
    // Open Support Queries
    ...supportQueries
      .filter((q) => (q.status || "Open").toLowerCase() === "open")
      .map((q) => ({
        id: `SQ_${q.id || q.docId}`,
        type: "support",
        title: `Support Ticket: ${q.issueType || "Query"}`,
        message: `${q.name || "Customer"} asked: "${q.message?.slice(0, 75)}..."`,
        timestamp: q.createdAt || q.timestamp,
        targetTab: "support",
        read: dismissedAlerts.has(`SQ_${q.id || q.docId}`),
      })),
    // Recent Bookings (top 5)
    ...bookings.slice(0, 5).map((b) => ({
      id: `BK_${b.bookingId || b.id}`,
      type: "booking",
      title: `Booking ${b.bookingId || b.id} Confirmed`,
      message: `${b.passenger?.name || b.name || "Customer"} booked ${b.bus?.from && b.bus?.to ? `${b.bus.from} ➔ ${b.bus.to}` : "Bus"} (₹${b.totalAmount || 650})`,
      timestamp: b.createdAt || b.bookingDate,
      targetTab: "bookings",
      read: dismissedAlerts.has(`BK_${b.bookingId || b.id}`),
    })),
  ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  const unreadAlerts = liveAlerts.filter((a) => !a.read);
  const unreadCount = unreadAlerts.length;

  const currentAdmin = admins.find((a) => a.email === "busvista@gmail.com") || {
    name: "Master Administrator",
    email: "busvista@gmail.com",
    role: "Super Admin",
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return {
          title: "Dashboard Overview",
          subtitle: "Real-time analytics & fleet summary",
        };
      case "users":
        return {
          title: "User Management",
          subtitle: "Registered customers & profiles",
        };
      case "buses":
        return {
          title: "Bus Fleet Management",
          subtitle: "Active coaches, seats & schedules",
        };
      case "routes":
        return {
          title: "Route Operations",
          subtitle: "Corridors, distance, and stops",
        };
      case "bookings":
        return {
          title: "All Bookings",
          subtitle: "Real-time reservations & e-tickets",
        };
      case "payments":
        return {
          title: "Payment Transactions",
          subtitle: "Financial revenue & collections",
        };
      case "support":
        return {
          title: "Customer Support & Inquiries",
          subtitle: "Real-time user help requests & issue tracking",
        };
      case "livetracking":
        return {
          title: "Live Fleet GPS Tracking",
          subtitle: "Active buses booked today & live telemetry",
        };
      default:
        return { title: "Admin Console", subtitle: "BusVista Control Center" };
    }
  };

  const { title, subtitle } = getPageTitle();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin/login");
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case "support":
        return (
          <FaHeadset className="notif-type-icon" style={{ color: "#d81b60" }} />
        );
      case "booking":
        return <FaTicketAlt className="notif-type-icon booking" />;
      case "payment":
        return <FaRupeeSign className="notif-type-icon payment" />;
      case "user":
        return <FaUser className="notif-type-icon user" />;
      case "fleet":
        return <FaBus className="notif-type-icon fleet" />;
      default:
        return <FaBell className="notif-type-icon default" />;
    }
  };

  const handleDismissAlert = (e, alertId) => {
    e.stopPropagation();
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const handleClearAllAlerts = () => {
    const allIds = liveAlerts.map((a) => a.id);
    setDismissedAlerts(new Set(allIds));
  };

  return (
    <header className="admin-navbar">
      {/* Left section: Hamburger & Titles */}
      <div className="navbar-left">
        <button
          type="button"
          className="admin-hamburger-btn"
          onClick={onToggleSidebar}
          title="Toggle Navigation Menu"
        >
          <FaBars />
        </button>

        <div className="admin-page-heading">
          <h1 className="admin-current-title">{title}</h1>
          <p className="admin-current-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* Center / Search Bar */}
      <div className="navbar-search-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchQuery("")}
          >
            ×
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="navbar-right">
        {/* Real-time Status Indicator */}
        <div
          className="admin-live-badge"
          title="Connected to Firebase Firestore in Real-Time (7 Collections Active)"
        >
          <span className="live-pulse-dot"></span>
          <span className="live-text">Firestore Live</span>
        </div>

        {/* Real-Time Live Activity Bell Dropdown */}
        <div className="admin-notif-wrapper" ref={notifDropdownRef}>
          <button
            type="button"
            className="admin-action-icon-btn notif-btn"
            onClick={() => {
              setNotifDropdown((prev) => !prev);
              setProfileDropdown(false);
            }}
            title="Real-Time Alerts (Bookings & Support Queries)"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notif-count-badge">{unreadCount}</span>
            )}
          </button>

          {notifDropdown && (
            <div className="admin-notif-dropdown">
              <div className="notif-dropdown-header">
                <div>
                  <strong>Live Activity Stream</strong>
                  <span className="notif-counter-tag">
                    {unreadCount} pending
                  </span>
                </div>
                {liveAlerts.length > 0 && (
                  <button
                    type="button"
                    className="notif-clear-btn"
                    onClick={handleClearAllAlerts}
                  >
                    Mark All Read
                  </button>
                )}
              </div>

              <div className="notif-items-list">
                {liveAlerts.length === 0 ? (
                  <div className="notif-empty-box">
                    <FaBell className="notif-empty-icon" />
                    <p>No new alerts at this moment.</p>
                    <small>
                      Real-time booking and user activities will appear here.
                    </small>
                  </div>
                ) : (
                  liveAlerts.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item-row ${n.read ? "read" : "unread"}`}
                      onClick={() => {
                        setDismissedAlerts((prev) => new Set([...prev, n.id]));
                        setNotifDropdown(false);
                        if (setActiveTab && n.targetTab)
                          setActiveTab(n.targetTab);
                      }}
                    >
                      <div className="notif-icon-col">
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="notif-content-col">
                        <strong className="notif-item-title">{n.title}</strong>
                        <p className="notif-item-msg">{n.message}</p>
                        <span className="notif-time-ago">
                          <FaClock className="mini-icon" />{" "}
                          {n.timestamp
                            ? new Date(n.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </span>
                      </div>
                      {!n.read && (
                        <button
                          type="button"
                          className="notif-mark-read-btn"
                          title="Dismiss alert"
                          onClick={(e) => handleDismissAlert(e, n.id)}
                        >
                          ●
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Refresh button */}
        {onRefresh && (
          <button
            type="button"
            className="admin-action-icon-btn"
            onClick={onRefresh}
            title="Refresh real-time data sync"
          >
            <FaSyncAlt />
          </button>
        )}

        {/* Admin Profile Pill */}
        <div className="admin-profile-pill-wrapper" ref={profileDropdownRef}>
          <button
            type="button"
            className="admin-profile-btn"
            onClick={() => {
              setProfileDropdown((prev) => !prev);
              setNotifDropdown(false);
            }}
          >
            <div className="admin-avatar">
              <FaUserShield />
            </div>
            <div className="admin-profile-info">
              <span className="admin-name">{currentAdmin.name}</span>
              <span className="admin-email-tag">{currentAdmin.email}</span>
            </div>
            <FaChevronDown
              className={`profile-chevron ${profileDropdown ? "open" : ""}`}
            />
          </button>

          {profileDropdown && (
            <div className="admin-profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  <FaUserShield />
                </div>
                <div className="dropdown-user-details">
                  <strong>{currentAdmin.name}</strong>
                  <small>
                    {currentAdmin.email} • {currentAdmin.role}
                  </small>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link
                to="/"
                className="dropdown-item"
                onClick={() => setProfileDropdown(false)}
              >
                <FaExternalLinkAlt /> Go to User Website
              </Link>
              <button
                type="button"
                className="dropdown-item logout"
                onClick={() => {
                  setProfileDropdown(false);
                  handleLogout();
                }}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
