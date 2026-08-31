import "../css/BusDetailsSidebar.css";
import { useNavigate } from "react-router-dom";

import {
  FaWifi,
  FaChargingStation,
  FaSnowflake,
  FaBottleWater,
  FaStar,
  FaBus,
} from "react-icons/fa6";

function BusDetailsSidebar({ selectedBus, onClose }) {
  const navigate = useNavigate(); // ✅ Add this

  if (!selectedBus) return null;

  return (
    <div className="sidebar-overlay">
      <div className="bus-sidebar">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <h2>
          <FaBus /> {selectedBus.name}
        </h2>

        <div className="rating">
          <FaStar /> 4.7 Rating
        </div>

        <h3>{selectedBus.type}</h3>

        <div className="route">
          {selectedBus.from}
          <span> → </span>
          {selectedBus.to}
        </div>

        <div className="time">
          {selectedBus.departure}
          <span> → </span>
          {selectedBus.arrival}
        </div>

        <hr />

        <h3>Amenities</h3>

        <div className="amenities">
          <div>
            <FaWifi /> Free WiFi
          </div>

          <div>
            <FaChargingStation /> Charging
          </div>

          <div>
            <FaBottleWater /> Water Bottle
          </div>

          <div>
            <FaSnowflake /> AC
          </div>
        </div>

        <hr />

        <div className="details">
          <p>
            Available Seats
            <span>{selectedBus.seats}</span>
          </p>

          <p>
            Ticket Price
            <span> ₹{selectedBus.price}</span>
          </p>
        </div>

        <button
          className="continue-btn"
          onClick={() =>
            navigate("/seat-selection", {
              state: { bus: selectedBus },
            })
          }
        >
          Continue Booking
        </button>
      </div>
    </div>
  );
}

export default BusDetailsSidebar;
