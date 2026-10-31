import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaHotel,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaSearch,
  FaStar,
  FaWifi,
  FaSwimmingPool,
  FaCoffee,
  FaTv,
  FaCheckCircle,
  FaShieldAlt,
  FaRupeeSign,
} from "react-icons/fa";
import { successAlert, errorAlert } from "../utils/alert";
import { auth } from "../firebase";
import { persistBooking } from "../utils/localData";
import "../css/Hotels.css";

const sampleHotels = [
  {
    id: "HTL101",
    name: "Royal Orchid Central",
    location: "Kalyani Nagar, Pune",
    city: "Pune",
    distance: "3.2 km from Swargate Bus Stand",
    rating: 4.8,
    reviews: 1240,
    price: 2850,
    originalPrice: 4200,
    image: "/images/photo-1566073771259-6a8506099945.jpg",
    amenities: ["Free High-Speed WiFi", "Complimentary Breakfast", "Swimming Pool", "AC Deluxe"],
    roomType: "Executive AC Suite",
  },
  {
    id: "HTL102",
    name: "Grand Vista Beach Resort",
    location: "Calangute Beach, North Goa",
    city: "Goa",
    distance: "1.5 km from Mapusa Bus Terminal",
    rating: 4.9,
    reviews: 2150,
    price: 3450,
    originalPrice: 5500,
    image: "/images/photo-1582719508461-905c673771fd.jpg",
    amenities: ["Beach View Balcony", "Free Breakfast", "Infinity Pool", "Spa & Bar"],
    roomType: "Sea-Facing Luxury Villa",
  },
  {
    id: "HTL103",
    name: "Hotel Sayaji Premium",
    location: "Kawala Naka, Kolhapur",
    city: "Kolhapur",
    distance: "800m from Central ST Stand",
    rating: 4.7,
    reviews: 980,
    price: 2400,
    originalPrice: 3600,
    image: "/images/photo-1542314831-068cd1dbfeeb.jpg",
    amenities: ["Free WiFi", "Multi-Cuisine Buffet", "Fitness Center", "Airport/Bus Shuttle"],
    roomType: "Premium King Room",
  },
  {
    id: "HTL104",
    name: "Citrus Hotel & Suites",
    location: "Station Road, Sangli",
    city: "Sangli",
    distance: "500m from Sangli ST Stand",
    rating: 4.6,
    reviews: 650,
    price: 1850,
    originalPrice: 2800,
    image: "/images/photo-1571896349842-33c89424de2d.jpg",
    amenities: ["Free WiFi", "24/7 Room Service", "Pure Veg Restaurant", "Free Parking"],
    roomType: "Deluxe AC Room",
  },
  {
    id: "HTL105",
    name: "Le Meridien Valley Resort",
    location: "Valley View Point, Mahabaleshwar",
    city: "Mahabaleshwar",
    distance: "2 km from Mahabaleshwar Bus Stand",
    rating: 4.9,
    reviews: 1890,
    price: 4200,
    originalPrice: 6500,
    image: "/images/photo-1520250497591-112f2f40a3f4.jpg",
    amenities: ["Hill View Balcony", "Heated Pool", "Breakfast & Dinner", "Campfire"],
    roomType: "Valley View Cottage",
  },
];

const Hotels = () => {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("Pune");
  const [checkInDate, setCheckInDate] = useState("2026-08-20");
  const [checkOutDate, setCheckOutDate] = useState("2026-08-22");
  const [guests, setGuests] = useState("2 Guests, 1 Room");
  const [bookingHotel, setBookingHotel] = useState(null);

  const filteredHotels = sampleHotels.filter(
    (h) => !destination || h.city.toLowerCase().includes(destination.toLowerCase()) || h.location.toLowerCase().includes(destination.toLowerCase())
  );

  const handleBookHotel = async (hotel) => {
    const user = auth?.currentUser;
    const uid = user?.uid || "";
    const userEmail = user?.email || "";

    const bookingId = "HTL" + Math.floor(100000 + Math.random() * 900000);
    const newHotelBooking = {
      bookingId,
      userId: uid,
      userEmail: userEmail,
      serviceType: "hotel",
      hotelName: hotel.name,
      roomType: hotel.roomType,
      city: hotel.city,
      location: hotel.location,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount: hotel.price * 2,
      status: "upcoming",
      bookingDate: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }),
      image: hotel.image,
      rating: hotel.rating,
    };

    const paymentId = "PAY_" + bookingId;
    let result;
    try {
      result = await persistBooking(newHotelBooking, "hotels", {
        transactionId: paymentId,
        paymentId,
        bookingId,
        passengerName: user?.displayName || "Customer",
        email: userEmail,
        amount: newHotelBooking.totalAmount,
        method: "Card",
        status: "Success",
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      await errorAlert(error.message || "Unable to save this hotel booking.");
      return;
    }

    if (!result.localSaved && !result.remoteSaved) {
      await errorAlert("Unable to save this hotel booking. Please try again.");
      return;
    }

    await successAlert(
      result.syncError
        ? "Booking saved on this device. Cloud sync is currently unavailable."
        : `Hotel room booked at ${hotel.name}!`,
    );
    navigate("/my-bookings", { state: { activeService: "hotels" } });
  };

  return (
    <div className="hotels-page-wrapper">
      <Navbar />

      {/* Hero Search Section */}
      <section className="hotels-hero-banner">
        <div className="hotels-hero-container">
          <span className="hotels-badge">
            <FaHotel /> VISTA HOTEL STAYS
          </span>
          <h1>Book Top Rated Hotels & Resorts</h1>
          <p>Find clean, comfortable and luxury hotels near bus stands and tourist hotspots</p>

          {/* Search Box */}
          <div className="hotels-search-card">
            <div className="search-field-group">
              <label>
                <FaMapMarkerAlt /> City or Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="hotel-native-select"
              >
                <option value="Pune">Pune, Maharashtra</option>
                <option value="Goa">Goa (North / South)</option>
                <option value="Kolhapur">Kolhapur, Maharashtra</option>
                <option value="Sangli">Sangli, Maharashtra</option>
                <option value="Mahabaleshwar">Mahabaleshwar</option>
                <option value="Mumbai">Mumbai, Maharashtra</option>
              </select>
            </div>

            <div className="search-field-group">
              <label>
                <FaCalendarAlt /> Check-In
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="hotel-date-input"
              />
            </div>

            <div className="search-field-group">
              <label>
                <FaCalendarAlt /> Check-Out
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="hotel-date-input"
              />
            </div>

            <div className="search-field-group">
              <label>
                <FaUserFriends /> Guests & Rooms
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="hotel-native-select"
              >
                <option value="1 Guest, 1 Room">1 Guest, 1 Room</option>
                <option value="2 Guests, 1 Room">2 Guests, 1 Room</option>
                <option value="3 Guests, 1 Room">3 Guests, 1 Room</option>
                <option value="4 Guests, 2 Rooms">4 Guests, 2 Rooms</option>
              </select>
            </div>

            <button type="button" className="hotel-search-submit-btn">
              <FaSearch /> Search Hotels
            </button>
          </div>
        </div>
      </section>

      {/* Hotel Listings */}
      <main className="hotels-main-content">
        <div className="hotels-list-container">
          <div className="list-header-row">
            <h2>
              Hotels in <strong>{destination}</strong> ({filteredHotels.length} Available)
            </h2>
            <span className="assured-filter-badge">
              <FaShieldAlt /> 100% Verified Stays
            </span>
          </div>

          <div className="hotel-cards-grid">
            {filteredHotels.map((hotel) => (
              <div key={hotel.id} className="hotel-item-card">
                <div className="hotel-img-wrapper">
                  <img src={hotel.image} alt={hotel.name} />
                  <div className="hotel-rating-badge">
                    <FaStar className="star-icon" /> {hotel.rating}
                  </div>
                </div>

                <div className="hotel-info-body">
                  <div className="hotel-title-section">
                    <h3>{hotel.name}</h3>
                    <p className="hotel-location-text">
                      <FaMapMarkerAlt /> {hotel.location} • <small>{hotel.distance}</small>
                    </p>
                    <span className="room-type-pill">{hotel.roomType}</span>
                  </div>

                  <div className="hotel-amenities-row">
                    {hotel.amenities.map((item, idx) => (
                      <span key={idx} className="amenity-tag">
                        <FaCheckCircle /> {item}
                      </span>
                    ))}
                  </div>

                  <div className="hotel-card-bottom-row">
                    <div className="hotel-pricing-block">
                      <span className="original-price">₹{hotel.originalPrice}</span>
                      <div className="current-price-wrap">
                        <strong className="current-price">₹{hotel.price}</strong>
                        <small>/ night</small>
                      </div>
                      <span className="taxes-note">+ ₹250 Taxes & Fees</span>
                    </div>

                    <button
                      type="button"
                      className="book-hotel-btn"
                      onClick={() => handleBookHotel(hotel)}
                    >
                      Book Room Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Hotels;
