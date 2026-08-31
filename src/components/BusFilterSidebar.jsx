import React from "react";
import {
  FaSnowflake,
  FaBed,
  FaMapMarkerAlt,
  FaBus,
  FaPercent,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaSlidersH,
} from "react-icons/fa";
import "../css/SearchResults.css";

const BusFilterSidebar = ({
  filters,
  onFilterChange,
  onClearAll,
  maxAvailablePrice = 6499,
  operatorsList = [],
  boardingList = [],
  droppingList = [],
}) => {
  const handleTypeToggle = (typeKey) => {
    onFilterChange({
      ...filters,
      [typeKey]: !filters[typeKey],
    });
  };

  const handlePriceChange = (e) => {
    onFilterChange({
      ...filters,
      maxPrice: Number(e.target.value),
    });
  };

  const handleTimeSlotToggle = (slot) => {
    const current = filters.timeSlots || [];
    const updated = current.includes(slot)
      ? current.filter((s) => s !== slot)
      : [...current, slot];
    onFilterChange({
      ...filters,
      timeSlots: updated,
    });
  };

  const handleOperatorToggle = (operator) => {
    const current = filters.operators || [];
    const updated = current.includes(operator)
      ? current.filter((op) => op !== operator)
      : [...current, operator];
    onFilterChange({
      ...filters,
      operators: updated,
    });
  };

  const handleBoardingToggle = (point) => {
    const current = filters.boardingPoints || [];
    const updated = current.includes(point)
      ? current.filter((p) => p !== point)
      : [...current, point];
    onFilterChange({
      ...filters,
      boardingPoints: updated,
    });
  };

  const handleDroppingToggle = (point) => {
    const current = filters.droppingPoints || [];
    const updated = current.includes(point)
      ? current.filter((p) => p !== point)
      : [...current, point];
    onFilterChange({
      ...filters,
      droppingPoints: updated,
    });
  };

  return (
    <aside className="bus-filter-sidebar">
      {/* Sidebar Header */}
      <div className="filter-header-row">
        <div className="filter-title-box">
          <FaSlidersH className="filter-icon" />
          <h3>Filters</h3>
        </div>
        <button className="clear-all-link-btn" onClick={onClearAll}>
          Clear All
        </button>
      </div>

      {/* 1. Bus Type Grid Buttons */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">Bus Type</h4>
        <div className="bus-type-buttons-grid">
          {/* AC */}
          <button
            type="button"
            className={`type-filter-card ${filters.isAC ? "selected" : ""}`}
            onClick={() => handleTypeToggle("isAC")}
          >
            <FaSnowflake className="type-card-icon" />
            <span>AC</span>
          </button>

          {/* Sleeper */}
          <button
            type="button"
            className={`type-filter-card ${filters.isSleeper ? "selected" : ""}`}
            onClick={() => handleTypeToggle("isSleeper")}
          >
            <FaBed className="type-card-icon" />
            <span>Sleeper</span>
          </button>

          {/* Bus Track */}
          <button
            type="button"
            className={`type-filter-card ${filters.hasTracking ? "selected" : ""}`}
            onClick={() => handleTypeToggle("hasTracking")}
          >
            <FaMapMarkerAlt className="type-card-icon" />
            <span>Bus Track</span>
          </button>

          {/* New Buses */}
          <button
            type="button"
            className={`type-filter-card ${filters.isNewBus ? "selected" : ""}`}
            onClick={() => handleTypeToggle("isNewBus")}
          >
            <FaBus className="type-card-icon" />
            <span>New Buses</span>
          </button>

          {/* Offers */}
          <button
            type="button"
            className={`type-filter-card ${filters.hasOffers ? "selected" : ""}`}
            onClick={() => handleTypeToggle("hasOffers")}
          >
            <FaPercent className="type-card-icon" />
            <span>Offers</span>
          </button>
        </div>
      </div>

      <div className="filter-divider"></div>

      {/* 2. Price Range Slider */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">Price Range</h4>
        <div className="price-slider-wrapper">
          <input
            type="range"
            min="400"
            max={maxAvailablePrice > 3000 ? maxAvailablePrice : 6499}
            step="50"
            value={filters.maxPrice || maxAvailablePrice}
            onChange={handlePriceChange}
            className="price-range-slider"
          />
          <div className="price-range-labels">
            <span className="price-min">₹550</span>
            <span className="price-current">
              Up to <strong>₹{filters.maxPrice || maxAvailablePrice}</strong>
            </span>
            <span className="price-max">₹{maxAvailablePrice > 3000 ? maxAvailablePrice : 6499}</span>
          </div>
        </div>
      </div>

      <div className="filter-divider"></div>

      {/* 3. Departure Time Slots */}
      <div className="filter-group-block">
        <h4 className="filter-group-title">Departure Time</h4>
        <div className="time-slots-grid">
          <button
            type="button"
            className={`time-slot-pill ${
              filters.timeSlots?.includes("morning") ? "active" : ""
            }`}
            onClick={() => handleTimeSlotToggle("morning")}
          >
            <FaSun className="slot-icon morning" />
            <span>Before 10 AM</span>
          </button>

          <button
            type="button"
            className={`time-slot-pill ${
              filters.timeSlots?.includes("afternoon") ? "active" : ""
            }`}
            onClick={() => handleTimeSlotToggle("afternoon")}
          >
            <FaCloudSun className="slot-icon afternoon" />
            <span>10 AM - 5 PM</span>
          </button>

          <button
            type="button"
            className={`time-slot-pill ${
              filters.timeSlots?.includes("evening") ? "active" : ""
            }`}
            onClick={() => handleTimeSlotToggle("evening")}
          >
            <FaCloudSun className="slot-icon evening" />
            <span>5 PM - 11 PM</span>
          </button>

          <button
            type="button"
            className={`time-slot-pill ${
              filters.timeSlots?.includes("night") ? "active" : ""
            }`}
            onClick={() => handleTimeSlotToggle("night")}
          >
            <FaMoon className="slot-icon night" />
            <span>After 11 PM</span>
          </button>
        </div>
      </div>

      {/* 4. Bus Operators Filter */}
      {operatorsList.length > 0 && (
        <>
          <div className="filter-divider"></div>
          <div className="filter-group-block">
            <h4 className="filter-group-title">Bus Operators</h4>
            <div className="checkboxes-scroll-list">
              {operatorsList.map((op) => (
                <label key={op} className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.operators?.includes(op) || false}
                    onChange={() => handleOperatorToggle(op)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label-text">{op}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 5. Boarding Points Filter */}
      {boardingList.length > 0 && (
        <>
          <div className="filter-divider"></div>
          <div className="filter-group-block">
            <h4 className="filter-group-title">Boarding Points</h4>
            <div className="checkboxes-scroll-list">
              {boardingList.map((point) => (
                <label key={point} className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.boardingPoints?.includes(point) || false}
                    onChange={() => handleBoardingToggle(point)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label-text">{point}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 6. Dropping Points Filter */}
      {droppingList.length > 0 && (
        <>
          <div className="filter-divider"></div>
          <div className="filter-group-block">
            <h4 className="filter-group-title">Dropping Points</h4>
            <div className="checkboxes-scroll-list">
              {droppingList.map((point) => (
                <label key={point} className="filter-checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.droppingPoints?.includes(point) || false}
                    onChange={() => handleDroppingToggle(point)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label-text">{point}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default BusFilterSidebar;
