import React, { useState } from "react";
import {
  FaTicketAlt,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaEye,
  FaPrint,
  FaTimes,
  FaBus,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCalendarAlt,
  FaExchangeAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { updateBookingStatusInFirestore } from "./adminDataService";
import { successAlert, errorAlert } from "../utils/alert";

function AdminBookings({ bookings = [], searchQuery = "" }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [ticketModalBooking, setTicketModalBooking] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter Bookings strictly based on real Firestore data
  const filteredBookings = bookings.filter((b) => {
    const term = (searchQuery || "").toLowerCase().trim();
    const bId = String(b.bookingId || b.id || b.docId || "").toLowerCase();
    const pnr = String(b.pnr || "").toLowerCase();
    const name = String(b.passenger?.name || b.name || "").toLowerCase();
    const phone = String(b.passenger?.mobile || b.mobile || "").toLowerCase();
    const email = String(b.passenger?.email || b.userEmail || "").toLowerCase();
    const busName = String(b.bus?.name || b.hotelName || "").toLowerCase();
    const fromCity = String(b.bus?.from || b.from || "").toLowerCase();
    const toCity = String(b.bus?.to || b.to || "").toLowerCase();

    const matchesSearch =
      !term ||
      bId.includes(term) ||
      pnr.includes(term) ||
      name.includes(term) ||
      phone.includes(term) ||
      email.includes(term) ||
      busName.includes(term) ||
      fromCity.includes(term) ||
      toCity.includes(term);

    const bStatus = (b.status || "upcoming").toLowerCase();
    if (statusFilter === "upcoming") {
      return matchesSearch && (bStatus === "upcoming" || bStatus === "confirmed" || bStatus === "booked");
    }
    if (statusFilter === "completed") {
      return matchesSearch && bStatus === "completed";
    }
    if (statusFilter === "cancelled") {
      return matchesSearch && (bStatus === "cancelled" || bStatus === "refunded");
    }
    return matchesSearch;
  });

  // Calculate status counts directly from live Firestore stream
  const counts = {
    all: bookings.length,
    upcoming: bookings.filter((b) => {
      const s = (b.status || "upcoming").toLowerCase();
      return s === "upcoming" || s === "confirmed" || s === "booked";
    }).length,
    completed: bookings.filter((b) => (b.status || "").toLowerCase() === "completed").length,
    cancelled: bookings.filter((b) => {
      const s = (b.status || "").toLowerCase();
      return s === "cancelled" || s === "refunded";
    }).length,
  };

  // Real-time Booking Status Update directly into Firestore
  const handleUpdateStatus = async (booking, newStatus) => {
    const bId = booking.bookingId || booking.id || booking.docId;
    const uId = booking.userId;

    if (!bId) {
      errorAlert("Booking ID missing.");
      return;
    }

    setIsUpdating(true);
    try {
      await updateBookingStatusInFirestore(bId, newStatus, uId);
      await successAlert(`Booking ${bId} successfully marked as "${newStatus}".`);
      if (selectedBooking && (selectedBooking.bookingId || selectedBooking.id || selectedBooking.docId) === bId) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (e) {
      errorAlert("Failed to update status in Firestore: " + e.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Official BusVista E-Ticket Print Generator
  const handlePrintOfficialTicket = (booking) => {
    if (!booking) return;

    const printWindow = window.open("", "_blank", "width=850,height=950");
    if (!printWindow) {
      alert("Please allow popups to print official travel tickets.");
      return;
    }

    const bId = booking.bookingId || booking.id || "BUS1000";
    const pnr = booking.pnr || "PBK" + String(bId).replace(/\D/g, "");
    const pName = booking.passenger?.name || booking.name || "Customer";
    const pPhone = booking.passenger?.mobile || booking.mobile || "N/A";
    const pEmail = booking.passenger?.email || booking.userEmail || "N/A";
    const busName = booking.bus?.name || "BusVista Premium Coach";
    const busType = booking.bus?.type || "AC Sleeper (2+1)";
    const fromCity = booking.bus?.from || "Origin";
    const toCity = booking.bus?.to || "Destination";
    const departure = booking.bus?.departure || "09:00 PM";
    const travelDate = booking.travelDate || booking.bookingDate || new Date().toISOString().split("T")[0];
    const seats = Array.isArray(booking.selectedSeats) ? booking.selectedSeats.join(", ") : booking.seats || "1 Seat";
    const amount = booking.totalAmount || booking.amount || 650;
    const boardingPoint = booking.boardingPoint?.location || (typeof booking.boardingPoint === "string" ? booking.boardingPoint : "Central Bus Terminal");
    const droppingPoint = booking.droppingPoint?.location || (typeof booking.droppingPoint === "string" ? booking.droppingPoint : "Main City Circle");
    const status = booking.status || "Confirmed";

    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>BusVista E-Ticket - ${pnr}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
          body { background: #f8fafc; padding: 30px 20px; color: #0f172a; }
          .ticket-card { max-width: 700px; margin: 0 auto; background: #ffffff; border: 2px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
          .ticket-header { background: linear-gradient(135deg, #d81b60 0%, #8e24aa 100%); color: #ffffff; padding: 24px 28px; display: flex; justify-content: space-between; align-items: center; }
          .brand-box h1 { font-size: 24px; font-weight: 800; }
          .brand-box p { font-size: 12px; opacity: 0.9; margin-top: 2px; }
          .pnr-box { background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 10px; text-align: right; border: 1px solid rgba(255,255,255,0.3); }
          .pnr-box small { font-size: 11px; text-transform: uppercase; font-weight: 700; opacity: 0.85; }
          .pnr-box strong { display: block; font-size: 18px; font-weight: 800; letter-spacing: 0.5px; }

          .route-strip { background: #f1f5f9; padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; font-size: 16px; font-weight: 700; }
          .route-arrow { color: #d81b60; margin: 0 8px; }
          .travel-date { font-size: 13px; color: #475569; font-weight: 600; }

          .ticket-body { padding: 24px 28px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px; }
          .info-block label { display: block; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .info-block span { font-size: 14.5px; font-weight: 600; color: #0f172a; }

          .points-box { background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
          .point-row { display: flex; gap: 10px; margin-bottom: 10px; font-size: 13.5px; }
          .point-row:last-child { margin-bottom: 0; }
          .point-lbl { font-weight: 700; min-width: 110px; }

          .fare-bar { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
          .fare-bar strong { font-size: 20px; color: #065f46; }

          .instructions { border-top: 1px dashed #cbd5e1; padding-top: 18px; font-size: 11.5px; color: #64748b; line-height: 1.6; }
          .instructions strong { color: #0f172a; }

          @media print {
            body { background: #fff; padding: 0; }
            .ticket-card { border: 1px solid #999; box-shadow: none; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-card">
          <div class="ticket-header">
            <div class="brand-box">
              <h1>🚌 BusVista Travel</h1>
              <p>Official Passenger Travel Reservation Voucher</p>
            </div>
            <div class="pnr-box">
              <small>PNR Number</small>
              <strong>${pnr}</strong>
            </div>
          </div>

          <div class="route-strip">
            <div>
              <span>${fromCity}</span>
              <span class="route-arrow">➔</span>
              <span>${toCity}</span>
            </div>
            <div class="travel-date">
              📅 Travel Date: ${travelDate} (${departure})
            </div>
          </div>

          <div class="ticket-body">
            <div class="info-grid">
              <div class="info-block">
                <label>Primary Passenger</label>
                <span>${pName} (+91 ${pPhone})</span>
              </div>
              <div class="info-block">
                <label>Bus Service & Type</label>
                <span>${busName} (${busType})</span>
              </div>
              <div class="info-block">
                <label>Allocated Seats</label>
                <span style="color: #8e24aa; font-weight: 800;">${seats}</span>
              </div>
              <div class="info-block">
                <label>Booking ID / Status</label>
                <span>${bId} (${status.toUpperCase()})</span>
              </div>
            </div>

            <div class="points-box">
              <div class="point-row">
                <span class="point-lbl" style="color: #d81b60;">📍 Boarding Point:</span>
                <span>${boardingPoint}</span>
              </div>
              <div class="point-row">
                <span class="point-lbl" style="color: #10b981;">📍 Dropping Point:</span>
                <span>${droppingPoint}</span>
              </div>
            </div>

            <div class="fare-bar">
              <div>
                <div style="font-size: 12px; color: #047857; font-weight: 700; text-transform: uppercase;">Total Fare Paid (All Taxes Included)</div>
                <div style="font-size: 11px; color: #065f46;">Payment Mode: Verified Digital Gateway</div>
              </div>
              <strong>₹ ${amount.toLocaleString("en-IN")}</strong>
            </div>

            <div class="instructions">
              <p><strong>Travel Guidelines:</strong> Please carry a valid Government photo ID and report at the boarding point 15 minutes before scheduled departure (${departure}).</p>
              <p>24x7 Customer Support: 1800-BUS-VISTA • Email: help@busvista.com • Emergency Helpline: +91 9876543210</p>
            </div>
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(ticketHtml);
    printWindow.document.close();
  };

  return (
    <div className="admin-subview-container">
      {/* Top Header Strip with Live Filters */}
      <div className="admin-subview-header">
        <div className="subview-header-left">
          <div className="subview-counter-pill">
            <FaTicketAlt />
            <span>{filteredBookings.length} Real-Time Bookings Listed</span>
          </div>
        </div>

        <div className="subview-header-right">
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "upcoming" ? "active" : ""}`}
              onClick={() => setStatusFilter("upcoming")}
            >
              Active / Upcoming ({counts.upcoming})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "completed" ? "active" : ""}`}
              onClick={() => setStatusFilter("completed")}
            >
              Completed ({counts.completed})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "cancelled" ? "active" : ""}`}
              onClick={() => setStatusFilter("cancelled")}
            >
              Cancelled ({counts.cancelled})
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table Loaded Directly from Firestore */}
      <div className="admin-card-table-wrapper">
        {filteredBookings.length === 0 ? (
          <div className="admin-empty-state">
            <FaTicketAlt className="empty-state-icon" />
            <h3>No Bookings Found in Firestore</h3>
            <p>No customer reservations matched your search query or filter.</p>
          </div>
        ) : (
          <table className="admin-custom-table">
            <thead>
              <tr>
                <th>Booking ID / PNR</th>
                <th>Passenger</th>
                <th>Bus / Service</th>
                <th>Route & Schedule</th>
                <th>Seats</th>
                <th>Total Fare</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const bookingId = b.bookingId || b.id || b.docId || "BUS1000";
                const pnr = b.pnr || "PBK" + String(bookingId).replace(/\D/g, "");
                const pName = b.passenger?.name || b.name || "Traveler";
                const pPhone = b.passenger?.mobile || b.mobile || "";
                const busName = b.bus?.name || b.hotelName || "Express Coach";
                const routeText = b.bus?.from && b.bus?.to ? `${b.bus.from} ➔ ${b.bus.to}` : b.city || "Standard Route";
                const seats = Array.isArray(b.selectedSeats) ? b.selectedSeats.join(", ") : b.seats || "1 Seat";
                const fare = b.totalAmount || b.amount || 650;
                const status = b.status || "upcoming";

                return (
                  <tr key={bookingId}>
                    <td>
                      <div className="pnr-cell">
                        <strong className="booking-id-tag">{bookingId}</strong>
                        <span className="pnr-sub">PNR: {pnr}</span>
                      </div>
                    </td>
                    <td>
                      <div className="passenger-cell">
                        <strong className="passenger-name">{pName}</strong>
                        <small className="passenger-meta">
                          {pPhone ? `+91 ${pPhone}` : b.passenger?.email || "Confirmed"}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div className="bus-service-cell">
                        <span className="bus-name-txt">{busName}</span>
                        <small className="bus-type-txt">{b.bus?.type || "AC Sleeper"}</small>
                      </div>
                    </td>
                    <td>
                      <div className="route-schedule-cell">
                        <strong>{routeText}</strong>
                        <small>
                          <FaCalendarAlt className="mini-icon" /> {b.travelDate || b.bookingDate || "Today"}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="seat-badge-pill">{seats}</span>
                    </td>
                    <td>
                      <strong className="fare-highlight">₹ {fare}</strong>
                    </td>
                    <td>
                      <span className={`status-pill pill-${status.toLowerCase()}`}>
                        {status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="action-icon-btn view-btn"
                          title="View Full Booking Details"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn print-btn"
                          title="Print Official E-Ticket"
                          onClick={() => handlePrintOfficialTicket(b)}
                        >
                          <FaPrint />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Booking Details Drawer Modal */}
      {selectedBooking && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drawer-header">
              <h3>Reservation Details (Firestore Live)</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedBooking(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-drawer-content">
              {/* Top Summary Banner */}
              <div className="booking-drawer-banner">
                <div className="banner-left">
                  <span className="drawer-pnr-label">PNR NUMBER</span>
                  <h4 className="drawer-pnr-value">
                    {selectedBooking.pnr || "PBK" + (selectedBooking.bookingId || "10002")}
                  </h4>
                  <small>Booking ID: {selectedBooking.bookingId || selectedBooking.id || "BUS1000"}</small>
                </div>
                <div className="banner-right">
                  <span className={`status-pill pill-${(selectedBooking.status || "upcoming").toLowerCase()}`}>
                    {selectedBooking.status || "upcoming"}
                  </span>
                </div>
              </div>

              {/* Status Update Control directly in Firestore */}
              <div className="status-updater-card">
                <label>Update Status in Firestore:</label>
                <div className="status-btn-row">
                  <button
                    type="button"
                    className="st-btn btn-confirm"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking, "confirmed")}
                  >
                    <FaCheckCircle /> Mark Confirmed
                  </button>
                  <button
                    type="button"
                    className="st-btn btn-complete"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking, "completed")}
                  >
                    <FaCheckCircle /> Complete Trip
                  </button>
                  <button
                    type="button"
                    className="st-btn btn-cancel"
                    disabled={isUpdating}
                    onClick={() => handleUpdateStatus(selectedBooking, "cancelled")}
                  >
                    <FaTimesCircle /> Cancel Booking
                  </button>
                </div>
              </div>

              {/* Passenger Info */}
              <div className="drawer-section-card">
                <h5>
                  <FaUser /> Primary Passenger Information
                </h5>
                <div className="drawer-info-grid">
                  <div>
                    <span className="lbl">Name:</span>
                    <strong>{selectedBooking.passenger?.name || selectedBooking.name || "Customer"}</strong>
                  </div>
                  <div>
                    <span className="lbl">Mobile:</span>
                    <strong>+91 {selectedBooking.passenger?.mobile || selectedBooking.mobile || "9876543210"}</strong>
                  </div>
                  <div>
                    <span className="lbl">Email:</span>
                    <span>{selectedBooking.passenger?.email || selectedBooking.userEmail || "customer@gmail.com"}</span>
                  </div>
                  <div>
                    <span className="lbl">Age / Gender:</span>
                    <span>
                      {selectedBooking.passenger?.age
                        ? `${selectedBooking.passenger.age} yrs (${selectedBooking.passenger.gender || "Passenger"})`
                        : "Adult"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trip & Boarding Info */}
              <div className="drawer-section-card">
                <h5>
                  <FaBus /> Bus & Boarding Schedule
                </h5>
                <div className="drawer-info-grid">
                  <div>
                    <span className="lbl">Operator:</span>
                    <strong>{selectedBooking.bus?.name || "BusVista Coach"}</strong>
                  </div>
                  <div>
                    <span className="lbl">Route:</span>
                    <strong>
                      {selectedBooking.bus?.from || "Sangli"} ➔ {selectedBooking.bus?.to || "Goa"}
                    </strong>
                  </div>
                  <div>
                    <span className="lbl">Travel Date:</span>
                    <span>{selectedBooking.travelDate || selectedBooking.bookingDate || "Today"}</span>
                  </div>
                  <div>
                    <span className="lbl">Departure:</span>
                    <span>{selectedBooking.bus?.departure || "09:00 PM"}</span>
                  </div>
                  <div className="full-width">
                    <span className="lbl">Boarding Point:</span>
                    <span>
                      <FaMapMarkerAlt className="mini-icon text-red" />{" "}
                      {selectedBooking.boardingPoint?.location ||
                        (typeof selectedBooking.boardingPoint === "string"
                          ? selectedBooking.boardingPoint
                          : "Central Bus Stand")}
                    </span>
                  </div>
                  <div className="full-width">
                    <span className="lbl">Dropping Point:</span>
                    <span>
                      <FaMapMarkerAlt className="mini-icon text-green" />{" "}
                      {selectedBooking.droppingPoint?.location ||
                        (typeof selectedBooking.droppingPoint === "string"
                          ? selectedBooking.droppingPoint
                          : "Main Terminal Circle")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seats & Payment */}
              <div className="drawer-section-card">
                <h5>
                  <FaRupeeSign /> Fare & Seat Allocation
                </h5>
                <div className="drawer-info-grid">
                  <div>
                    <span className="lbl">Allocated Seats:</span>
                    <strong className="seat-badge-pill">
                      {Array.isArray(selectedBooking.selectedSeats)
                        ? selectedBooking.selectedSeats.join(", ")
                        : selectedBooking.seats || "1 Seat"}
                    </strong>
                  </div>
                  <div>
                    <span className="lbl">Total Fare:</span>
                    <strong className="fare-highlight">₹ {selectedBooking.totalAmount || selectedBooking.amount || 650}</strong>
                  </div>
                </div>
              </div>

              <div className="drawer-actions-footer">
                <button
                  type="button"
                  className="ticket-print-action-btn"
                  onClick={() => handlePrintOfficialTicket(selectedBooking)}
                >
                  <FaPrint /> Print Official E-Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
