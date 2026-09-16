import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./../css/Navbar.css";
import {
  FaBus,
  FaGift,
  FaMapMarkerAlt,
  FaQuestionCircle,
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaTicketAlt,
  FaLock,
  FaUser,
  FaBan,
  FaBars,
  FaTimes,
  FaHotel,
  FaTrain,
  FaPlane,
  FaUserShield,
} from "react-icons/fa";

import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { successAlert, errorAlert } from "../utils/alert";

import TrackTicketModal from "./TrackTicketModal";
import NeedHelpModal from "./NeedHelpModal";
import OffersModal from "./OffersModal";
import ServiceModal from "./ServiceModal";
import ProfileModal from "./ProfileModal";
import BusVistaLogo from "./BusVistaLogo";

function Navbar() {
  const [user, setUser] = useState(() => auth.currentUser);
  const [profilePhoto, setProfilePhoto] = useState(
    () => localStorage.getItem("profilePhoto") || null,
  );
  const [activeTab, setActiveTab] = useState("buses");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Modals state
  const [isTrackOpen, setIsTrackOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isOffersOpen, setIsOffersOpen] = useState(false);
  const [serviceModalType, setServiceModalType] = useState(null);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync active service tab from URL path
  useEffect(() => {
    if (location.pathname.startsWith("/hotels")) {
      setActiveTab("hotels");
    } else if (location.pathname.startsWith("/trains")) {
      setActiveTab("trains");
    } else if (location.pathname.startsWith("/flights")) {
      setActiveTab("flights");
    } else {
      setActiveTab("buses");
    }
  }, [location.pathname]);

  // Listen for local profile updates
  useEffect(() => {
    const syncProfile = () => {
      const savedPhoto = localStorage.getItem("profilePhoto") || null;
      setProfilePhoto(savedPhoto);
      if (auth.currentUser) {
        setUser(auth.currentUser);
      }
    };

    window.addEventListener("profileUpdated", syncProfile);
    window.addEventListener("storage", syncProfile);
    return () => {
      window.removeEventListener("profileUpdated", syncProfile);
      window.removeEventListener("storage", syncProfile);
    };
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch Firestore profile data
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.profilePhoto) {
              setProfilePhoto(data.profilePhoto);
              localStorage.setItem("profilePhoto", data.profilePhoto);
            }
            if (data.displayName || data.name) {
              localStorage.setItem("userName", data.displayName || data.name);
            }
          }
        } catch (err) {
          console.log("Error loading user profile:", err);
        }
      } else {
        setUser(null);
        setProfilePhoto(null);
        localStorage.removeItem("userName");
        localStorage.removeItem("profilePhoto");
        localStorage.removeItem("userMobile");
      }
    });

    return () => unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setUserDropdownOpen(false);
      localStorage.removeItem("userName");
      localStorage.removeItem("profilePhoto");
      localStorage.removeItem("userMobile");
      await signOut(auth);
      setUser(null);
      setProfilePhoto(null);
      window.dispatchEvent(new Event("authLoggedOut"));
      window.dispatchEvent(new Event("profileUpdated"));
      window.dispatchEvent(new Event("storage"));
      await successAlert("Logged out successfully!");
      navigate("/");
    } catch (error) {
      errorAlert(error.message);
    }
  };

  const handleServiceClick = (service) => {
    setActiveTab(service);
    if (service === "buses") {
      navigate("/");
    } else if (service === "hotels") {
      navigate("/hotels");
    } else if (service === "trains") {
      navigate("/trains");
    } else if (service === "flights") {
      navigate("/flights");
    }
  };

  // Extract display name or fallback
  const getUserName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split("@")[0];
    const local = localStorage.getItem("userName");
    if (local) return local;
    return "User";
  };

  const getUserInitial = () => {
    const name = getUserName();
    return (name.charAt(0) || "U").toUpperCase();
  };

  return (
    <>
      <nav className="busvista-navbar">
        <div className="busvista-nav-container">
          {/* 1. Left Logo */}
          <div className="busvista-logo-wrapper">
            <Link
              to="/"
              className="busvista-brand"
              onClick={() => setActiveTab("buses")}
            >
              <div className="logo-icon-badge">
                <BusVistaLogo size={42} />
              </div>
              <span className="brand-name">Bus Vista</span>
            </Link>
          </div>

          {/* 2. Middle Service Tabs */}
          <div className="busvista-service-tabs">
            <button
              className={`service-tab-btn tab-buses ${activeTab === "buses" ? "active" : ""}`}
              onClick={() => handleServiceClick("buses")}
            >
              Buses
            </button>

            <button
              className={`service-tab-btn tab-trains ${activeTab === "trains" ? "active" : ""}`}
              onClick={() => handleServiceClick("trains")}
            >
              Trains
            </button>
          </div>

          {/* 3. Right Action Menu */}
          <div className="busvista-right-menu">
            <button
              className="nav-action-link"
              onClick={() => setIsOffersOpen(true)}
            >
              <FaGift className="action-icon icon-offers" />
              <span>Offers</span>
            </button>

            <button
              className="nav-action-link"
              onClick={() => setIsTrackOpen(true)}
            >
              <FaMapMarkerAlt className="action-icon icon-track" />
              <span>Track Ticket</span>
            </button>

            <button
              className="nav-action-link"
              onClick={() => setIsHelpOpen(true)}
            >
              <FaQuestionCircle className="action-icon icon-help" />
              <span>Need Help?</span>
            </button>

            {/* 4. User Profile Dropdown Pill (WHEN LOGGED IN) vs Login / Register Button (WHEN LOGGED OUT) */}
            {user ? (
              <div className="user-profile-menu-wrapper" ref={dropdownRef}>
                <button
                  className="user-pill-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="user-avatar-img"
                    />
                  ) : (
                    <div className="user-avatar-initial">
                      {getUserInitial()}
                    </div>
                  )}
                  <span className="user-name-text">{getUserName()}</span>
                  <FaChevronDown
                    className={`chevron-icon ${userDropdownOpen ? "rotate" : ""}`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown-card">
                    <div className="dropdown-user-header">
                      <div className="header-avatar-circle">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="User" />
                        ) : (
                          <span>{getUserInitial()}</span>
                        )}
                      </div>
                      <div className="header-user-meta">
                        <h5>{getUserName()}</h5>
                        <p>{user?.email || "user@busvista.com"}</p>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <ul className="dropdown-links-list">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            setIsProfileOpen(true);
                          }}
                          className="dropdown-item btn-item"
                        >
                          <FaUser className="item-icon" />
                          <span>My Profile</span>
                        </button>
                      </li>

                      <li>
                        <Link
                          to="/my-bookings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="dropdown-item"
                        >
                          <FaTicketAlt className="item-icon" />
                          <span>My Bookings</span>
                        </Link>
                      </li>

                      {/* Admin Panel button - specifically shown for Admin (busvista@gmail.com) */}
                      {user?.email?.toLowerCase() === "busvista@gmail.com" && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="dropdown-item"
                            style={{
                              color: "#8e24aa",
                              fontWeight: "700",
                              background: "rgba(142, 36, 170, 0.08)",
                              borderRadius: "8px",
                              margin: "4px 0",
                            }}
                          >
                            <FaUserShield
                              className="item-icon"
                              style={{ color: "#8e24aa" }}
                            />
                            <span>Admin Panel</span>
                          </Link>
                        </li>
                      )}
                    </ul>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-footer">
                      <button
                        className="dropdown-logout-btn"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login-register" className="nav-login-register-btn">
                <FaUser className="btn-user-icon" />
                <span>Login / Register</span>
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-services-grid">
              <button
                className={`mobile-tab-btn ${activeTab === "buses" ? "active" : ""}`}
                onClick={() => {
                  handleServiceClick("buses");
                  setMobileMenuOpen(false);
                }}
              >
                <FaBus /> Buses
              </button>
              <button
                className={`mobile-tab-btn ${activeTab === "trains" ? "active" : ""}`}
                onClick={() => {
                  handleServiceClick("trains");
                  setMobileMenuOpen(false);
                }}
              >
                <FaTrain /> Trains
              </button>
            </div>

            <div className="mobile-menu-links">
              <button
                className="mobile-link-item"
                onClick={() => {
                  setIsOffersOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <FaGift className="action-icon icon-offers" /> Offers & Deals
              </button>
              <button
                className="mobile-link-item"
                onClick={() => {
                  setIsTrackOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <FaMapMarkerAlt className="action-icon icon-track" /> Track
                Ticket
              </button>
              <button
                className="mobile-link-item"
                onClick={() => {
                  setIsHelpOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <FaQuestionCircle className="action-icon icon-help" /> Need
                Help?
              </button>

              {user ? (
                <>
                  {user?.email?.toLowerCase() === "busvista@gmail.com" && (
                    <Link
                      to="/admin"
                      className="mobile-link-item"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        color: "#8e24aa",
                        fontWeight: "700",
                        background: "rgba(142, 36, 170, 0.08)",
                        borderRadius: "8px",
                      }}
                    >
                      <FaUserShield /> Admin Panel
                    </Link>
                  )}

                  <Link
                    to="/my-bookings"
                    className="mobile-link-item"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FaTicketAlt /> My Bookings
                  </Link>
                  <button
                    type="button"
                    className="mobile-link-item"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsProfileOpen(true);
                    }}
                  >
                    <FaUser /> My Profile
                  </button>
                  <button
                    type="button"
                    className="mobile-link-item mobile-logout-action-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login-register"
                  className="mobile-link-item mobile-login-action-btn"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUser /> Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <TrackTicketModal
        isOpen={isTrackOpen}
        onClose={() => setIsTrackOpen(false)}
      />
      <NeedHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <OffersModal
        isOpen={isOffersOpen}
        onClose={() => setIsOffersOpen(false)}
      />
      <ServiceModal
        isOpen={Boolean(serviceModalType)}
        serviceType={serviceModalType}
        onClose={() => setServiceModalType(null)}
      />
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}

export default Navbar;
