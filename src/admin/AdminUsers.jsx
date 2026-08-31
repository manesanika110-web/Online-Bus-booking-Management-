import React, { useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaTicketAlt,
  FaRupeeSign,
  FaCheckCircle,
  FaBan,
  FaEye,
  FaTimes,
  FaUserShield,
  FaFilter,
} from "react-icons/fa";
import { updateUserStatusInFirestore } from "./adminDataService";
import { successAlert, errorAlert } from "../utils/alert";

function AdminUsers({ users = [], bookings = [], searchQuery = "" }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [localSearch, setLocalSearch] = useState("");

  const effectiveSearch = searchQuery || localSearch;

  // Filter users
  const filteredUsers = users.filter((u) => {
    const term = effectiveSearch.toLowerCase().trim();
    const nameMatch = (u.name || u.displayName || "").toLowerCase().includes(term);
    const emailMatch = (u.email || "").toLowerCase().includes(term);
    const mobileMatch = (u.mobile || "").includes(term);
    const uidMatch = (u.uid || u.id || "").toLowerCase().includes(term);

    const matchesSearch = !term || nameMatch || emailMatch || mobileMatch || uidMatch;

    if (statusFilter === "active") return matchesSearch && u.status !== "Suspended";
    if (statusFilter === "suspended") return matchesSearch && u.status === "Suspended";
    return matchesSearch;
  });

  // Calculate user booking counts and spend
  const getUserStats = (userId, userEmail) => {
    const userBookings = bookings.filter(
      (b) =>
        (userId && b.userId === userId) ||
        (userEmail && b.userEmail?.toLowerCase() === userEmail?.toLowerCase()) ||
        (userEmail && b.passenger?.email?.toLowerCase() === userEmail?.toLowerCase())
    );

    const totalSpend = userBookings.reduce(
      (acc, b) => (b.status !== "cancelled" ? acc + (Number(b.totalAmount) || 0) : acc),
      0
    );

    return {
      count: userBookings.length,
      spend: totalSpend,
      bookings: userBookings,
    };
  };

  const handleToggleStatus = async (user) => {
    const currentStatus = user.status || "Active";
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";

    try {
      await updateUserStatusInFirestore(user.id || user.uid, newStatus);
      successAlert(`User status updated to ${newStatus}`);
    } catch (e) {
      errorAlert("Failed to update user status: " + e.message);
    }
  };

  return (
    <div className="admin-subview-container">
      {/* Subview Header & Stats Strip */}
      <div className="admin-subview-header">
        <div className="subview-header-left">
          <div className="subview-counter-pill">
            <FaUsers />
            <span>{filteredUsers.length} Customers Found</span>
          </div>
        </div>

        <div className="subview-header-right">
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              All Users ({users.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "active" ? "active" : ""}`}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${statusFilter === "suspended" ? "active" : ""}`}
              onClick={() => setStatusFilter("suspended")}
            >
              Suspended
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card-table-wrapper">
        {filteredUsers.length === 0 ? (
          <div className="admin-empty-state">
            <FaUsers className="empty-state-icon" />
            <h3>No Users Found</h3>
            <p>No customer records match your current filter criteria.</p>
          </div>
        ) : (
          <table className="admin-custom-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Contact Info</th>
                <th>Member Since</th>
                <th>Total Bookings</th>
                <th>Total Spent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const stats = getUserStats(user.id || user.uid, user.email);
                const userName = user.displayName || user.name || "Customer";
                const userPhoto = user.profilePhoto || user.photoURL;
                const status = user.status || "Active";

                return (
                  <tr key={user.id || user.uid || Math.random()}>
                    <td>
                      <div className="user-profile-cell">
                        {userPhoto ? (
                          <img src={userPhoto} alt={userName} className="user-avatar-img" />
                        ) : (
                          <div className="user-avatar-fallback">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="user-name-box">
                          <strong>{userName}</strong>
                          <small className="user-uid-code">UID: {(user.uid || user.id || "").slice(0, 8)}...</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-cell">
                        <span className="contact-email">
                          <FaEnvelope className="mini-icon" /> {user.email || "No email"}
                        </span>
                        {user.mobile && (
                          <span className="contact-phone">
                            <FaPhone className="mini-icon" /> +91 {user.mobile}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="date-text">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Verified Member"}
                      </span>
                    </td>
                    <td>
                      <span className="booking-count-pill">{stats.count} Trips</span>
                    </td>
                    <td>
                      <strong className="spend-text">₹ {stats.spend.toLocaleString("en-IN")}</strong>
                    </td>
                    <td>
                      <span className={`user-status-pill ${status.toLowerCase()}`}>
                        {status === "Active" ? <FaCheckCircle /> : <FaBan />} {status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons-group">
                        <button
                          type="button"
                          className="action-icon-btn view-btn"
                          title="View Customer Profile & Bookings"
                          onClick={() => setSelectedUser(user)}
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className={`action-icon-btn toggle-status-btn ${status === "Active" ? "suspend" : "activate"}`}
                          title={status === "Active" ? "Suspend Account" : "Activate Account"}
                          onClick={() => handleToggleStatus(user)}
                        >
                          {status === "Active" ? <FaBan /> : <FaCheckCircle />}
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

      {/* User Details Modal Drawer */}
      {selectedUser && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedUser(null)}>
          <div className="admin-modal-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drawer-header">
              <h3>Customer Details</h3>
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedUser(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-drawer-content">
              {/* Profile Card Header */}
              <div className="drawer-profile-banner">
                {selectedUser.profilePhoto ? (
                  <img
                    src={selectedUser.profilePhoto}
                    alt={selectedUser.name}
                    className="drawer-avatar-lg"
                  />
                ) : (
                  <div className="drawer-avatar-fallback">
                    {(selectedUser.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4>{selectedUser.displayName || selectedUser.name || "Customer"}</h4>
                  <p>{selectedUser.email}</p>
                  <span className="drawer-status-tag">{selectedUser.status || "Active Customer"}</span>
                </div>
              </div>

              {/* Stats Summary */}
              {(() => {
                const s = getUserStats(selectedUser.id || selectedUser.uid, selectedUser.email);
                return (
                  <>
                    <div className="drawer-stats-row">
                      <div className="drawer-stat-card">
                        <span className="stat-num">{s.count}</span>
                        <span className="stat-txt">Total Bookings</span>
                      </div>
                      <div className="drawer-stat-card">
                        <span className="stat-num">₹ {s.spend.toLocaleString()}</span>
                        <span className="stat-txt">Lifetime Spend</span>
                      </div>
                    </div>

                    <div className="drawer-bookings-section">
                      <h5>Recent Booking History</h5>
                      {s.bookings.length === 0 ? (
                        <p className="no-bookings-txt">No tickets booked by this user yet.</p>
                      ) : (
                        <div className="drawer-booking-items">
                          {s.bookings.map((b, i) => (
                            <div key={b.bookingId || i} className="drawer-booking-card">
                              <div className="card-top-row">
                                <strong>{b.bookingId || "BUS" + (1000 + i)}</strong>
                                <span className={`status-pill pill-${b.status || "upcoming"}`}>
                                  {b.status || "upcoming"}
                                </span>
                              </div>
                              <div className="card-route-info">
                                {b.bus?.from} → {b.bus?.to} ({b.bus?.name || "BusVista Coach"})
                              </div>
                              <div className="card-meta-info">
                                <span>Seats: {Array.isArray(b.selectedSeats) ? b.selectedSeats.join(", ") : b.seats}</span>
                                <strong>₹ {b.totalAmount}</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
