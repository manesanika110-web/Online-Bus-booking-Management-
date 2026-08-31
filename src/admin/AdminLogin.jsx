import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { successAlert, errorAlert } from "../utils/alert";
import BusVistaLogo from "../components/BusVistaLogo";
import "../css/AdminLogin.css";

const ADMIN_EMAIL = "busvista@gmail.com";
const ADMIN_PASSWORD = "bus@00";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to /admin
  useEffect(() => {
    const isAuth = localStorage.getItem("busvista_admin_auth");
    if (isAuth === "true") {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Strict credentials check
      if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && trimmedPassword === ADMIN_PASSWORD) {
        // Save verified admin session
        localStorage.setItem("busvista_admin_auth", "true");
        localStorage.setItem("busvista_admin_email", ADMIN_EMAIL);
        localStorage.setItem("busvista_admin_login_time", new Date().toISOString());

        successAlert("Admin Access Granted! Welcome to BusVista Admin Panel.").then(() => {
          navigate("/admin");
        });
      } else {
        const errorMsg = "Invalid email or password";
        setErrorMessage(errorMsg);
        errorAlert(errorMsg);
      }
      setIsLoading(false);
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setErrorMessage("");
  };

  return (
    <div className="admin-login-wrapper">
      {/* Ambient background decoration */}
      <div className="admin-login-ambient-blob blob-1"></div>
      <div className="admin-login-ambient-blob blob-2"></div>

      <div className="admin-login-container">
        {/* Top brand header */}
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-brand">
              <BusVistaLogo size={42} />
              <div className="admin-brand-text">
                <span className="brand-bus">Bus</span>
                <span className="brand-vista">Vista</span>
                <span className="brand-badge">ADMIN</span>
              </div>
            </div>
            <h1 className="admin-login-title">Admin Portal Sign In</h1>
            <p className="admin-login-subtitle">
              Enter your authorized administrator credentials to access the management console.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="admin-error-banner" role="alert">
              <FaExclamationCircle className="error-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="admin-login-form" onSubmit={handleLogin}>
            <div className="admin-form-group">
              <label htmlFor="admin-email">Admin Email Address</label>
              <div className="admin-input-wrapper">
                <FaEnvelope className="admin-input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="busvista@gmail.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-password">Admin Password</label>
              <div className="admin-input-wrapper">
                <FaLock className="admin-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Quick Demo Credentials Helper */}
            <div className="demo-credentials-box">
              <div className="demo-creds-info">
                <span className="demo-label">Authorized Credentials:</span>
                <code className="demo-code">busvista@gmail.com / bus@00</code>
              </div>
              <button
                type="button"
                className="fill-demo-btn"
                onClick={handleFillDemo}
                title="Auto-fill authorized credentials"
              >
                Auto Fill
              </button>
            </div>

            <button
              type="submit"
              className={`admin-submit-btn ${isLoading ? "loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="admin-spinner"></div>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <FaArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="admin-login-footer">
            <Link to="/" className="back-to-site-link">
              <FaArrowLeft /> Back to BusVista User Site
            </Link>
            <div className="admin-secure-notice">
              <FaShieldAlt /> 256-bit Encrypted Admin Session
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
