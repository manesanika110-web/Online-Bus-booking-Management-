import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaExternalLinkAlt, FaTimes } from "react-icons/fa";
import BusVistaLogo from "../components/BusVistaLogo";

// Custom SVG Icons matching the reference image
const DashboardIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke={active ? "#ffffff" : "#475569"} strokeWidth="1.8" fill={active ? "rgba(255,255,255,0.15)" : "#f8fafc"} />
    <rect x="6" y="10" width="3" height="8" rx="1.5" fill={active ? "#ffffff" : "#10b981"} />
    <rect x="10.5" y="6" width="3" height="12" rx="1.5" fill={active ? "#ffffff" : "#ef4444"} />
    <rect x="15" y="13" width="3" height="5" rx="1.5" fill={active ? "#ffffff" : "#3b82f6"} />
  </svg>
);

const UsersIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <path
      d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
      stroke={active ? "#ffffff" : "#334155"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="9"
      cy="7"
      r="4"
      stroke={active ? "#ffffff" : "#334155"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 21v-2a4 4 0 0 0-3-3.87"
      stroke={active ? "#ffffff" : "#334155"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      stroke={active ? "#ffffff" : "#334155"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BusesIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <rect x="3" y="4" width="18" height="13" rx="3" stroke={active ? "#ffffff" : "#1e293b"} strokeWidth="1.8" fill={active ? "rgba(255,255,255,0.15)" : "#ffffff"} />
    <rect x="5.5" y="6" width="13" height="4.5" rx="1.5" fill={active ? "#ffffff" : "#38bdf8"} stroke={active ? "#ffffff" : "#0284c7"} strokeWidth="1" />
    <circle cx="6.5" cy="13.5" r="1.2" fill={active ? "#ffffff" : "#f59e0b"} />
    <circle cx="17.5" cy="13.5" r="1.2" fill={active ? "#ffffff" : "#f59e0b"} />
    <rect x="9.5" y="13" width="5" height="1.2" rx="0.6" fill={active ? "#ffffff" : "#64748b"} />
    <circle cx="6.5" cy="17.5" r="2" fill={active ? "#ffffff" : "#0f172a"} />
    <circle cx="17.5" cy="17.5" r="2" fill={active ? "#ffffff" : "#0f172a"} />
  </svg>
);

const RoutesIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <circle cx="12" cy="7" r="4.5" fill={active ? "#ffffff" : "#ef4444"} stroke={active ? "#ffffff" : "#b91c1c"} strokeWidth="1.5" />
    <path d="M12 11.5V20" stroke={active ? "#ffffff" : "#475569"} strokeWidth="2.2" strokeLinecap="round" />
    <ellipse cx="12" cy="20" rx="3.5" ry="1.5" fill={active ? "#ffffff" : "#94a3b8"} opacity="0.6" />
  </svg>
);

const BookingsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <rect x="3" y="5" width="18" height="14" rx="2.5" stroke={active ? "#ffffff" : "#0f172a"} strokeWidth="1.8" fill={active ? "rgba(255,255,255,0.15)" : "#e0f2fe"} />
    <line x1="8" y1="5" x2="8" y2="19" stroke={active ? "#ffffff" : "#0284c7"} strokeWidth="1.5" strokeDasharray="2 2" />
    <circle cx="3" cy="12" r="2" fill={active ? "#8e24aa" : "#ffffff"} />
    <circle cx="21" cy="12" r="2" fill={active ? "#8e24aa" : "#ffffff"} />
    <line x1="11" y1="9" x2="17" y2="9" stroke={active ? "#ffffff" : "#0369a1"} strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="13" x2="15" y2="13" stroke={active ? "#ffffff" : "#0369a1"} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PaymentsIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <rect x="3" y="5" width="18" height="14" rx="3" stroke={active ? "#ffffff" : "#0f172a"} strokeWidth="1.8" fill={active ? "rgba(255,255,255,0.15)" : "#ffffff"} />
    <rect x="3" y="9" width="18" height="3" fill={active ? "#ffffff" : "#f59e0b"} />
    <rect x="6" y="14" width="4" height="2" rx="1" fill={active ? "#ffffff" : "#0f172a"} />
  </svg>
);

const LiveTrackingIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <circle cx="12" cy="12" r="9" stroke={active ? "#ffffff" : "#10b981"} strokeWidth="1.8" />
    <circle cx="12" cy="12" r="5" stroke={active ? "#ffffff" : "#059669"} strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="12" cy="12" r="2.5" fill={active ? "#ffffff" : "#10b981"} />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke={active ? "#ffffff" : "#10b981"} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SupportQueriesIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sidebar-icon-svg">
    <path
      d="M3 11a9 9 0 0 1 18 0v6a3 3 0 0 1-3 3h-2v-6h3v-3a7 7 0 0 0-14 0v3h3v6H6a3 3 0 0 1-3-3v-6z"
      stroke={active ? "#ffffff" : "#0f172a"}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "rgba(255,255,255,0.15)" : "none"}
    />
  </svg>
);

function AdminSidebar({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen, counts = {} }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", Icon: DashboardIcon, badge: null },
    { id: "users", label: "Users", Icon: UsersIcon, badge: counts.users || 0 },
    { id: "buses", label: "Buses", Icon: BusesIcon, badge: counts.buses || 0 },
    { id: "routes", label: "Routes", Icon: RoutesIcon, badge: counts.routes || 0 },
    { id: "bookings", label: "Bookings", Icon: BookingsIcon, badge: counts.bookings || 0 },
    { id: "payments", label: "Payments", Icon: PaymentsIcon, badge: counts.payments || 0 },
    { id: "support", label: "Support Queries", Icon: SupportQueriesIcon, badge: counts.supportQueries || 0 },
    { id: "livetracking", label: "Live Location", Icon: LiveTrackingIcon, badge: counts.liveBuses || "LIVE", isLiveBadge: true },
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("busvista_admin_auth");
    localStorage.removeItem("busvista_admin_email");
    localStorage.removeItem("busvista_admin_login_time");
    navigate("/admin/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div className="admin-sidebar-backdrop" onClick={() => setIsMobileOpen(false)} />
      )}

      <aside className={`admin-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Brand Header matching Reference Image */}
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-sidebar-brand" onClick={() => setActiveTab("dashboard")}>
            <div className="sidebar-logo-icon">
              <BusVistaLogo size={36} />
            </div>
            <div className="sidebar-brand-name">
              <span className="brand-bus-text">Bus</span>
              <span className="brand-vista-text">Vista</span>
            </div>
          </Link>

          {isMobileOpen && (
            <button
              type="button"
              className="sidebar-close-mobile-btn"
              onClick={() => setIsMobileOpen(false)}
              title="Close Menu"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {/* Navigation Menu List */}
        <nav className="admin-sidebar-nav">
          <ul className="sidebar-menu-list">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              const { Icon } = item;

              return (
                <li key={item.id} className="sidebar-menu-item">
                  <button
                    type="button"
                    className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectTab(item.id)}
                  >
                    <div className="sidebar-btn-content">
                      <span className="sidebar-icon-wrapper">
                        <Icon active={isActive} />
                      </span>
                      <span className="sidebar-btn-label">{item.label}</span>
                    </div>

                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`sidebar-count-badge ${isActive ? "badge-active" : ""} ${item.isLiveBadge ? "badge-live-pulse" : ""}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer with Logout & User Site Link */}
        <div className="admin-sidebar-footer">
          <Link to="/" className="sidebar-footer-link" title="Open User Booking Website">
            <FaExternalLinkAlt className="footer-link-icon" />
            <span>Go to BusVista Site</span>
          </Link>
          <button type="button" className="sidebar-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="footer-link-icon" />
            <span>Admin Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
