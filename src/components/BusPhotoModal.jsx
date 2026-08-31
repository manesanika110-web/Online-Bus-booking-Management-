import React from "react";
import { FaTimes, FaCamera, FaBus, FaStar, FaShieldAlt } from "react-icons/fa";
import "../css/Modal.css";

const BusPhotoModal = ({ isOpen, onClose, bus }) => {
  if (!isOpen || !bus) return null;

  const samplePhotos = [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  ];

  const photos = bus.photos && bus.photos.length > 0 ? bus.photos : samplePhotos;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content photo-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "780px" }}
      >
        <div className="modal-header">
          <div className="modal-title-box">
            <FaCamera className="modal-header-icon" />
            <h3>{bus.name} - Bus Gallery & Interior</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#0f172a" }}>
                {bus.type}
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                {bus.from} ➔ {bus.to} | Departs {bus.departure}
              </p>
            </div>
            <span
              style={{
                background: "#dcfce7",
                color: "#15803d",
                fontWeight: "700",
                fontSize: "13px",
                padding: "4px 10px",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <FaStar style={{ color: "#f59e0b" }} /> {bus.rating} Verified Fleet
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
              marginBottom: "20px",
            }}
          >
            {photos.map((src, index) => (
              <div
                key={index}
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  height: "180px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={src}
                  alt={`Bus view ${index + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "10px",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "#1e40af",
            }}
          >
            <FaShieldAlt style={{ fontSize: "16px", flexShrink: 0 }} />
            <span>
              100% Sanitized and cleaned before every journey. Equipped with AC climate control, fresh blankets, and USB chargers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusPhotoModal;
