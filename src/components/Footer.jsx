import React from "react";
import { Link } from "react-router-dom";
import {
  FaBus,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaShieldAlt,
  FaCreditCard,
} from "react-icons/fa";
import BusVistaLogo from "./BusVistaLogo";
import "../css/Footer.css";

function Footer() {
  return (
    <footer className="busvista-footer">
      <div className="footer-top-container">
        {/* Brand Col */}
        <div className="footer-col brand-col">
          <div className="footer-logo-row">
            <div className="footer-logo-badge">
              <BusVistaLogo size={36} />
            </div>
            <h3>Bus Vista</h3>
          </div>
          <p className="footer-brand-desc">
            India's most trusted online bus ticketing platform. Book AC Sleeper, Volvo & luxury bus tickets with live GPS tracking and instant confirmation.
          </p>
          <div className="footer-social-links">
            <a href="#facebook" aria-label="Facebook" className="social-icon">
              <FaFacebookF />
            </a>
            <a href="#twitter" aria-label="Twitter" className="social-icon">
              <FaTwitter />
            </a>
            <a href="#instagram" aria-label="Instagram" className="social-icon">
              <FaInstagram />
            </a>
            <a href="#linkedin" aria-label="LinkedIn" className="social-icon">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/">Book Bus Tickets</Link>
            </li>
            <li>
              <Link to="/my-bookings">My Bookings</Link>
            </li>
            <li>
              <Link to="/about-us">About Bus Vista</Link>
            </li>
            <li>
              <Link to="/contact-us">Customer Support</Link>
            </li>
            <li>
              <Link to="/cancel-booking">Cancel Booking</Link>
            </li>
          </ul>
        </div>

        {/* Popular Cities */}
        <div className="footer-col">
          <h4 className="footer-heading">Top Bus Routes</h4>
          <ul className="footer-links-list">
            <li>
              <Link to="/search" state={{ from: "Pune", to: "Mumbai" }}>
                Pune to Mumbai Buses
              </Link>
            </li>
            <li>
              <Link to="/search" state={{ from: "Sangli", to: "Pune" }}>
                Sangli to Pune Buses
              </Link>
            </li>
            <li>
              <Link to="/search" state={{ from: "Kolhapur", to: "Mumbai" }}>
                Kolhapur to Mumbai Buses
              </Link>
            </li>
            <li>
              <Link to="/search" state={{ from: "Satara", to: "Solapur" }}>
                Satara to Solapur Buses
              </Link>
            </li>
            <li>
              <Link to="/search" state={{ from: "Pune", to: "Kolhapur" }}>
                Pune to Kolhapur Buses
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-col contact-col">
          <h4 className="footer-heading">Contact & Help</h4>
          <ul className="footer-contact-list">
            <li>
              <FaPhoneAlt className="contact-icon" />
              <div>
                <strong>24x7 Helpline:</strong>
                <span>1800-102-8745 / +91 98765 43210</span>
              </div>
            </li>
            <li>
              <FaEnvelope className="contact-icon" />
              <div>
                <strong>Email Support:</strong>
                <span>support@busvista.com</span>
              </div>
            </li>
            <li>
              <FaMapMarkerAlt className="contact-icon" />
              <div>
                <strong>Headquarters:</strong>
                <span>Shivaji Nagar, Pune, Maharashtra, India</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-container">
        <div className="footer-bottom-wrapper">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} Bus Vista Inc. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="footer-security-badges">
            <span className="secure-badge">
              <FaShieldAlt /> 100% Secure Payments
            </span>
            <span className="secure-badge">
              <FaCreditCard /> UPI & Card Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
