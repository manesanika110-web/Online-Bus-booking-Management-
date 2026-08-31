import React, { useState } from "react";
import { FaTimes, FaHeadset, FaPhoneAlt, FaEnvelope, FaWhatsapp, FaQuestionCircle, FaPaperPlane } from "react-icons/fa";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { successAlert, errorAlert } from "../utils/alert";
import "../css/Modal.css";

const NeedHelpModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueType: "Booking Issue",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const user = auth?.currentUser;
      const uid = user?.uid || "";
      const queryId = "QUERY_" + Date.now();

      if (db) {
        await setDoc(doc(db, "support_queries", queryId), {
          id: queryId,
          name: formData.name.trim(),
          email: formData.email.trim(),
          issueType: formData.issueType,
          message: formData.message.trim(),
          status: "Open",
          userId: uid,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
      }

      await successAlert("Your support request has been submitted! Our team will contact you within 15 minutes.");
      setFormData({ name: "", email: "", issueType: "Booking Issue", message: "" });
      onClose();
    } catch (err) {
      console.error("Error submitting support query:", err);
      errorAlert("Failed to submit support request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content help-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <FaHeadset className="modal-header-icon" />
            <h3>24x7 Customer Support & Help</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Contact Cards */}
          <div className="help-cards-grid">
            <div className="help-card">
              <div className="help-card-icon phone">
                <FaPhoneAlt />
              </div>
              <div className="help-card-info">
                <h4>Toll-Free Helpline</h4>
                <p>1800-102-8745</p>
                <span>Available 24/7 (Free)</span>
              </div>
            </div>

            <div className="help-card">
              <div className="help-card-icon email">
                <FaEnvelope />
              </div>
              <div className="help-card-info">
                <h4>Email Support</h4>
                <p>support@busvista.com</p>
                <span>Avg. response &lt; 30 mins</span>
              </div>
            </div>

            <div className="help-card">
              <div className="help-card-icon whatsapp">
                <FaWhatsapp />
              </div>
              <div className="help-card-info">
                <h4>WhatsApp Support</h4>
                <p>+91 98765 43210</p>
                <span>Instant Bot & Live Agent</span>
              </div>
            </div>
          </div>

          <div className="help-form-container">
            <h4>
              <FaQuestionCircle /> Send us a Quick Message
            </h4>
            <form onSubmit={handleSubmit} className="help-support-form">
              <div className="form-row-two">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Issue Category</label>
                <select
                  value={formData.issueType}
                  onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                >
                  <option value="Booking Issue">Booking / Ticket Issue</option>
                  <option value="Cancellation / Refund">Cancellation & Refund Request</option>
                  <option value="Bus Delay / Boarding">Bus Delay & Boarding Point Inquiry</option>
                  <option value="Payment Issue">Payment / Failed Transaction</option>
                  <option value="Feedback / Other">Other Inquiries</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message / Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe your issue or query..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-help-btn" disabled={submitting}>
                <FaPaperPlane /> {submitting ? "Submitting Request..." : "Submit Request"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeedHelpModal;
