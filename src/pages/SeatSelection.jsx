import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/SeatSelection.css";

function SeatSelection() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const bus = state?.bus;

  const [selectedSeats, setSelectedSeats] = useState([]);

  const bookedSeats = [3, 7, 12, 18, 22, 27];
  const totalSeats = 32;

  const handleSeatClick = (seatNo) => {
    if (bookedSeats.includes(seatNo)) return;

    if (selectedSeats.includes(seatNo)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNo));
    } else {
      setSelectedSeats([...selectedSeats, seatNo]);
    }
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;

    navigate("/passenger-details", {
      state: {
        bus,
        selectedSeats,
      },
    });
  };

  if (!bus) return <h2>No Bus Selected</h2>;

  return (
    <div className="seat-page">
      {/* Bus Details */}
      <div className="bus-info">
        <h2>{bus.name}</h2>

        <p>
          {bus.from} → {bus.to}
        </p>

        <p>₹ {bus.price}</p>
      </div>

      {/* Main Seat Container */}
      <div className="seat-container">
        {/* Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <span className="legend-box available"></span>
            <span>Available</span>
          </div>

          <div className="legend-item">
            <span className="legend-box selected-seat"></span>
            <span>Selected</span>
          </div>

          <div className="legend-item">
            <span className="legend-box booked-seat"></span>
            <span>Booked</span>
          </div>
        </div>

        {/* Seat Layout */}
        <div className="seat-layout">
          {Array.from({ length: totalSeats }, (_, i) => {
            const seatNo = i + 1;

            let className = "seat";

            if (bookedSeats.includes(seatNo)) {
              className += " booked";
            } else if (selectedSeats.includes(seatNo)) {
              className += " selected";
            }

            return (
              <div
                key={seatNo}
                className={className}
                onClick={() => handleSeatClick(seatNo)}
              >
                {seatNo}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="seat-summary">
          <h3>Total Selected : {selectedSeats.length}</h3>

          <h2>Total Fare : ₹ {selectedSeats.length * bus.price}</h2>
        </div>

        {/* Buttons */}
        <div className="seat-buttons">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>

          <button
            className="continue-btn"
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
          >
            Continue Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeatSelection;
