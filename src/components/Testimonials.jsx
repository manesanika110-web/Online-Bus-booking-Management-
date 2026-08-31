import React, { useState, useEffect } from "react";
import {
  FaStar,
  FaQuoteLeft,
  FaCheckCircle,
  FaPlus,
  FaTimes,
  FaBus,
  FaMapMarkerAlt,
  FaUser,
  FaPen,
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { successAlert, errorAlert } from "../utils/alert";
import "../css/HomeSections.css";

const defaultReviews = [
  {
    id: "rev_1",
    name: "Rohit Deshmukh",
    route: "Pune to Mumbai",
    busName: "Neeta Travels",
    rating: 5,
    comment:
      "Super smooth booking experience! The live bus tracking feature made boarding effortless at Swargate. Clean AC sleeper bus.",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "rev_2",
    name: "Sneha Patil",
    route: "Sangli to Pune",
    busName: "Konduskar Travels",
    rating: 5,
    comment:
      "Best bus ticketing website! Got 20% discount code and received M-ticket directly on WhatsApp. Highly recommended!",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
  },
  {
    id: "rev_3",
    name: "Ajay Kulkarni",
    route: "Kolhapur to Mumbai",
    busName: "SRS Travels",
    rating: 5,
    comment:
      "I had to cancel a ticket due to an emergency and the refund was processed instantly back to my UPI within 2 minutes. Excellent customer care.",
    avatar:
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
  },
];

const Testimonials = () => {
  const [reviews, setReviews] = useState(defaultReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState("");
  const [busName, setBusName] = useState("Konduskar Travels");
  const [route, setRoute] = useState("Sangli to Pune");
  const [comment, setComment] = useState("");

  // Load reviews from Firestore & localStorage
  useEffect(() => {
    const loadReviews = async () => {
      const savedLocal = JSON.parse(localStorage.getItem("user_bus_reviews")) || [];

      if (db) {
        try {
          const snapshot = await getDocs(collection(db, "bus_reviews"));
          const firestoreReviews = [];
          snapshot.forEach((d) => {
            firestoreReviews.push({ id: d.id, ...d.data() });
          });

          if (firestoreReviews.length > 0) {
            // Sort by timestamp descending
            firestoreReviews.sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            setReviews([...firestoreReviews, ...defaultReviews]);
            return;
          }
        } catch (err) {
          console.warn("Firestore bus reviews fetch error:", err);
        }
      }

      if (savedLocal.length > 0) {
        setReviews([...savedLocal, ...defaultReviews]);
      }
    };

    loadReviews();
  }, []);

  // Pre-fill user name when opening modal
  const handleOpenModal = () => {
    const currentUser = auth?.currentUser;
    if (currentUser) {
      setName(currentUser.displayName || currentUser.email?.split("@")[0] || "");
    }
    setIsModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      errorAlert("Please enter your review feedback comment.");
      return;
    }

    if (!name.trim()) {
      errorAlert("Please enter your name.");
      return;
    }

    setSubmitting(true);

    const currentUser = auth?.currentUser;
    const authorName = name.trim();
    const avatarUrl =
      currentUser?.photoURL ||
      localStorage.getItem("profilePhoto") ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=d84e55&color=fff`;

    const newReview = {
      id: `REV_${Date.now()}`,
      name: authorName,
      route: route.trim() || "Sangli to Pune",
      busName: busName.trim() || "BusVista Partner Bus",
      rating: Number(rating) || 5,
      comment: comment.trim(),
      avatar: avatarUrl,
      createdAt: new Date().toISOString(),
    };

    // 1. Update React state immediately for instant feedback
    const updated = [newReview, ...reviews];
    setReviews(updated);

    // 2. Save to localStorage
    const userReviews = JSON.parse(localStorage.getItem("user_bus_reviews")) || [];
    userReviews.unshift(newReview);
    localStorage.setItem("user_bus_reviews", JSON.stringify(userReviews));

    // 3. Save to Firestore
    if (db) {
      try {
        await setDoc(doc(db, "bus_reviews", newReview.id), newReview, { merge: true });
      } catch (err) {
        console.error("Firestore review save error:", err);
      }
    }

    setSubmitting(false);
    setIsModalOpen(false);
    setComment("");

    await successAlert("Thank you! Your bus review has been published successfully. 🎉");
  };

  return (
    <section className="testimonials-home-section" style={{ position: "relative" }}>
      <div className="section-header-box">
        <span className="section-sub-tag">CUSTOMER REVIEWS</span>
        <h2 className="section-title">What Our Passengers Say</h2>
        <p className="section-description">
          Real feedback from travelers who booked bus tickets on Bus Vista.
        </p>
      </div>

      {/* Testimonials Cards Grid */}
      <div className="testimonials-cards-grid">
        {reviews.slice(0, 6).map((rev) => (
          <div key={rev.id} className="testimonial-card">
            <FaQuoteLeft className="quote-badge-icon" />

            <div className="stars-rating-row">
              {[...Array(rev.rating || 5)].map((_, i) => (
                <FaStar key={i} className="star-filled" />
              ))}
            </div>

            <p className="review-comment-text">"{rev.comment}"</p>

            <div className="reviewer-meta-box">
              <img
                src={rev.avatar}
                alt={rev.name}
                className="reviewer-avatar-img"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.name)}&background=d84e55&color=fff`;
                }}
              />
              <div className="reviewer-info">
                <h4>
                  {rev.name} <FaCheckCircle className="verified-badge" title="Verified Traveler" />
                </h4>
                <span>
                  {rev.busName ? `${rev.busName} • ` : ""}Travelled: {rev.route}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Right Add Review Button Bar */}
      <div className="testimonials-footer-row">
        <button
          type="button"
          className="add-review-btn"
          onClick={handleOpenModal}
          title="Click to write your bus review"
        >
          <FaPlus /> <span>Add Review</span>
        </button>
      </div>

      {/* Add Review Modal */}
      {isModalOpen && (
        <div className="review-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="review-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="review-modal-header">
              <div className="header-title-box">
                <FaPen className="header-pen-icon" />
                <div>
                  <h3>Write a Bus Review</h3>
                  <small>Share your travel experience with millions of passengers</small>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="review-modal-body">
              {/* Star Rating Picker */}
              <div className="form-group rating-group">
                <label className="form-label">Overall Experience Rating</label>
                <div className="interactive-stars-picker">
                  {[1, 2, 3, 4, 5].map((starNum) => (
                    <button
                      key={starNum}
                      type="button"
                      className={`star-pick-btn ${
                        starNum <= (hoverRating || rating) ? "active" : ""
                      }`}
                      onClick={() => setRating(starNum)}
                      onMouseEnter={() => setHoverRating(starNum)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <FaStar />
                    </button>
                  ))}
                  <span className="rating-score-label">{rating} / 5 Stars</span>
                </div>
              </div>

              {/* Your Name */}
              <div className="form-group">
                <label className="form-label">
                  <FaUser className="field-ico" /> Your Full Name
                </label>
                <input
                  type="text"
                  className="review-form-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Bus Operator Name */}
              <div className="form-group">
                <label className="form-label">
                  <FaBus className="field-ico" /> Bus Service / Operator
                </label>
                <select
                  className="review-form-select"
                  value={busName}
                  onChange={(e) => setBusName(e.target.value)}
                >
                  <option value="Konduskar Travels">Konduskar Travels</option>
                  <option value="SRS Travels Superfast">SRS Travels Superfast</option>
                  <option value="Neeta Travels Volvo">Neeta Travels Volvo</option>
                  <option value="VRL Travels Multi-Axle">VRL Travels Multi-Axle</option>
                  <option value="IntrCity SmartBus">IntrCity SmartBus</option>
                  <option value="Shree Swami Samarth Travels">Shree Swami Samarth Travels</option>
                </select>
              </div>

              {/* Travelled Route */}
              <div className="form-group">
                <label className="form-label">
                  <FaMapMarkerAlt className="field-ico" /> Travelled Route
                </label>
                <input
                  type="text"
                  className="review-form-input"
                  placeholder="e.g. Sangli to Pune / Pune to Mumbai"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                />
              </div>

              {/* Feedback Comment */}
              <div className="form-group">
                <label className="form-label">Your Review Comment</label>
                <textarea
                  className="review-form-textarea"
                  rows="4"
                  placeholder="Share details about bus cleanliness, punctuality, seats, and driver behavior..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>

              {/* Modal Buttons */}
              <div className="modal-buttons-row">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="modal-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Publishing..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
