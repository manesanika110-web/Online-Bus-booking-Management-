import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaArrowRight,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaApple,
  FaFacebookF,
  FaCheck,
  FaTimes,
  FaShieldAlt,
  FaBolt,
  FaTag,
  FaHome,
  FaStar,
} from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import "../css/LoginRegister.css";
import { auth, db } from "../firebase";
import { successAlert, errorAlert } from "../utils/alert";
import BusVistaLogo from "../components/BusVistaLogo";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Assets
import busHeroImg from "../assets/auth_bus_hero.jpg";
import loginBannerImg from "../assets/auth_login_banner.jpg";

function LoginRegister() {
  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();

  // Handle Register Submit
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      errorAlert("Please accept the Terms & Conditions to create an account.");
      return;
    }
    if (password.length < 6) {
      errorAlert("Password should be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const defaultAvatar =
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80";

      await updateProfile(userCredential.user, {
        displayName: name.trim(),
        photoURL: defaultAvatar,
      });

      if (db) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name.trim(),
          displayName: name.trim(),
          email: email.trim(),
          mobile: "",
          profilePhoto: defaultAvatar,
          createdAt: new Date().toISOString(),
        });
      }

      // Explicitly sign out so user MUST log in through the login form
      await signOut(auth);
      localStorage.removeItem("userName");
      localStorage.removeItem("profilePhoto");
      window.dispatchEvent(new Event("profileUpdated"));

      // Clear password field & switch directly to Login tab
      setPassword("");
      setActiveTab("login");

      await successAlert(
        "Account Created Successfully! Please login with your email & password to continue."
      );
    } catch (error) {
      console.error(error);
      errorAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password;

    try {
      // 1. Check if user is logging in with Admin Credentials
      if (trimmedEmail === "busvista@gmail.com" && trimmedPassword === "bus@00") {
        localStorage.setItem("busvista_admin_auth", "true");
        localStorage.setItem("busvista_admin_email", "busvista@gmail.com");
        localStorage.setItem("busvista_admin_login_time", new Date().toISOString());

        try {
          await signInWithEmailAndPassword(auth, email.trim(), password);
        } catch (err) {
          // If admin isn't in Firebase auth yet, session is still verified locally
        }

        await successAlert("Admin Login Successful! Redirecting to Admin Dashboard...");
        navigate("/admin");
        return;
      }

      // 2. Regular User Login via Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // Fetch Firestore profile data if available
      if (db) {
        try {
          const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.displayName || data.name) {
              localStorage.setItem("userName", data.displayName || data.name);
            }
            if (data.profilePhoto) {
              localStorage.setItem("profilePhoto", data.profilePhoto);
            }
            window.dispatchEvent(new Event("profileUpdated"));
          }
        } catch (err) {
          console.log("Error loading user profile:", err);
        }
      }

      await successAlert("Login Successful! Welcome back to BusVista.");
      navigate("/");
    } catch (error) {
      console.error(error);
      errorAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (db) {
        await setDoc(
          doc(db, "users", user.uid),
          {
            uid: user.uid,
            name: user.displayName || "Traveler",
            displayName: user.displayName || "Traveler",
            email: user.email,
            profilePhoto: user.photoURL || "",
            lastLogin: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      if (user.displayName) localStorage.setItem("userName", user.displayName);
      if (user.photoURL) localStorage.setItem("profilePhoto", user.photoURL);
      window.dispatchEvent(new Event("profileUpdated"));

      // If logging in as admin email via Google
      if (user.email?.toLowerCase() === "busvista@gmail.com") {
        localStorage.setItem("busvista_admin_auth", "true");
        localStorage.setItem("busvista_admin_email", "busvista@gmail.com");
        await successAlert(`Welcome Admin! Redirecting to Admin Panel...`);
        navigate("/admin");
      } else {
        await successAlert(`Welcome, ${user.displayName || "Traveler"}!`);
        navigate("/");
      }
    } catch (error) {
      console.error("Google Auth error:", error);
      errorAlert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      errorAlert("Please enter your registered email address.");
      return;
    }
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      await successAlert(
        "Password reset link has been sent to your email. Please check your inbox/spam folder."
      );
      setForgotModalOpen(false);
      setResetEmail("");
    } catch (error) {
      errorAlert(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Visual image chosen based on active tab or selection
  const visualImage = activeTab === "login" ? loginBannerImg : busHeroImg;

  return (
    <div className="busvista-auth-page">
      {/* Top Floating Header */}
      <header className="auth-site-header">
        <Link to="/" className="auth-brand-logo">
          <div className="brand-logo-badge">
            <BusVistaLogo size={32} />
          </div>
          <span className="brand-logo-text">Bus Vista</span>
        </Link>

        <Link to="/" className="back-home-link">
          <FaHome />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Horizontal Card Container */}
      <div className="auth-horizontal-card">
        {/* ======================================================== */}
        {/* LEFT COLUMN: VISUAL HERO & BRAND SHOWCASE                */}
        {/* ======================================================== */}
        <div
          className="auth-visual-pane"
          style={{ backgroundImage: `url(${visualImage})` }}
        >
          <div className="visual-pane-overlay" />

          {/* Top Visual Badges */}
          <div className="visual-top-bar">
            <div className="trust-badge-pill">
              <FaStar className="star-icon" />
              <span>India's #1 Bus Booking App</span>
            </div>
          </div>

          {/* Bottom Visual Text and Feature Chips */}
          <div className="visual-bottom-content">
            <h1 className="visual-hero-title">
              Most Affordable <br />
              <span>Bus Rental Service</span>
            </h1>
            <p className="visual-hero-subtitle">
              Convenience on a budget with our Most Affordable Bus Rental Service.
              Enjoy live GPS tracking, clean luxury buses, and zero cancellation fee.
            </p>

            <div className="feature-chips-row">
              <div className="feature-chip">
                <FaBolt className="chip-icon" />
                <span>Instant Ticket</span>
              </div>
              <div className="feature-chip">
                <FaShieldAlt className="chip-icon" />
                <span>100% Safe Rides</span>
              </div>
              <div className="feature-chip">
                <FaTag className="chip-icon" />
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: INTERACTIVE AUTH FORMS                     */}
        {/* ======================================================== */}
        <div className="auth-form-pane">
          {/* Tabs: Log In vs Create Account */}
          <div className="auth-tabs-segmented">
            <button
              type="button"
              className={`tab-segment-btn ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Log In
            </button>
            <button
              type="button"
              className={`tab-segment-btn ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Sign Up
            </button>
          </div>

          {/* Form Header */}
          <div className="form-header-box">
            <h2 className="form-main-heading">
              {activeTab === "login" ? "Welcome Back" : "Create New Account"}
            </h2>
            <p className="form-sub-heading">
              {activeTab === "login"
                ? "Log in to continue your seamless journey"
                : "Join BusVista for exclusive discounts and fast bookings"}
            </p>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: LOG IN FORM                                       */}
          {/* ======================================================== */}
          {activeTab === "login" ? (
            <form onSubmit={handleLogin} className="auth-core-form">
              {/* Field: Email */}
              <div className="auth-input-group">
                <label className="input-label-text">Email Address</label>
                <div className="input-field-wrapper">
                  <FaEnvelope className="field-prefix-icon" />
                  <input
                    type="email"
                    className="styled-auth-input"
                    placeholder="Enter Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field: Password */}
              <div className="auth-input-group">
                <div className="label-with-action">
                  <label className="input-label-text">Password</label>
                  <button
                    type="button"
                    className="inline-forgot-btn"
                    onClick={() => {
                      setResetEmail(email);
                      setForgotModalOpen(true);
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-field-wrapper">
                  <FaLock className="field-prefix-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="styled-auth-input with-toggle"
                    placeholder="Enter Your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="field-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="btn-red-action"
                disabled={loading}
              >
                {loading ? "Logging In..." : "Login"}
              </button>

              {/* Social Login Divider */}
              <div className="auth-or-divider">
                <span className="divider-hairline"></span>
                <span className="divider-caption">or log in with</span>
                <span className="divider-hairline"></span>
              </div>

              {/* Social Buttons Row */}
              <div className="social-pill-row">
                <button
                  type="button"
                  className="social-brand-btn google-pill-btn"
                  onClick={handleGoogleSignIn}
                  title="Sign in with Google"
                >
                  <FcGoogle className="social-btn-icon" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="social-brand-btn apple-pill-btn"
                  onClick={() =>
                    errorAlert(
                      "Apple Sign In is supported on iOS devices. Please use Google or Email."
                    )
                  }
                  title="Sign in with Apple"
                >
                  <FaApple className="social-btn-icon" />
                  <span>Apple</span>
                </button>

                <button
                  type="button"
                  className="social-brand-btn fb-pill-btn"
                  onClick={() =>
                    errorAlert(
                      "Facebook Sign In is temporarily unavailable. Please use Google or Email."
                    )
                  }
                  title="Sign in with Facebook"
                >
                  <FaFacebookF className="social-btn-icon" />
                  <span>Facebook</span>
                </button>
              </div>

              {/* Bottom Switch Note */}
              <div className="auth-form-footer">
                <span>Don't have an account? </span>
                <button
                  type="button"
                  className="switch-link-highlight"
                  onClick={() => setActiveTab("register")}
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            /* ======================================================== */
            /* TAB 2: CREATE NEW ACCOUNT (REGISTER) FORM                */
            /* ======================================================== */
            <form onSubmit={handleRegister} className="auth-core-form">
              {/* Field: Full Name */}
              <div className="auth-input-group">
                <label className="input-label-text">Full Name</label>
                <div className="input-field-wrapper">
                  <FaUser className="field-prefix-icon" />
                  <input
                    type="text"
                    className="styled-auth-input"
                    placeholder="Please input your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field: Email */}
              <div className="auth-input-group">
                <label className="input-label-text">Email Address</label>
                <div className="input-field-wrapper">
                  <FaEnvelope className="field-prefix-icon" />
                  <input
                    type="email"
                    className="styled-auth-input"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field: Password */}
              <div className="auth-input-group">
                <label className="input-label-text">Password</label>
                <div className="input-field-wrapper">
                  <FaLock className="field-prefix-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="styled-auth-input with-toggle"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="field-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Hide password" : "Show password"}
                    tabIndex="-1"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Checkbox: Agree with Terms */}
              <div className="auth-checkbox-container">
                <label className="custom-terms-check">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span className="checkbox-box-custom">
                    {agreeTerms && <FaCheck className="check-tick" />}
                  </span>
                  <span className="terms-caption">
                    Agree with{" "}
                    <button
                      type="button"
                      className="terms-modal-trigger"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTermsModalOpen(true);
                      }}
                    >
                      Terms & Conditions
                    </button>
                  </span>
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                className="btn-red-action"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>

              {/* Social Login Divider */}
              <div className="auth-or-divider">
                <span className="divider-hairline"></span>
                <span className="divider-caption">or sign up with</span>
                <span className="divider-hairline"></span>
              </div>

              {/* Social Buttons Row */}
              <div className="social-pill-row">
                <button
                  type="button"
                  className="social-brand-btn google-pill-btn"
                  onClick={handleGoogleSignIn}
                  title="Sign up with Google"
                >
                  <FcGoogle className="social-btn-icon" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  className="social-brand-btn apple-pill-btn"
                  onClick={() =>
                    errorAlert(
                      "Apple Sign In is supported on iOS devices. Please use Google or Email."
                    )
                  }
                  title="Sign up with Apple"
                >
                  <FaApple className="social-btn-icon" />
                  <span>Apple</span>
                </button>

                <button
                  type="button"
                  className="social-brand-btn fb-pill-btn"
                  onClick={() =>
                    errorAlert(
                      "Facebook Sign In is temporarily unavailable. Please use Google or Email."
                    )
                  }
                  title="Sign up with Facebook"
                >
                  <FaFacebookF className="social-btn-icon" />
                  <span>Facebook</span>
                </button>
              </div>

              {/* Bottom Switch Note */}
              <div className="auth-form-footer">
                <span>Already have an account? </span>
                <button
                  type="button"
                  className="switch-link-highlight"
                  onClick={() => setActiveTab("login")}
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: FORGOT PASSWORD MODAL                           */}
      {/* ======================================================== */}
      {forgotModalOpen && (
        <div
          className="auth-dialog-backdrop"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            className="auth-dialog-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h3 className="dialog-title">Reset Password</h3>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setForgotModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <p className="dialog-subtitle">
              Enter your registered email address and we'll send you an instant
              password reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="dialog-form">
              <div className="auth-input-group">
                <label className="input-label-text">Email Address</label>
                <div className="input-field-wrapper">
                  <FaEnvelope className="field-prefix-icon" />
                  <input
                    type="email"
                    className="styled-auth-input"
                    placeholder="example@gmail.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="dialog-actions-row">
                <button
                  type="button"
                  className="btn-dialog-cancel"
                  onClick={() => setForgotModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-red-action dialog-submit-btn"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: TERMS AND CONDITIONS                            */}
      {/* ======================================================== */}
      {termsModalOpen && (
        <div
          className="auth-dialog-backdrop"
          onClick={() => setTermsModalOpen(false)}
        >
          <div
            className="auth-dialog-card terms-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dialog-header">
              <h3 className="dialog-title">Terms & Conditions</h3>
              <button
                type="button"
                className="dialog-close-btn"
                onClick={() => setTermsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="terms-scroll-body">
              <p>
                <strong>1. Acceptance of Terms:</strong> By creating an account on
                BusVista, you agree to comply with all booking rules, safety guidelines,
                and applicable travel policies.
              </p>
              <p>
                <strong>2. Ticket Booking & Validity:</strong> All bus tickets booked
                through BusVista are non-transferable and require a valid government ID
                matching passenger details during boarding.
              </p>
              <p>
                <strong>3. Cancellation & Refunds:</strong> Cancellations made up to 6
                hours prior to departure are eligible for fast refund according to
                operator policy.
              </p>
              <p>
                <strong>4. Privacy & Data Protection:</strong> We protect your personal
                and travel data with high-grade encryption for seamless booking and real-time
                bus tracking.
              </p>
            </div>

            <div className="dialog-actions-row">
              <button
                type="button"
                className="btn-red-action dialog-submit-btn"
                onClick={() => {
                  setAgreeTerms(true);
                  setTermsModalOpen(false);
                }}
              >
                I Agree & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginRegister;
