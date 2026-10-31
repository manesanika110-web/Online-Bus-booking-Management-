import "react";
import { useLocation, useNavigate } from "react-router-dom";
import {  FaArrowRight, FaExclamationTriangle } from "react-icons/fa"; // आयकॉन्स जोडले
import "../css/CancelBooking.css";

import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { successAlert, errorAlert } from "../utils/alert";
import { updateStoredBookingStatus } from "../utils/localData";

const CancelBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state?.booking || {
    pnr: "PBK123456",
    route: "Sangli ➔ Pune",
    date: "06 July 2026",
    time: "08:00 AM",
    seats: "6",
    amount: "₹ 550",
  };

  const stations = bookingData.route
    ? bookingData.route.split("➔")
    : ["Sangli", "Pune"];
  const fromStation = stations[0]?.trim();
  const toStation = stations[1]?.trim();

  const handleCancelAction = async () => {
    const bookingId = bookingData.bookingId || bookingData.id;
    const user = auth?.currentUser;
    const uid = user?.uid || bookingData.userId;

    const localSaved = updateStoredBookingStatus(
      { ...bookingData, bookingId, userId: uid },
      "buses",
      "cancelled",
    );
    if (!localSaved) {
      errorAlert("The cancellation could not be saved locally. Please retry.");
      return;
    }

    let remoteSyncFailed = false;
    if (db && bookingId) {
      try {
        await updateDoc(doc(db, "bookings", String(bookingId)), {
          status: "cancelled",
          lastUpdated: new Date().toISOString(),
        });

        // Also update payments status to Refunded if exists
        try {
          const paymentId = "PAY_" + bookingId;
          await updateDoc(doc(db, "payments", paymentId), {
            status: "Refunded",
            lastUpdated: new Date().toISOString(),
          });
        } catch (paymentError) {
          console.warn("Unable to update the payment status:", paymentError);
          remoteSyncFailed = true;
        }

        if (uid) {
          try {
            await updateDoc(doc(db, "users", uid, "bookings", String(bookingId)), {
              status: "cancelled",
              lastUpdated: new Date().toISOString(),
            });
          } catch (userBookingError) {
            console.warn("Unable to update the user booking:", userBookingError);
            remoteSyncFailed = true;
          }
        }
      } catch (err) {
        console.error("Firestore cancellation error:", err);
        remoteSyncFailed = true;
      }
    }

    await successAlert(
      remoteSyncFailed
        ? `Cancellation saved on this device. Cloud sync is currently unavailable.`
        : `Your ticket (PNR: ${bookingData.pnr}) has been cancelled successfully!`,
    );
    navigate("/my-bookings", { replace: true });
  };

  return (
    <div className="cancel-step-card">
      <div className="cancel-header-banner">
        <h3>CANCEL BOOKING</h3>
      </div>

      <div className="cancel-body-content">
        <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FaExclamationTriangle /> Cancel Booking
        </h4>

        <p className="alert-warning-text">
          Are you sure you want to cancel this booking?
        </p>

        <div className="summary-box">
          <p>
            <strong>PNR No:</strong>{" "}
            <span style={{ color: "#1A3B8B" }}>{bookingData.pnr}</span>
          </p>

          {/* प्रवासाचा मार्ग बॉक्स डिझाईनमध्ये (From -> To) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "10px 0",
              background: "#fff",
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          >
            <div style={{ flex: 1 }}>
              <span
                style={{ fontSize: "11px", color: "#888", display: "block" }}
              >
                FROM
              </span>
              <strong style={{ fontSize: "15px", color: "#333" }}>
                {fromStation}
              </strong>
            </div>
            <div style={{ color: "#1A3B8B" }}>
              <FaArrowRight />
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <span
                style={{ fontSize: "11px", color: "#888", display: "block" }}
              >
                TO
              </span>
              <strong style={{ fontSize: "15px", color: "#333" }}>
                {toStation}
              </strong>
            </div>
          </div>

          <p style={{ fontSize: "13px", color: "#666" }}>
            <strong>Date & Time:</strong> {bookingData.date || "06 July 2026"} |{" "}
            {bookingData.time || "08:00 AM"}
          </p>
          <p style={{ fontSize: "13px", color: "#666" }}>
            <strong>Seats:</strong> {bookingData.seats}
          </p>

          <hr
            style={{
              border: "none",
              borderTop: "1px dashed #ddd",
              margin: "12px 0",
            }}
          />

          <p>
            <strong>Refund Amount: </strong>
            <span className="refund-text">{bookingData.amount}</span>
          </p>
          <small style={{ color: "#888", display: "block", marginTop: "-4px" }}>
            (After cancellation charges)
          </small>
        </div>

        <div className="action-buttons-group">
          <button
            className="btn-back-outline"
            onClick={() => navigate("/my-bookings")}
          >
            No, Go Back
          </button>
          <button className="btn-confirm-red" onClick={handleCancelAction}>
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelBooking;
