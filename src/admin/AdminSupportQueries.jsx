import React, { useState } from "react";
import {
  FaHeadset,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaTrashAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaUser,
  FaCalendarAlt,
  FaTimes,
  FaReply,
  FaTag,
} from "react-icons/fa";
import {
  updateSupportQueryStatusInFirestore,
  deleteSupportQueryFromFirestore,
} from "./adminDataService";
import { successAlert, errorAlert } from "../utils/alert";

function AdminSupportQueries({ queries = [], searchQuery = "" }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter queries based on search query, status, and category
  const filteredQueries = queries.filter((q) => {
    const term = (searchQuery || "").toLowerCase().trim();
    const qId = String(q.id || q.docId || "").toLowerCase();
    const name = String(q.name || "").toLowerCase();
    const email = String(q.email || "").toLowerCase();
    const mobile = String(q.mobile || "").toLowerCase();
    const message = String(q.message || "").toLowerCase();
    const issueType = String(q.issueType || "").toLowerCase();

    const matchesSearch =
      !term ||
      qId.includes(term) ||
      name.includes(term) ||
      email.includes(term) ||
      mobile.includes(term) ||
      message.includes(term) ||
      issueType.includes(term);

    const qStatus = (q.status || "Open").toLowerCase();
    const matchesStatus =
      statusFilter === "all" ||
      qStatus === statusFilter.toLowerCase();

    const matchesCategory =
      categoryFilter === "all" ||
      issueType.includes(categoryFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate status counts
  const counts = {
    all: queries.length,
    open: queries.filter((q) => (q.status || "Open").toLowerCase() === "open").length,
    inProgress: queries.filter((q) => (q.status || "").toLowerCase() === "in progress").length,
    resolved: queries.filter((q) => (q.status || "").toLowerCase() === "resolved").length,
  };

  const handleUpdateStatus = async (queryId, newStatus) => {
    setIsUpdating(true);
    try {
      await updateSupportQueryStatusInFirestore(queryId, newStatus);
      await successAlert(`Query ${queryId} marked as "${newStatus}".`);
      if (selectedQuery && (selectedQuery.id || selectedQuery.docId) === queryId) {
        setSelectedQuery({ ...selectedQuery, status: newStatus });
      }
    } catch (err) {
      errorAlert("Failed to update query status: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteQuery = async (queryId) => {
    if (!window.confirm(`Are you sure you want to permanently delete query ${queryId}?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await deleteSupportQueryFromFirestore(queryId);
      await successAlert(`Query ${queryId} has been deleted.`);
      if (selectedQuery && (selectedQuery.id || selectedQuery.docId) === queryId) {
        setSelectedQuery(null);
      }
    } catch (err) {
      errorAlert("Failed to delete query: " + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status = "Open") => {
    const s = status.toLowerCase();
    if (s === "resolved") {
      return (
        <span className="status-pill completed">
          <FaCheckCircle /> Resolved
        </span>
      );
    }
    if (s === "in progress") {
      return (
        <span className="status-pill transit">
          <FaClock /> In Progress
        </span>
      );
    }
    return (
      <span className="status-pill upcoming">
        <FaExclamationCircle /> Open
      </span>
    );
  };

  const getCategoryColor = (issueType = "") => {
    const it = issueType.toLowerCase();
    if (it.includes("payment")) return "cat-tag-purple";
    if (it.includes("cancellation") || it.includes("refund")) return "cat-tag-red";
    if (it.includes("delay") || it.includes("boarding")) return "cat-tag-orange";
    if (it.includes("booking")) return "cat-tag-blue";
    return "cat-tag-green";
  };

  return (
    <div className="admin-bookings-view">
      {/* 1. Header & Live Metrics */}
      <div className="bookings-top-header">
        <div className="header-titles">
          <h2>Customer Support Queries (`support_queries`)</h2>
          <p>Real-time stream of user tickets, help requests & customer inquiries</p>
        </div>

        {/* Tab Filters */}
        <div className="bookings-tab-filters">
          <button
            type="button"
            className={`tab-filter-btn ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            All Queries ({counts.all})
          </button>
          <button
            type="button"
            className={`tab-filter-btn ${statusFilter === "open" ? "active" : ""}`}
            onClick={() => setStatusFilter("open")}
          >
            Open ({counts.open})
          </button>
          <button
            type="button"
            className={`tab-filter-btn ${statusFilter === "in progress" ? "active" : ""}`}
            onClick={() => setStatusFilter("in progress")}
          >
            In Progress ({counts.inProgress})
          </button>
          <button
            type="button"
            className={`tab-filter-btn ${statusFilter === "resolved" ? "active" : ""}`}
            onClick={() => setStatusFilter("resolved")}
          >
            Resolved ({counts.resolved})
          </button>
        </div>
      </div>

      {/* 2. Secondary Category Filter Bar */}
      <div className="bookings-actions-toolbar" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#475569" }}>
            <FaFilter style={{ marginRight: "4px" }} /> Filter by Category:
          </span>
          {["All", "Booking", "Payment", "Cancellation", "Delay", "Contact"].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`pill-btn ${categoryFilter.toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
              onClick={() => setCategoryFilter(cat.toLowerCase())}
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
                border: "1px solid #cbd5e1",
                background: categoryFilter.toLowerCase() === cat.toLowerCase() ? "#d81b60" : "#ffffff",
                color: categoryFilter.toLowerCase() === cat.toLowerCase() ? "#ffffff" : "#334155",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Table of Real Support Queries */}
      <div className="admin-table-container">
        {filteredQueries.length === 0 ? (
          <div className="admin-empty-state">
            <FaHeadset className="empty-state-icon" />
            <p>No customer support queries found.</p>
            <small>When users submit inquiries via Help Modal or Contact Us, they will appear here in real-time.</small>
          </div>
        ) : (
          <table className="admin-custom-table">
            <thead>
              <tr>
                <th>Query ID</th>
                <th>Customer Info</th>
                <th>Category</th>
                <th>Message Preview</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((q) => {
                const qId = q.id || q.docId || "QUERY_100";
                const name = q.name || "Customer";
                const email = q.email || "N/A";
                const mobile = q.mobile || "N/A";
                const category = q.issueType || "General Query";
                const message = q.message || "No message content provided.";
                const dateStr = q.createdAt
                  ? new Date(q.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Recent";

                return (
                  <tr key={qId}>
                    <td>
                      <strong style={{ color: "#d81b60", fontWeight: "700" }}>{qId}</strong>
                    </td>
                    <td>
                      <div className="passenger-cell">
                        <span className="passenger-name font-bold">{name}</span>
                        <small>
                          <FaEnvelope className="mini-icon" /> {email}
                        </small>
                        {mobile !== "N/A" && (
                          <small>
                            <FaPhoneAlt className="mini-icon" /> {mobile}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11.5px",
                          fontWeight: "700",
                          background: "#f1f5f9",
                          color: "#1e293b",
                        }}
                      >
                        {category}
                      </span>
                    </td>
                    <td style={{ maxWidth: "260px" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#334155",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={message}
                      >
                        {message}
                      </p>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#64748b" }}>{dateStr}</span>
                    </td>
                    <td>{getStatusBadge(q.status)}</td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          type="button"
                          className="table-action-btn view"
                          onClick={() => setSelectedQuery(q)}
                          title="View Details & Reply"
                        >
                          View
                        </button>

                        {q.status !== "Resolved" && (
                          <button
                            type="button"
                            className="table-action-btn complete"
                            onClick={() => handleUpdateStatus(qId, "Resolved")}
                            disabled={isUpdating}
                            title="Mark as Resolved"
                          >
                            Resolve
                          </button>
                        )}

                        {q.status === "Open" && (
                          <button
                            type="button"
                            className="table-action-btn cancel"
                            style={{ color: "#d97706", borderColor: "#fde68a" }}
                            onClick={() => handleUpdateStatus(qId, "In Progress")}
                            disabled={isUpdating}
                            title="Mark In Progress"
                          >
                            In Progress
                          </button>
                        )}

                        <button
                          type="button"
                          className="table-action-btn cancel"
                          onClick={() => handleDeleteQuery(qId)}
                          disabled={isUpdating}
                          title="Delete Query"
                        >
                          <FaTrashAlt />
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

      {/* 4. Query Detail Modal */}
      {selectedQuery && (
        <div className="admin-modal-overlay" onClick={() => setSelectedQuery(null)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="admin-modal-header">
              <div className="header-icon-title">
                <FaHeadset style={{ color: "#d81b60", fontSize: "20px" }} />
                <div>
                  <h3 style={{ margin: 0 }}>Support Ticket Details</h3>
                  <small style={{ color: "#64748b" }}>ID: {selectedQuery.id || selectedQuery.docId}</small>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedQuery(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                    Customer Name
                  </label>
                  <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a" }}>
                    {selectedQuery.name}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                    Current Status
                  </label>
                  <div>{getStatusBadge(selectedQuery.status)}</div>
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", marginBottom: "16px" }}>
                <div style={{ marginBottom: "8px", fontSize: "13px" }}>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${selectedQuery.email}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                    {selectedQuery.email}
                  </a>
                </div>
                {selectedQuery.mobile && (
                  <div style={{ marginBottom: "8px", fontSize: "13px" }}>
                    <strong>Mobile:</strong>{" "}
                    <a href={`tel:${selectedQuery.mobile}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                      {selectedQuery.mobile}
                    </a>
                  </div>
                )}
                <div style={{ fontSize: "13px" }}>
                  <strong>Category:</strong>{" "}
                  <span style={{ color: "#d81b60", fontWeight: "700" }}>{selectedQuery.issueType}</span>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748b", fontWeight: "700" }}>
                  Customer Message / Query Description
                </label>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "14px",
                    fontSize: "14px",
                    color: "#1e293b",
                    lineHeight: "1.6",
                    marginTop: "6px",
                  }}
                >
                  {selectedQuery.message}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href={`mailto:${selectedQuery.email}?subject=Regarding BusVista Support Request ${selectedQuery.id}`}
                    className="quick-action-btn"
                    style={{
                      background: "#2563eb",
                      color: "#fff",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <FaReply /> Email Reply
                  </a>
                  {selectedQuery.mobile && (
                    <a
                      href={`tel:${selectedQuery.mobile}`}
                      className="quick-action-btn"
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      <FaPhoneAlt /> Call Customer
                    </a>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {selectedQuery.status !== "Resolved" ? (
                    <button
                      type="button"
                      className="btn-confirm-red"
                      style={{ padding: "8px 14px", fontSize: "13px" }}
                      onClick={() =>
                        handleUpdateStatus(selectedQuery.id || selectedQuery.docId, "Resolved")
                      }
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-back-outline"
                      style={{ padding: "8px 14px", fontSize: "13px" }}
                      onClick={() =>
                        handleUpdateStatus(selectedQuery.id || selectedQuery.docId, "Open")
                      }
                    >
                      Reopen Query
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSupportQueries;
