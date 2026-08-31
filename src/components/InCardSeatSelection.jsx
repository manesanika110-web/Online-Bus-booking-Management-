import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaCheck } from "react-icons/fa";
import "../css/InCardSeatSelection.css";

const InCardSeatSelection = ({ bus, travelDate, onClose, onProceedBooking }) => {
  const navigate = useNavigate();

  // Base price for this bus
  const basePrice = bus.price || 550;
  const priceTier1 = basePrice;
  const priceTier2 = basePrice + 90;
  const priceTier3 = basePrice + 180;

  const priceOptions = [
    { label: "All", value: "all" },
    { label: `₹${priceTier1}`, value: priceTier1 },
    { label: `₹${priceTier2}`, value: priceTier2 },
    { label: `₹${priceTier3}`, value: priceTier3 },
  ];

  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");
  const [singleLadyFilter, setSingleLadyFilter] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activePointTab, setActivePointTab] = useState("boarding"); // 'boarding' | 'dropping'

  // Boarding & Dropping points
  const defaultBoarding = [
    {
      id: "b1",
      location: `${bus.from}- Ankle Phata`,
      contact: `${bus.from}- Ankle Phata-9822315511, 9372762930`,
      time: bus.departure || "03:45 AM",
    },
    {
      id: "b2",
      location: `${bus.from} ST Stand Gate No. 2`,
      contact: `${bus.from} City Bus Depot Terminal`,
      time: "04:10 AM",
    },
    {
      id: "b3",
      location: `${bus.from} Bypass Highway Overbridge`,
      contact: "Near Toll Plaza Crossing",
      time: "04:30 AM",
    },
  ];

  const defaultDropping = [
    {
      id: "d1",
      location: `${bus.to} Gandhi Circle / Court Junction`,
      contact: "Near Taxi Stand NH66",
      time: "08:45 AM",
    },
    {
      id: "d2",
      location: `${bus.to} KTC Bus Terminal Stand`,
      contact: "Platform No. 4 Central Station",
      time: bus.arrival || "09:30 AM",
    },
    {
      id: "d3",
      location: `${bus.to} Bypass City Depot`,
      contact: "Near Main Market Area",
      time: "10:00 AM",
    },
  ];

  const boardingPoints =
    bus.boardingPoints && bus.boardingPoints.length > 0
      ? bus.boardingPoints.map((bp, i) => ({
          id: `bp-${i}`,
          location: bp.location,
          contact: bp.landmark ? `Landmark: ${bp.landmark}` : `${bus.from} Pickup Point`,
          time: bp.time,
        }))
      : defaultBoarding;

  const droppingPoints =
    bus.droppingPoints && bus.droppingPoints.length > 0
      ? bus.droppingPoints.map((dp, i) => ({
          id: `dp-${i}`,
          location: dp.location,
          contact: dp.landmark ? `Landmark: ${dp.landmark}` : `${bus.to} Drop Point`,
          time: dp.time,
        }))
      : defaultDropping;

  const [selectedBoarding, setSelectedBoarding] = useState(boardingPoints[0]);
  const [selectedDropping, setSelectedDropping] = useState(droppingPoints[0]);

  // Generate Upper and Lower Berth Layout matching image 1
  const { upperBerths, lowerBerths } = useMemo(() => {
    // Upper deck: 2 top rows (10 berths) + 1 bottom single row (5 berths)
    const upper = [
      // Top Double Row 1
      { id: "UB1", number: "UB1", price: priceTier1, gender: "available", status: "available" },
      { id: "UB3", number: "UB3", price: priceTier1, gender: "available", status: "available" },
      { id: "UB5", number: "UB5", price: priceTier2, gender: "available", status: "available" },
      { id: "UB7", number: "UB7", price: priceTier2, gender: "male", status: "available" },
      { id: "UB9", number: "UB9", price: priceTier1, gender: "available", status: "available" },
      // Top Double Row 2
      { id: "UB2", number: "UB2", price: priceTier1, gender: "available", status: "available" },
      { id: "UB4", number: "UB4", price: priceTier1, gender: "available", status: "available" },
      { id: "UB6", number: "UB6", price: priceTier2, gender: "available", status: "available" },
      { id: "UB8", number: "UB8", price: priceTier2, gender: "male", status: "available" },
      { id: "UB10", number: "UB10", price: priceTier1, gender: "male", status: "available" },
      // Bottom Single Row (Matching Image 1: first 3 available, last 2 pink female booked)
      { id: "UB11", number: "UB11", price: priceTier1, gender: "available", status: "available" },
      { id: "UB12", number: "UB12", price: priceTier1, gender: "available", status: "available" },
      { id: "UB13", number: "UB13", price: priceTier2, gender: "available", status: "available" },
      { id: "UB14", number: "UB14", price: priceTier2, gender: "female", status: "booked" },
      { id: "UB15", number: "UB15", price: priceTier2, gender: "female", status: "booked" },
    ];

    // Lower deck: 2 top rows (10 berths) + 1 bottom single row (5 berths)
    const lower = [
      // Top Double Row 1 (Matching Image 1)
      { id: "LB1", number: "LB1", price: priceTier1, gender: "available", status: "available" },
      { id: "LB3", number: "LB3", price: priceTier1, gender: "available", status: "available" },
      { id: "LB5", number: "LB5", price: priceTier2, gender: "female", status: "booked" },
      { id: "LB7", number: "LB7", price: priceTier2, gender: "available", status: "available" },
      { id: "LB9", number: "LB9", price: priceTier2, gender: "female", status: "booked" },
      // Top Double Row 2
      { id: "LB2", number: "LB2", price: priceTier1, gender: "available", status: "available" },
      { id: "LB4", number: "LB4", price: priceTier1, gender: "female", status: "booked" },
      { id: "LB6", number: "LB6", price: priceTier2, gender: "available", status: "available" },
      { id: "LB8", number: "LB8", price: priceTier2, gender: "female", status: "booked" },
      { id: "LB10", number: "LB10", price: priceTier1, gender: "available", status: "available" },
      // Bottom Single Row
      { id: "LB11", number: "LB11", price: priceTier3, gender: "available", status: "available" },
      { id: "LB12", number: "LB12", price: priceTier3, gender: "available", status: "available" },
      { id: "LB13", number: "LB13", price: priceTier3, gender: "available", status: "available" },
      { id: "LB14", number: "LB14", price: priceTier3, gender: "available", status: "available" },
      { id: "LB15", number: "LB15", price: priceTier3, gender: "available", status: "available" },
    ];

    return { upperBerths: upper, lowerBerths: lower };
  }, [priceTier1, priceTier2, priceTier3]);

  // Handle seat click
  const handleSeatClick = (berth) => {
    if (berth.status === "booked") return;

    const isAlreadySelected = selectedSeats.some((s) => s.id === berth.id);

    if (isAlreadySelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== berth.id));
    } else {
      if (selectedSeats.length >= 6) {
        alert("You can select a maximum of 6 seats at a time.");
        return;
      }
      setSelectedSeats([...selectedSeats, berth]);
    }
  };

  const totalFare = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + (seat.price || basePrice), 0);
  }, [selectedSeats, basePrice]);

  const handleProceedBooking = () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least 1 seat to continue booking.");
      return;
    }

    const seatNumbers = selectedSeats.map((s) => s.number);
    const bookingPayload = {
      bus,
      selectedSeats: seatNumbers,
      selectedSeatDetails: selectedSeats,
      boardingPoint: selectedBoarding,
      droppingPoint: selectedDropping,
      totalAmount: totalFare,
      travelDate: travelDate || "Today",
    };

    if (onProceedBooking) {
      onProceedBooking(bookingPayload);
    } else {
      navigate("/passenger-details", {
        state: bookingPayload,
      });
    }
  };

  // Render a berth element
  const renderBerth = (berth) => {
    const isSelected = selectedSeats.some((s) => s.id === berth.id);
    const isBooked = berth.status === "booked";
    const isFemale = berth.gender === "female";
    const isMale = berth.gender === "male";

    let berthClass = "incard-berth";
    if (isBooked) {
      berthClass += isFemale ? " female-booked" : " booked";
    } else if (isSelected) {
      berthClass += " selected";
    } else {
      berthClass += " available";
      if (isFemale) berthClass += " female-available";
      if (isMale) berthClass += " male-available";
    }

    // Filter matching
    const matchesPrice =
      selectedPriceFilter === "all" || berth.price === selectedPriceFilter;
    const matchesLady = !singleLadyFilter || isFemale;

    if (!matchesPrice || !matchesLady) {
      berthClass += " filtered-dimmed";
    }

    return (
      <div
        key={berth.id}
        className={berthClass}
        onClick={() => handleSeatClick(berth)}
        title={`${berth.number} - ₹${berth.price} (${isBooked ? "Booked" : "Available"})`}
      >
        {isSelected ? (
          <span className="berth-price-label">✓ {berth.number}</span>
        ) : !isBooked ? (
          <span className="berth-price-label">₹{berth.price}</span>
        ) : null}
      </div>
    );
  };

  return (
    <div className="incard-seat-selection-wrapper">
      {/* 1. Top Price Filter Pills & Single Lady Toggle */}
      <div className="seat-filter-top-bar">
        <div className="price-pills-group">
          {priceOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`price-filter-pill-btn ${
                selectedPriceFilter === opt.value ? "active" : ""
              }`}
              onClick={() => setSelectedPriceFilter(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="lady-seat-toggle-box">
          <span className="lady-toggle-label">Single lady seats</span>
          <label className="switch-toggle">
            <input
              type="checkbox"
              checked={singleLadyFilter}
              onChange={(e) => setSingleLadyFilter(e.target.checked)}
            />
            <span className="slider-round"></span>
          </label>
        </div>
      </div>

      {/* 2. Main Body: Left Deck Layout + Right Boarding/Dropping Selection */}
      <div className="seat-selection-main-grid">
        {/* Left Side: Bus Decks */}
        <div className="bus-decks-container">
          {/* Upper Deck */}
          <div className="deck-card upper-deck-card">
            <div className="deck-vertical-label">Upper</div>
            <div className="deck-berths-layout">
              {/* Double Berths (2 rows of 5) */}
              <div className="double-berths-grid">
                {upperBerths.slice(0, 10).map((b) => renderBerth(b))}
              </div>

              <div className="deck-aisle-divider"></div>

              {/* Single Berths (1 row of 5) */}
              <div className="single-berths-grid">
                {upperBerths.slice(10, 15).map((b) => renderBerth(b))}
              </div>
            </div>
          </div>

          {/* Lower Deck */}
          <div className="deck-card lower-deck-card">
            <div className="deck-left-steering-box">
              <span className="deck-vertical-label">Lower</span>
              {/* SVG Steering Wheel */}
              <svg
                className="steering-wheel-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
              </svg>
            </div>

            <div className="deck-berths-layout">
              {/* Double Berths (2 rows of 5) */}
              <div className="double-berths-grid">
                {lowerBerths.slice(0, 10).map((b) => renderBerth(b))}
              </div>

              <div className="deck-aisle-divider"></div>

              {/* Single Berths (1 row of 5) */}
              <div className="single-berths-grid">
                {lowerBerths.slice(10, 15).map((b) => renderBerth(b))}
              </div>
            </div>
          </div>

          {/* Seat Legend */}
          <div className="seat-legend-row">
            <div className="legend-item">
              <span className="legend-sample available-sample"></span>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <span className="legend-sample female-sample"></span>
              <span>For Female</span>
            </div>
            <div className="legend-item">
              <span className="legend-sample male-sample"></span>
              <span>For Male</span>
            </div>
            <div className="legend-item">
              <span className="legend-sample female-booked-sample"></span>
              <span>Female booked</span>
            </div>
            <div className="legend-item">
              <span className="legend-sample booked-sample"></span>
              <span>Booked</span>
            </div>
          </div>
        </div>

        {/* Right Side: Boarding & Dropping Points Panel */}
        <div className="points-selection-panel">
          <div className="points-tabs-header">
            <button
              type="button"
              className={`points-tab-btn ${
                activePointTab === "boarding" ? "active" : ""
              }`}
              onClick={() => setActivePointTab("boarding")}
            >
              <FaCheck className="tab-check-icon" /> Boarding Points
            </button>

            <button
              type="button"
              className={`points-tab-btn ${
                activePointTab === "dropping" ? "active" : ""
              }`}
              onClick={() => setActivePointTab("dropping")}
            >
              <FaCheck className="tab-check-icon" /> Dropping Points
            </button>
          </div>

          <div className="points-list-scrollable">
            {activePointTab === "boarding" ? (
              <div className="points-radio-list">
                {boardingPoints.map((bp) => {
                  const isChecked = selectedBoarding.id === bp.id;
                  return (
                    <label
                      key={bp.id}
                      className={`point-radio-card ${isChecked ? "checked" : ""}`}
                      onClick={() => setSelectedBoarding(bp)}
                    >
                      <div className="radio-circle-wrapper">
                        <input
                          type="radio"
                          name="boardingPoint"
                          checked={isChecked}
                          onChange={() => setSelectedBoarding(bp)}
                        />
                        <span className="custom-radio-dot"></span>
                      </div>
                      <div className="point-card-meta">
                        <div className="point-card-title">{bp.location}</div>
                        <div className="point-card-sub">{bp.contact}</div>
                      </div>
                      <div className="point-card-time">{bp.time}</div>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="points-radio-list">
                {droppingPoints.map((dp) => {
                  const isChecked = selectedDropping.id === dp.id;
                  return (
                    <label
                      key={dp.id}
                      className={`point-radio-card ${isChecked ? "checked" : ""}`}
                      onClick={() => setSelectedDropping(dp)}
                    >
                      <div className="radio-circle-wrapper">
                        <input
                          type="radio"
                          name="droppingPoint"
                          checked={isChecked}
                          onChange={() => setSelectedDropping(dp)}
                        />
                        <span className="custom-radio-dot"></span>
                      </div>
                      <div className="point-card-meta">
                        <div className="point-card-title">{dp.location}</div>
                        <div className="point-card-sub">{dp.contact}</div>
                      </div>
                      <div className="point-card-time">{dp.time}</div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Summary Bar */}
          <div className="points-bottom-summary-box">
            <div className="summary-details-row">
              <div className="selected-seats-info">
                <span className="summary-label">Selected Seats:</span>
                <strong className="summary-value">
                  {selectedSeats.length > 0
                    ? selectedSeats.map((s) => s.number).join(", ")
                    : "None selected"}
                </strong>
              </div>
              <div className="total-fare-info">
                <span className="summary-label">Total Fare:</span>
                <strong className="total-fare-value">₹ {totalFare}</strong>
              </div>
            </div>

            <button
              type="button"
              className={`proceed-booking-btn ${
                selectedSeats.length === 0 ? "disabled" : ""
              }`}
              onClick={handleProceedBooking}
              disabled={selectedSeats.length === 0}
            >
              Continue Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InCardSeatSelection;
