import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBus, FaArrowRight, FaClock } from "react-icons/fa";
import puneKolhapurImg from "../assets/pune_kolhapur_bus.jpg";
import authBusHeroImg from "../assets/auth_bus_hero.jpg";
import "../css/HomeSections.css";

const PopularRoutes = () => {
  const navigate = useNavigate();

  const routes = [
    {
      id: 1,
      from: "Pune",
      to: "Mumbai",
      price: 450,
      duration: "3h 30m",
      busesCount: "25+ Daily Buses",
      image: authBusHeroImg,
    },
    {
      id: 2,
      from: "Sangli",
      to: "Pune",
      price: 550,
      duration: "5h 30m",
      busesCount: "18+ Daily Buses",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 3,
      from: "Kolhapur",
      to: "Mumbai",
      price: 1200,
      duration: "8h 00m",
      busesCount: "14+ Daily Buses",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 4,
      from: "Satara",
      to: "Solapur",
      price: 720,
      duration: "5h 30m",
      busesCount: "10+ Daily Buses",
      image: "https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: 5,
      from: "Pune",
      to: "Kolhapur",
      price: 750,
      duration: "4h 30m",
      busesCount: "20+ Daily Buses",
      image: puneKolhapurImg,
    },
    {
      id: 6,
      from: "Kolhapur",
      to: "Pune",
      price: 700,
      duration: "4h 30m",
      busesCount: "22+ Daily Buses",
      image: puneKolhapurImg,
    },
  ];

  const handleBookRoute = (from, to) => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    navigate("/search", {
      state: {
        from,
        to,
        date: formattedDate,
      },
    });
  };

  return (
    <section className="popular-routes-section">
      <div className="section-header-box">
        <span className="section-sub-tag">MOST TRAVELLED</span>
        <h2 className="section-title">Popular Bus Routes Across India</h2>
        <p className="section-description">
          Find top rated luxury AC & Sleeper buses running frequently between major cities.
        </p>
      </div>

      <div className="routes-cards-grid">
        {routes.map((route) => (
          <div key={route.id} className="route-item-card">
            <div className="route-card-image-box">
              <img
                src={route.image}
                alt={`${route.from} to ${route.to}`}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = puneKolhapurImg;
                }}
              />
              <div className="route-card-badge">
                <FaClock /> {route.duration}
              </div>
            </div>

            <div className="route-card-info">
              <div className="route-cities-row">
                <span className="from-city">{route.from}</span>
                <FaArrowRight className="route-arrow-icon" />
                <span className="to-city">{route.to}</span>
              </div>

              <div className="route-meta-row">
                <span className="bus-count-text">
                  <FaBus /> {route.busesCount}
                </span>
                <span className="starting-price">
                  Starts from <strong>₹{route.price}</strong>
                </span>
              </div>

              <button
                className="route-book-btn"
                onClick={() => handleBookRoute(route.from, route.to)}
              >
                Search & Book Buses
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularRoutes;
