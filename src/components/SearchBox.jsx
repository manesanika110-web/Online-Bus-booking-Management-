import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaExchangeAlt, FaMapMarkerAlt, FaRocket, FaCalendarAlt, FaSearch } from "react-icons/fa";
import CustomCitySelect from "./CustomCitySelect";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./../css/SearchBox.css";

function SearchBox({ initialFrom = "", initialTo = "" }) {
  const navigate = useNavigate();

  // Format date helper: YYYY-MM-DD
  const getFormattedDate = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [from, setFrom] = useState(() => initialFrom || (auth.currentUser ? "Sangli" : ""));
  const [to, setTo] = useState(() => initialTo || (auth.currentUser ? "Pune" : ""));
  const [date, setDate] = useState(getFormattedDate(0));
  const [activeDateTab, setActiveDateTab] = useState("today");
  const [error, setError] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // User logged in: prefill defaults if empty
        if (initialFrom) setFrom(initialFrom);
        else setFrom((prev) => prev || "Sangli");

        if (initialTo) setTo(initialTo);
        else setTo((prev) => prev || "Pune");
      } else {
        // User logged out or no registered user logged in: clear city fields
        if (!initialFrom) setFrom("");
        if (!initialTo) setTo("");
      }
    });

    return () => unsubscribe();
  }, [initialFrom, initialTo]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (newDate === getFormattedDate(0)) {
      setActiveDateTab("today");
    } else if (newDate === getFormattedDate(1)) {
      setActiveDateTab("tomorrow");
    } else {
      setActiveDateTab("custom");
    }
  };

  const handleQuickDate = (type) => {
    if (type === "today") {
      setDate(getFormattedDate(0));
      setActiveDateTab("today");
    } else if (type === "tomorrow") {
      setDate(getFormattedDate(1));
      setActiveDateTab("tomorrow");
    }
  };

  const swapCities = () => {
    setIsSwapping(true);
    setTimeout(() => setIsSwapping(false), 350);
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();

    if (!from) {
      setError("Please select departure city (Leaving From).");
      return;
    }
    if (!to) {
      setError("Please select destination city (Going To).");
      return;
    }
    if (from === to) {
      setError("Leaving From and Going To cannot be the same city.");
      return;
    }
    if (!date) {
      setError("Please select your date of travel.");
      return;
    }

    setError("");

    navigate("/search", {
      state: {
        from,
        to,
        date,
      },
    });
  };

  return (
    <div className="searchbox-outer-container">
      <form className="search-pill-container" onSubmit={handleSearch}>
        {/* 1. Leaving From */}
        <div className="search-input-field">
          <CustomCitySelect
            value={from}
            onChange={(city) => {
              setFrom(city);
              setError("");
            }}
            placeholder="Leaving From"
            icon={<FaMapMarkerAlt style={{ color: "#dc2626", fontSize: "16px" }} />}
          />
        </div>

        {/* 2. Swap Button */}
        <button
          type="button"
          className={`search-swap-btn ${isSwapping ? "rotating" : ""}`}
          onClick={swapCities}
          title="Swap Cities"
          aria-label="Swap Cities"
        >
          <FaExchangeAlt />
        </button>

        {/* 3. Going To */}
        <div className="search-input-field">
          <CustomCitySelect
            value={to}
            onChange={(city) => {
              setTo(city);
              setError("");
            }}
            placeholder="Going To"
            icon={<FaRocket style={{ color: "#0284c7", fontSize: "15px" }} />}
          />
        </div>

        {/* 4. Date Picker */}
        <div className="search-input-field date-field">
          <div className="field-icon-wrapper calendar-icon">
            <FaCalendarAlt />
          </div>
          <div className="field-input-box date-input-wrapper">
            <input
              type="date"
              value={date}
              min={getFormattedDate(0)}
              onChange={(e) => {
                handleDateChange(e.target.value);
                setError("");
              }}
              className="date-native-input"
            />
          </div>
        </div>

        {/* 5. Quick Date Buttons (Today / Tomorrow) */}
        <div className="quick-date-pills">
          <button
            type="button"
            className={`quick-pill-btn ${activeDateTab === "today" ? "active" : ""}`}
            onClick={() => handleQuickDate("today")}
          >
            Today
          </button>
          <button
            type="button"
            className={`quick-pill-btn ${activeDateTab === "tomorrow" ? "active" : ""}`}
            onClick={() => handleQuickDate("tomorrow")}
          >
            Tomorrow
          </button>
        </div>

        {/* 6. Search Buses Button */}
        <button type="submit" className="search-buses-submit-btn">
          <FaSearch className="btn-search-icon" />
          <span>Search Buses</span>
        </button>
      </form>

      {error && <div className="search-error-toast">{error}</div>}
    </div>
  );
}

export default SearchBox;
