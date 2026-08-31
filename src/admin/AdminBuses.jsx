import React, { useState } from "react";
import {
  FaBus,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrashAlt,
  FaStar,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaChair,
  FaTimes,
  FaWifi,
  FaSnowflake,
  FaBolt,
} from "react-icons/fa";
import {
  addBusToFirestore,
  updateBusInFirestore,
  deleteBusFromFirestore,
} from "./adminDataService";
import { successAlert, errorAlert } from "../utils/alert";

function AdminBuses({ buses = [], searchQuery = "", onAddNewBus }) {
  const [filterType, setFilterType] = useState("all");
  const [editingBus, setEditingBus] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [seatPreviewBus, setSeatPreviewBus] = useState(null);

  // Form State for Add / Edit
  const initialForm = {
    name: "",
    type: "AC Sleeper (2 + 1)",
    from: "Sangli",
    to: "Goa",
    departure: "09:00 PM",
    arrival: "05:30 AM",
    duration: "08h 30m",
    price: 850,
    originalPrice: 950,
    seats: 36,
    rating: 4.8,
    category: "AC",
    seatType: "Sleeper",
    status: "Active",
    amenities: ["AC", "Charging Point", "Water Bottle", "Blanket", "Live GPS"],
  };
  const [formData, setFormData] = useState(initialForm);

  // Filter logic
  const filteredBuses = buses.filter((bus) => {
    const term = (searchQuery || "").toLowerCase().trim();
    const nameMatch = (bus.name || "").toLowerCase().includes(term);
    const fromMatch = (bus.from || "").toLowerCase().includes(term);
    const toMatch = (bus.to || "").toLowerCase().includes(term);
    const typeMatch = (bus.type || "").toLowerCase().includes(term);

    const matchesSearch = !term || nameMatch || fromMatch || toMatch || typeMatch;

    if (filterType === "ac") return matchesSearch && (bus.category === "AC" || (bus.type || "").includes("AC"));
    if (filterType === "sleeper") return matchesSearch && (bus.seatType === "Sleeper" || (bus.type || "").includes("Sleeper"));
    if (filterType === "active") return matchesSearch && bus.status !== "Maintenance";
    return matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingBus(null);
    setFormData(initialForm);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      name: bus.name || "",
      type: bus.type || "AC Sleeper (2 + 1)",
      from: bus.from || "Sangli",
      to: bus.to || "Goa",
      departure: bus.departure || "09:00 PM",
      arrival: bus.arrival || "05:30 AM",
      duration: bus.duration || "08h 30m",
      price: bus.price || 850,
      originalPrice: bus.originalPrice || 950,
      seats: bus.seats || 36,
      rating: bus.rating || 4.8,
      category: bus.category || "AC",
      seatType: bus.seatType || "Sleeper",
      status: bus.status || "Active",
      amenities: bus.amenities || ["AC", "Live GPS"],
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.from || !formData.to || !formData.price) {
      errorAlert("Please fill in all required bus details.");
      return;
    }

    try {
      if (editingBus) {
        const busId = editingBus.id || editingBus.docId;
        await updateBusInFirestore(busId, formData);
        successAlert("Bus information updated successfully!");
      } else {
        const newBusData = {
          ...formData,
          id: Math.floor(100 + Math.random() * 900),
          boardingPoints: [
            { time: formData.departure, location: `${formData.from} Central Bus Station` },
          ],
          droppingPoints: [
            { time: formData.arrival, location: `${formData.to} Main Terminal` },
          ],
        };
        await addBusToFirestore(newBusData);
        successAlert("New bus added to fleet successfully!");
      }
      setIsAddModalOpen(false);
    } catch (err) {
      errorAlert("Operation failed: " + err.message);
    }
  };

  const handleDeleteBus = async (bus) => {
    const busId = bus.id || bus.docId;
    if (window.confirm(`Are you sure you want to remove "${bus.name}" from fleet?`)) {
      try {
        await deleteBusFromFirestore(busId);
        successAlert("Bus removed from fleet.");
      } catch (err) {
        errorAlert("Failed to delete bus: " + err.message);
      }
    }
  };

  return (
    <div className="admin-subview-container">
      {/* Top Header & Actions Strip */}
      <div className="admin-subview-header">
        <div className="subview-header-left">
          <div className="subview-counter-pill">
            <FaBus />
            <span>{filteredBuses.length} Coaches in Fleet</span>
          </div>
        </div>

        <div className="subview-header-right">
          <div className="filter-button-group">
            <button
              type="button"
              className={`filter-tab-btn ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All Fleet ({buses.length})
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterType === "ac" ? "active" : ""}`}
              onClick={() => setFilterType("ac")}
            >
              AC Buses
            </button>
            <button
              type="button"
              className={`filter-tab-btn ${filterType === "sleeper" ? "active" : ""}`}
              onClick={() => setFilterType("sleeper")}
            >
              Sleeper
            </button>
          </div>

          <button
            type="button"
            className="admin-primary-add-btn"
            onClick={handleOpenAdd}
          >
            <FaPlus /> Add New Bus
          </button>
        </div>
      </div>

      {/* Buses Grid / Cards */}
      <div className="admin-buses-grid">
        {filteredBuses.map((bus) => {
          const status = bus.status || "Active";
          return (
            <div key={bus.id || bus.docId || Math.random()} className="admin-bus-card">
              <div className="bus-card-head">
                <div className="bus-operator-info">
                  <h4>{bus.name}</h4>
                  <span className="bus-type-badge">{bus.type || "AC Sleeper"}</span>
                </div>
                <span className={`status-badge-pill ${status === "Active" ? "active" : "inactive"}`}>
                  {status}
                </span>
              </div>

              <div className="bus-card-route-strip">
                <div className="route-city-col">
                  <strong className="city-name">{bus.from}</strong>
                  <span className="time-val"><FaClock className="icon-sm" /> {bus.departure}</span>
                </div>
                <div className="route-duration-divider">
                  <span className="duration-txt">{bus.duration || "6h"}</span>
                  <div className="duration-arrow">➔</div>
                </div>
                <div className="route-city-col text-right">
                  <strong className="city-name">{bus.to}</strong>
                  <span className="time-val"><FaClock className="icon-sm" /> {bus.arrival}</span>
                </div>
              </div>

              <div className="bus-card-meta-row">
                <div className="meta-item">
                  <span className="meta-label">Fare Price</span>
                  <strong className="meta-value price-text">₹ {bus.price}</strong>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Available Seats</span>
                  <strong className="meta-value">{bus.seats || 32} Seats</strong>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Rating</span>
                  <span className="meta-value rating-pill"><FaStar /> {bus.rating || 4.8}</span>
                </div>
              </div>

              <div className="bus-card-amenities">
                {(bus.amenities || ["AC", "Charging Point", "Live GPS"]).slice(0, 3).map((am, i) => (
                  <span key={i} className="mini-amenity-tag">✓ {am}</span>
                ))}
              </div>

              <div className="bus-card-actions">
                <button
                  type="button"
                  className="card-btn-action secondary"
                  onClick={() => setSeatPreviewBus(bus)}
                >
                  <FaChair /> Seat Layout
                </button>
                <button
                  type="button"
                  className="card-btn-action edit"
                  onClick={() => handleOpenEdit(bus)}
                  title="Edit Bus"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  type="button"
                  className="card-btn-action delete"
                  onClick={() => handleDeleteBus(bus)}
                  title="Remove Bus"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Bus Modal */}
      {isAddModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="admin-modal-box modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3>{editingBus ? "Edit Bus Details" : "Add New Bus to Fleet"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="admin-modal-form">
              <div className="modal-form-grid">
                <div className="form-group">
                  <label>Bus / Operator Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SRS Travels Multi-Axle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Coach Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="AC Sleeper (2 + 1)">AC Sleeper (2 + 1)</option>
                    <option value="Bharat Benz AC Sleeper">Bharat Benz AC Sleeper</option>
                    <option value="Volvo Multi-Axle AC">Volvo Multi-Axle AC</option>
                    <option value="Non-AC Seater / Sleeper (2 + 2)">Non-AC Seater / Sleeper</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Origin City (From) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sangli"
                    value={formData.from}
                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Destination City (To) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Goa"
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Departure Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:30 PM"
                    value={formData.departure}
                    onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Arrival Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 05:00 AM"
                    value={formData.arrival}
                    onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Duration *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 07h 30m"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Fare Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 950"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Total Capacity (Seats) *</label>
                  <input
                    type="number"
                    required
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                  />
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Active">Active / On Route</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Reserved">Reserved</option>
                  </select>
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
                  {editingBus ? "Save Changes" : "Create Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Matrix Layout Preview Modal */}
      {seatPreviewBus && (
        <div className="admin-modal-backdrop" onClick={() => setSeatPreviewBus(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-box-header">
              <h3>Seat Layout - {seatPreviewBus.name}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSeatPreviewBus(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="seat-preview-body">
              <p className="seat-preview-sub">
                Configuration: <strong>{seatPreviewBus.type}</strong> ({seatPreviewBus.seats || 36} Seats)
              </p>

              <div className="demo-bus-seat-matrix">
                <div className="matrix-front-steering">Driver Cabin 🚌</div>
                <div className="matrix-grid-rows">
                  {["L1", "L2", "L3", "L4", "L5", "L6"].map((row, rIdx) => (
                    <div key={row} className="matrix-seat-row">
                      <span className="seat-cell lower">LB-{rIdx * 2 + 1}</span>
                      <span className="seat-cell lower">LB-{rIdx * 2 + 2}</span>
                      <span className="aisle-spacer">Aisle</span>
                      <span className="seat-cell upper">UB-{rIdx * 2 + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBuses;
