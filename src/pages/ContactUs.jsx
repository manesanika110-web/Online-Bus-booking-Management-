import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { successAlert, errorAlert } from "../utils/alert";
import "../css/ContactUs.css";

const ContactUs = ({ onAction }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
          issueType: "General Contact / Inquiry",
          message: formData.message.trim(),
          status: "Open",
          userId: uid,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        });
      }

      await successAlert("Your message has been sent successfully! Our team will contact you soon.");
      setFormData({ name: "", email: "", message: "" });
      if (onAction) onAction("login");
    } catch (err) {
      console.error("Contact Us error:", err);
      errorAlert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="step-card">
      <div className="card-header">
        <h3>11 CONTACT US</h3>
      </div>
      <div className="card-body" style={{ textAlign: "left" }}>
        <h4>Contact Us</h4>
        <div
          style={{
            background: "#f9f9f9",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "13px",
            color: "#555",
            marginBottom: "15px",
          }}
        >
          <p style={{ margin: "5px 0" }}>
            📍 123, Travel Street, Near Traffic Hub, India
          </p>
          <p style={{ margin: "5px 0" }}>📞 +91 98765 43210</p>
          <p style={{ margin: "5px 0" }}>✉️ support@busbook.com</p>
          <p style={{ margin: "5px 0" }}>🕒 24/7 Customer Support</p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          />
          <textarea
            name="message"
            placeholder="Message"
            rows="2"
            value={formData.message}
            onChange={handleChange}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            required
          ></textarea>
          <button
            type="submit"
            className="btn-blue-solid"
            style={{ padding: "10px", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}
            disabled={submitting}
          >
            {submitting ? "Sending Message..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
