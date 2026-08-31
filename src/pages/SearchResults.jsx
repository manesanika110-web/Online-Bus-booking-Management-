import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BusSearchHeader from "../components/BusSearchHeader";
import BusFilterSidebar from "../components/BusFilterSidebar";
import BusCardModern from "../components/BusCardModern";
import BusPhotoModal from "../components/BusPhotoModal";
import BusDetailsRightDrawer from "../components/BusDetailsRightDrawer";
import PassengerDetailsModal from "../components/PassengerDetailsModal";
import PaymentModal from "../components/PaymentModal";
import { getBusesForRoute } from "../data/busData";
import { FaBus, FaExclamationCircle } from "react-icons/fa";
import "../css/SearchResults.css";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();

  // Search parameters from navigation state or defaults
  const searchState = location.state || {};
  const [currentFrom, setCurrentFrom] = useState(searchState.from || "Sangli");
  const [currentTo, setCurrentTo] = useState(searchState.to || "Goa");
  const [currentDate, setCurrentDate] = useState(searchState.date || "");

  // Photo modal state
  const [selectedPhotoBus, setSelectedPhotoBus] = useState(null);

  // Right-side Bus Details Drawer state
  const [selectedBusDetails, setSelectedBusDetails] = useState(null);

  // Passenger Details In-Place Modal state
  const [passengerModalData, setPassengerModalData] = useState(null);

  // Payment Modal state
  const [paymentModalData, setPaymentModalData] = useState(null);

  // Sorting state: 'cheapest' | 'earliest' | 'fastest' | 'rating'
  const [sortBy, setSortBy] = useState("cheapest");

  // Filter state
  const [filters, setFilters] = useState({
    isAC: false,
    isSleeper: false,
    hasTracking: false,
    isNewBus: false,
    hasOffers: false,
    maxPrice: 6499,
    timeSlots: [], // 'morning', 'afternoon', 'evening', 'night'
    operators: [],
    boardingPoints: [],
    droppingPoints: [],
  });

  // Update route data when location state changes
  useEffect(() => {
    if (location.state?.from) setCurrentFrom(location.state.from);
    if (location.state?.to) setCurrentTo(location.state.to);
    if (location.state?.date) setCurrentDate(location.state.date);
  }, [location.state]);

  // Fetch all base buses for the current route
  const baseBuses = useMemo(() => {
    return getBusesForRoute(currentFrom, currentTo);
  }, [currentFrom, currentTo]);

  // Extract unique operators, boarding points, dropping points, and max price for sidebar
  const { operatorsList, boardingList, droppingList, maxAvailablePrice } = useMemo(() => {
    const ops = new Set();
    const boardings = new Set();
    const droppings = new Set();
    let maxP = 2500;

    baseBuses.forEach((b) => {
      if (b.name) ops.add(b.name);
      if (b.price && b.price > maxP) maxP = b.price;

      if (Array.isArray(b.boardingPoints)) {
        b.boardingPoints.forEach((bp) => {
          if (bp.location) boardings.add(bp.location);
        });
      }
      if (Array.isArray(b.droppingPoints)) {
        b.droppingPoints.forEach((dp) => {
          if (dp.location) droppings.add(dp.location);
        });
      }
    });

    return {
      operatorsList: Array.from(ops),
      boardingList: Array.from(boardings),
      droppingList: Array.from(droppings),
      maxAvailablePrice: maxP,
    };
  }, [baseBuses]);

  // Filter and Sort Buses
  const filteredAndSortedBuses = useMemo(() => {
    let result = [...baseBuses];

    // 1. Filter: AC
    if (filters.isAC) {
      result = result.filter(
        (b) =>
          b.category === "AC" ||
          b.type?.toLowerCase().includes("ac") ||
          b.name?.toLowerCase().includes("ac")
      );
    }

    // 2. Filter: Sleeper
    if (filters.isSleeper) {
      result = result.filter(
        (b) =>
          b.seatType === "Sleeper" ||
          b.type?.toLowerCase().includes("sleeper")
      );
    }

    // 3. Filter: Bus Tracking
    if (filters.hasTracking) {
      result = result.filter((b) => b.hasLiveTracking);
    }

    // 4. Filter: New Buses
    if (filters.isNewBus) {
      result = result.filter((b) => b.isNewBus);
    }

    // 5. Filter: Offers
    if (filters.hasOffers) {
      result = result.filter((b) => b.hasOffers || b.discount > 0);
    }

    // 6. Filter: Price Range
    if (filters.maxPrice) {
      result = result.filter((b) => b.price <= filters.maxPrice);
    }

    // 7. Filter: Departure Time Slots
    if (filters.timeSlots && filters.timeSlots.length > 0) {
      result = result.filter((b) => {
        // extract departure hour in 24h
        let hour = 8;
        if (b.departureTime24) {
          hour = parseInt(b.departureTime24.split(":")[0], 10);
        } else if (b.departure) {
          const parts = b.departure.split(" ");
          const timeParts = parts[0].split(":");
          hour = parseInt(timeParts[0], 10);
          if (parts[1]?.toUpperCase() === "PM" && hour < 12) hour += 12;
          if (parts[1]?.toUpperCase() === "AM" && hour === 12) hour = 0;
        }

        return filters.timeSlots.some((slot) => {
          if (slot === "morning") return hour < 10;
          if (slot === "afternoon") return hour >= 10 && hour < 17;
          if (slot === "evening") return hour >= 17 && hour < 23;
          if (slot === "night") return hour >= 23 || hour < 5;
          return false;
        });
      });
    }

    // 8. Filter: Operators
    if (filters.operators && filters.operators.length > 0) {
      result = result.filter((b) => filters.operators.includes(b.name));
    }

    // 9. Filter: Boarding Points
    if (filters.boardingPoints && filters.boardingPoints.length > 0) {
      result = result.filter((b) =>
        b.boardingPoints?.some((bp) => filters.boardingPoints.includes(bp.location))
      );
    }

    // 10. Filter: Dropping Points
    if (filters.droppingPoints && filters.droppingPoints.length > 0) {
      result = result.filter((b) =>
        b.droppingPoints?.some((dp) => filters.droppingPoints.includes(dp.location))
      );
    }

    // Sorting Logic
    if (sortBy === "cheapest") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "earliest") {
      result.sort((a, b) => {
        const hA = parseInt((a.departureTime24 || "08:00").split(":")[0], 10);
        const hB = parseInt((b.departureTime24 || "08:00").split(":")[0], 10);
        return hA - hB;
      });
    } else if (sortBy === "rating") {
      result.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === "fastest") {
      result.sort((a, b) => {
        const durA = parseInt(a.duration || "5", 10);
        const durB = parseInt(b.duration || "5", 10);
        return durA - durB;
      });
    }

    return result;
  }, [baseBuses, filters, sortBy]);

  // Handle onSearchUpdate from top bar
  const handleSearchUpdate = (newFrom, newTo, newDate) => {
    setCurrentFrom(newFrom);
    setCurrentTo(newTo);
    setCurrentDate(newDate);
    // Reset filters
    handleClearAllFilters();
  };

  const handleClearAllFilters = () => {
    setFilters({
      isAC: false,
      isSleeper: false,
      hasTracking: false,
      isNewBus: false,
      hasOffers: false,
      maxPrice: maxAvailablePrice,
      timeSlots: [],
      operators: [],
      boardingPoints: [],
      droppingPoints: [],
    });
  };

  return (
    <div className="search-results-page-wrapper">
      {/* 1. Global Navigation Bar */}
      <Navbar />

      {/* 2. Top Search Modification Bar */}
      <BusSearchHeader
        currentFrom={currentFrom}
        currentTo={currentTo}
        currentDate={currentDate}
        onSearchUpdate={handleSearchUpdate}
      />

      {/* 3. Main Split Layout */}
      <main className="search-results-main-layout">
        {/* Left Filter Sidebar */}
        <BusFilterSidebar
          filters={filters}
          onFilterChange={setFilters}
          onClearAll={handleClearAllFilters}
          maxAvailablePrice={maxAvailablePrice}
          operatorsList={operatorsList}
          boardingList={boardingList}
          droppingList={droppingList}
        />

        {/* Right Bus Results Area */}
        <section className="search-results-right-area">
          {/* Top Sort / Results Summary Bar */}
          <div className="results-summary-sort-bar">
            <div className="summary-buses-found">
              <h2>
                Showing <span>{filteredAndSortedBuses.length} Buses</span> from {currentFrom} to {currentTo}
              </h2>
            </div>

            <div className="sort-options-group">
              <span className="sort-label-text">SORT BY:</span>
              <button
                className={`sort-pill-btn ${sortBy === "cheapest" ? "active" : ""}`}
                onClick={() => setSortBy("cheapest")}
              >
                Cheapest
              </button>
              <button
                className={`sort-pill-btn ${sortBy === "earliest" ? "active" : ""}`}
                onClick={() => setSortBy("earliest")}
              >
                Earliest
              </button>
              <button
                className={`sort-pill-btn ${sortBy === "fastest" ? "active" : ""}`}
                onClick={() => setSortBy("fastest")}
              >
                Fastest
              </button>
              <button
                className={`sort-pill-btn ${sortBy === "rating" ? "active" : ""}`}
                onClick={() => setSortBy("rating")}
              >
                Top Rated
              </button>
            </div>
          </div>

          {/* Bus Cards List */}
          {filteredAndSortedBuses.length > 0 ? (
            filteredAndSortedBuses.map((bus) => (
              <BusCardModern
                key={bus.id}
                bus={bus}
                travelDate={currentDate}
                onOpenPhotos={(b) => setSelectedPhotoBus(b)}
                onOpenBusDetails={(b) => setSelectedBusDetails(b)}
                onOpenPassengerDetails={(data) => setPassengerModalData(data)}
              />
            ))
          ) : (
            <div className="no-buses-found-card">
              <FaExclamationCircle className="no-bus-icon" />
              <h3>No Buses Found Matching Your Filters</h3>
              <p>
                Try clearing some filters or selecting a different price range/operator to see more available buses.
              </p>
              <button className="reset-filters-btn" onClick={handleClearAllFilters}>
                Clear All Filters
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 4. Bus Photo Gallery Modal */}
      <BusPhotoModal
        isOpen={Boolean(selectedPhotoBus)}
        bus={selectedPhotoBus}
        onClose={() => setSelectedPhotoBus(null)}
      />

      {/* 5. Right-Side Half Page Bus Details Drawer (Matching Image 2) */}
      <BusDetailsRightDrawer
        isOpen={Boolean(selectedBusDetails)}
        bus={selectedBusDetails}
        onClose={() => setSelectedBusDetails(null)}
      />

      {/* 6. In-Place Passenger Details Modal with Frosted Background Blur */}
      <PassengerDetailsModal
        isOpen={Boolean(passengerModalData)}
        bookingData={passengerModalData}
        onClose={() => setPassengerModalData(null)}
        onProceedToPayment={(payload) => {
          setPassengerModalData(null);
          setPaymentModalData(payload);
        }}
      />

      {/* 7. In-Place Red-Themed Payment Modal with Background Blur */}
      <PaymentModal
        isOpen={Boolean(paymentModalData)}
        paymentData={paymentModalData}
        onClose={() => setPaymentModalData(null)}
        onBack={() => {
          const prev = paymentModalData;
          setPaymentModalData(null);
          setPassengerModalData(prev);
        }}
      />

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}

export default SearchResults;
