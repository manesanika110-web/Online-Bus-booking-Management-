import React, { useState } from "react";
import {
  FaRoute,
  FaPlus,
  FaMapMarkerAlt,
  FaRoad,
  FaClock,
  FaBus,
  FaRupeeSign,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaCheckCircle,
} from "react-icons/fa";
import {
  addRouteToFirestore,
  updateRouteInFirestore,
  deleteRouteFromFirestore,
} from "./adminDataService";
import { successAlert, errorAlert } from "../utils/alert";

function AdminRoutes({ routes = [], searchQuery = "", onAddNewRoute }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  const initialRouteForm = {
    from: "Sangli",
    to: "Goa",
    routeName: "Sangli to Goa Highway Route",
    distance: "245 km",
    duration: "05h 45m",
    baseFare: 650,
    busesCount: 3,
    status: "Active",
    stopsText: "Vishrambag Stand, Miraj Bypass, Mapusa Circle, Panjim KTC",
  };
  const [formData, setFormData] = useState(initialRouteForm);

  const filteredRoutes = routes.filter((r) => {
    const term = (searchQuery || "").toLowerCase().trim();
    const fromMatch = (r.from || "").toLowerCase().includes(term);
    const toMatch = (r.to || "").toLowerCase().includes(term);
    const nameMatch = (r.routeName || "").toLowerCase().includes(term);
    return !term || fromMatch || toMatch || nameMatch;
  });

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFormData(initialRouteForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (rt) => {
    setEditingRoute(rt);
    setFormData({
      from: rt.from || "",
      to: rt.to || "",
      routeName: rt.routeName || `${rt.from} to ${rt.to}`,
      distance: rt.distance || "200 km",
      duration: rt.duration || "5h",
      baseFare: rt.baseFare || 650,
      busesCount: rt.busesCount || 1,
      status: rt.status || "Active",
      stopsText: Array.isArray(rt.stops) ? rt.stops.join(", ") : rt.stopsText || "",
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.from || !formData.to || !formData.baseFare) {
      errorAlert("Please provide route origin, destination and base fare.");
      return;
    }

    const stopsArray = formData.stopsText
      ? formData.stopsText.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      from: formData.from,
      to: formData.to,
      routeName: formData.routeName || `${formData.from} to ${formData.to} Express Corridor`,
      distance: formData.distance,
      duration: formData.duration,
      baseFare: Number(formData.baseFare),
      busesCount: Number(formData.busesCount) || 1,
      status: formData.status || "Active",
      stops: stopsArray,
    };

    try {
      if (editingRoute) {
        const routeId = editingRoute.id || editingRoute.docId;
        await updateRouteInFirestore(routeId, payload);
        successAlert("Route updated successfully!");
      } else {
        await addRouteToFirestore(payload);
        successAlert("New route corridor created successfully!");
      }
      setIsAddModalOpen(false);
    } catch (err) {
      errorAlert("Failed to save route: " + err.message);
    }
  };

  const handleDelete = async (rt) => {
    const routeId = rt.id || rt.docId;
    if (window.confirm(`Are you sure you want to delete route "${rt.from} ➔ ${rt.to}"?`)) {
      try {
        await deleteRouteFromFirestore(routeId);
        successAlert("Route removed successfully.");
      } catch (err) {
        errorAlert("Failed to delete route: " + err.message);
      }
    }
  };

  return (
    <div className="admin-subview-container">
      {/* Subview Header */}
      <div className="admin-subview-header">
        <div className="subview-header-left">
          <div className="subview-counter-pill">
            <FaRoute />
            <span>{filteredRoutes.length} Travel Routes</span>
          </div>
        </div>

        <div className="subview-header-right">
          <button
            type="button"
            className="admin-primary-add-btn"
            onClick={handleOpenAdd}
          >
            <FaPlus /> Add New Route
          </button>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="admin-routes-grid">
        {filteredRoutes.map((rt) => (
          <div key={rt.id || rt.docId || Math.random()} className="admin-route-card">
            <div className="route-card-header">
              <div className="route-card-title">
                <h3>
                  {rt.from} <span className="arrow">⇄</span> {rt.to}
                </h3>
                <p className="route-subtitle">{rt.routeName || `${rt.from} to ${rt.to} Express`}</p>
              </div>
              <span className={`status-badge-pill ${rt.status === "Active" ? "active" : "inactive"}`}>
                {rt.status || "Active"}
              </span>
            </div>

            <div className="route-card-metrics">
              <div className="metric-box">
                <span className="m-label"><FaRoad /> Distance</span>
                <strong className="m-val">{rt.distance || "240 km"}</strong>
              </div>
              <div className="metric-box">
                <span className="m-label"><FaClock /> Avg Time</span>
                <strong className="m-val">{rt.duration || "5h 30m"}</strong>
              </div>
              <div className="metric-box">
                <span className="m-label"><FaBus /> Daily Buses</span>
                <strong className="m-val">{rt.busesCount || 2} Units</strong>
              </div>
              <div className="metric-box">
                <span className="m-label"><FaRupeeSign /> Starting Fare</span>
                <strong className="m-val price">₹ {rt.baseFare || 650}</strong>
              </div>
            </div>

            {rt.stops && rt.stops.length > 0 && (
              <div className="route-stops-list">
                <span className="stops-heading">Key Boarding Points:</span>
                <div className="stops-chips">
                  {rt.stops.map((st, i) => (
                    <span key={i} className="stop-chip">
                      <FaMapMarkerAlt /> {st}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="route-card-actions">
              <button
                type="button"
                className="card-btn-action edit"
                onClick={() => handleOpenEdit(rt)}
              >
                <FaEdit /> Edit Route
              </button>
              <button
                type="button"
                className="card-btn-action delete"
                onClick={() => handleDelete(rt)}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Route Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3>{editingRoute ? "Edit Route Corridor" : "Create New Route"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Origin City (From) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Destination City (To) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Route Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Pune - Mumbai Expressway Corridor"
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Approx. Distance (km)</label>
                  <input
                    type="text"
                    placeholder="e.g. 150 km"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Typical Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 03h 30m"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Starting Base Fare (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 450"
                    value={formData.baseFare}
                    onChange={(e) => setFormData({ ...formData, baseFare: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Boarding & Dropping Stops (Comma Separated)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Swargate Stand, Wakad Bridge, Vashi Plaza, Dadar TT"
                    value={formData.stopsText}
                    onChange={(e) => setFormData({ ...formData, stopsText: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-footer">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-submit-btn">
                  {editingRoute ? "Save Route" : "Create Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoutes;
