import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaMapMarkerAlt, FaSearch, FaCheck, FaCity } from "react-icons/fa";
import "../css/CustomCitySelect.css";

const CustomCitySelect = ({
  value,
  onChange,
  placeholder = "Select City",
  icon = null,
  iconColor = "#dc2626",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const popularCities = ["Sangli", "Goa", "Pune", "Mumbai", "Kolhapur", "Satara", "Solapur"];
  const allCities = [
    "Sangli",
    "Goa",
    "Pune",
    "Mumbai",
    "Kolhapur",
    "Satara",
    "Solapur",
    "Bangalore",
    "Hyderabad",
    "Nashik",
    "Shirdi",
    "Nagpur",
    "Aurangabad",
    "Belgaum",
    "Ratnagiri",
  ];

  // Close when clicked outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredCities = allCities.filter((city) =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (city) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="custom-city-select-container" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`city-select-trigger-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="trigger-left">
          {icon ? (
            <span className="custom-trigger-icon">{icon}</span>
          ) : (
            <FaMapMarkerAlt className="custom-trigger-icon" style={{ color: iconColor }} />
          )}
          <span className={`selected-city-text ${!value ? "placeholder-text" : ""}`}>
            {value || placeholder}
          </span>
        </span>
        <FaChevronDown className={`trigger-chevron-icon ${isOpen ? "rotated" : ""}`} />
      </button>

      {/* Dropdown Popup Card */}
      {isOpen && (
        <div className="city-dropdown-popup-card">
          {/* Search Input Box */}
          <div className="dropdown-search-box">
            <FaSearch className="dropdown-search-icon" />
            <input
              type="text"
              placeholder="Type city name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="dropdown-search-input"
            />
          </div>

          {/* Quick Popular Chips */}
          {!searchTerm && (
            <div className="popular-cities-strip">
              <span className="popular-label">POPULAR:</span>
              <div className="popular-chips-list">
                {popularCities.map((city) => (
                  <button
                    key={`pop-${city}`}
                    type="button"
                    className={`pop-chip-btn ${value === city ? "active" : ""}`}
                    onClick={() => handleSelect(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cities List */}
          <div className="dropdown-cities-scroll-list">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => {
                const isSelected = value === city;
                return (
                  <div
                    key={city}
                    className={`city-option-item ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelect(city)}
                  >
                    <div className="city-option-left">
                      <FaCity className="city-list-icon" />
                      <span className="city-option-name">{city}</span>
                    </div>
                    {isSelected && <FaCheck className="city-check-icon" />}
                  </div>
                );
              })
            ) : (
              <div className="no-cities-found">
                <p>No city found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCitySelect;
