import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaExchangeAlt, FaCalendarAlt, FaSearch } from "react-icons/fa";
import CustomCitySelect from "./CustomCitySelect";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "../css/SearchResults.css";

const BusSearchHeader = ({ currentFrom, currentTo, currentDate, onSearchUpdate }) => {
  // Helper date
  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [from, setFrom] = useState(() => currentFrom || (auth.currentUser ? "Sangli" : ""));
  const [to, setTo] = useState(() => currentTo || (auth.currentUser ? "Goa" : ""));
  const [date, setDate] = useState(currentDate || getFormattedDate(0));
  const [activeDateTab, setActiveDateTab] = useState(
    currentDate === getFormattedDate(1) ? "tomorrow" : "today"
  );
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (currentFrom) setFrom(currentFrom);
        else setFrom((prev) => prev || "Sangli");

        if (currentTo) setTo(currentTo);
        else setTo((prev) => prev || "Goa");
      } else {
        if (!currentFrom) setFrom("");
        if (!currentTo) setTo("");
      }
    });

    if (currentDate) setDate(currentDate);

    return () => unsubscribe();
  }, [currentFrom, currentTo, currentDate]);

  // Instant update on Origin city change
  const handleFromChange = (newFrom) => {
    setFrom(newFrom);
    if (newFrom && to && newFrom !== to) {
      onSearchUpdate(newFrom, to, date);
    }
  };

  // Instant update on Destination city change
  const handleToChange = (newTo) => {
    setTo(newTo);
    if (from && newTo && from !== newTo) {
      onSearchUpdate(from, newTo, date);
    }
  };

  // Instant update on Swap
  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 300);
    const newFrom = to;
    const newTo = from;
    setFrom(newFrom);
    setTo(newTo);
    if (newFrom && newTo && newFrom !== newTo) {
      onSearchUpdate(newFrom, newTo, date);
    }
  };

  // Instant update on Date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (newDate === getFormattedDate(0)) {
      setActiveDateTab("today");
    } else if (newDate === getFormattedDate(1)) {
      setActiveDateTab("tomorrow");
    } else {
      setActiveDateTab("custom");
    }
    if (from && to && from !== to) {
      onSearchUpdate(from, to, newDate);
    }
  };

  const handleQuickDate = (type) => {
    let d = getFormattedDate(0);
    if (type === "today") {
      d = getFormattedDate(0);
      setActiveDateTab("today");
    } else if (type === "tomorrow") {
      d = getFormattedDate(1);
      setActiveDateTab("tomorrow");
    }
    setDate(d);
    if (from && to && from !== to) {
      onSearchUpdate(from, to, d);
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!from || !to || !date || from === to) return;
    onSearchUpdate(from, to, date);
  };

  return (
    <div className="search-results-top-bar">
      <div className="search-results-top-container">
        <form onSubmit={handleSubmit} className="top-search-form">
          {/* Leaving From */}
          <div className="top-search-field">
            <CustomCitySelect
              value={from}
              onChange={handleFromChange}
              placeholder="Leaving From"
              icon={<span style={{ color: "#64748b", fontSize: "12px", fontWeight: "bold" }}>▲</span>}
            />
          </div>

          {/* Swap Button */}
          <button
            type="button"
            className={`top-swap-btn ${isSwapping ? "rotated" : ""}`}
            onClick={handleSwap}
            title="Swap Cities"
          >
            <FaExchangeAlt />
          </button>

          {/* Going To */}
          <div className="top-search-field">
            <CustomCitySelect
              value={to}
              onChange={handleToChange}
              placeholder="Going To"
              icon={<FaMapMarkerAlt style={{ color: "#dc2626", fontSize: "16px" }} />}
            />
          </div>

          {/* Departure Date */}
          <div className="top-search-field date-field">
            <span className="field-label-mini">Departure</span>
            <div className="date-input-row">
              <FaCalendarAlt className="field-calendar-icon" />
              <input
                type="date"
                value={date}
                min={getFormattedDate(0)}
                onChange={(e) => handleDateChange(e.target.value)}
                className="top-date-input"
              />
            </div>
          </div>

          {/* Quick Date Pills */}
          <div className="top-quick-pills">
            <button
              type="button"
              className={`top-quick-btn ${activeDateTab === "today" ? "active" : ""}`}
              onClick={() => handleQuickDate("today")}
            >
              Today
            </button>
            <button
              type="button"
              className={`top-quick-btn ${activeDateTab === "tomorrow" ? "active" : ""}`}
              onClick={() => handleQuickDate("tomorrow")}
            >
              Tomorrow
            </button>
          </div>

          {/* Search Button */}
          <button type="submit" className="top-search-submit-btn">
            <span>Search</span>
            <span className="arrow-right-chevron">&gt;</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default BusSearchHeader;
