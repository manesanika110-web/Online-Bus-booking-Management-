import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TrackTicketModal from "../components/TrackTicketModal";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  FaSearch,
  FaBus,
  FaHotel,
  FaTrain,
  FaPlane,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTicketAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaPrint,
  FaDownload,
  FaBan,
  FaTrashAlt,
  FaArrowRight,
  FaUser,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUserFriends,
  FaSuitcase,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { successAlert } from "../utils/alert";
import "../css/MyBookings.css";

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Service Type Switcher: 'buses' | 'hotels' | 'trains' | 'flights'
  const [activeService, setActiveService] = useState(
    location.state?.activeService || "buses"
  );

  // Status Filter: 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [activeStatusTab, setActiveStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [busBookings, setBusBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [trainBookings, setTrainBookings] = useState([]);
  const [flightBookings, setFlightBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [trackPnr, setTrackPnr] = useState(null);
  const [cancelModalItem, setCancelModalItem] = useState(null);

  // Load all bookings strictly for current authenticated user
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      const uid = currentUser?.uid;
      const userEmail = currentUser?.email?.toLowerCase().trim();

      if (!currentUser) {
        setBusBookings([]);
        setHotelBookings([]);
        setTrainBookings([]);
        setFlightBookings([]);
        setLoading(false);
        return;
      }

      // 1. Buses
      let userBuses = [];
      const userBusKey = `bookings_${uid}`;
      const savedUserBuses = JSON.parse(localStorage.getItem(userBusKey));

      if (savedUserBuses && Array.isArray(savedUserBuses)) {
        userBuses = savedUserBuses;
      } else {
        const genericBuses = JSON.parse(localStorage.getItem("bookings")) || [];
        userBuses = genericBuses.filter(
          (b) =>
            b.userId === uid ||
            (userEmail && b.passenger?.email?.toLowerCase().trim() === userEmail) ||
            (userEmail && b.userEmail?.toLowerCase().trim() === userEmail)
        );
      }

      if (db && uid) {
        try {
          const querySnapshot = await getDocs(
            collection(db, "users", uid, "bookings")
          );
          const firestoreBuses = [];
          querySnapshot.forEach((docSnap) => {
            firestoreBuses.push({ ...docSnap.data(), bookingId: docSnap.id });
          });
          if (firestoreBuses.length > 0) {
            userBuses = firestoreBuses;
          }
        } catch (e) {
          console.log("Firestore bus bookings fetch:", e);
        }
      }
      setBusBookings(userBuses);

      // 2. Hotels
      let userHotels = [];
      const userHotelKey = `hotelBookings_${uid}`;
      const savedUserHotels = JSON.parse(localStorage.getItem(userHotelKey));
      if (savedUserHotels && Array.isArray(savedUserHotels)) {
        userHotels = savedUserHotels;
      } else {
        const genericHotels = JSON.parse(localStorage.getItem("hotelBookings")) || [];
        userHotels = genericHotels.filter(
          (h) => h.userId === uid || (userEmail && h.userEmail === userEmail)
        );
      }
      if (db && uid) {
        try {
          const hotelSnap = await getDocs(
            collection(db, "users", uid, "hotelBookings")
          );
          const firestoreHotels = [];
          hotelSnap.forEach((docSnap) => {
            firestoreHotels.push({ ...docSnap.data(), bookingId: docSnap.id });
          });
          if (firestoreHotels.length > 0) userHotels = firestoreHotels;
        } catch (e) {
          console.log("Firestore hotel bookings fetch:", e);
        }
      }
      setHotelBookings(userHotels);

      // 3. Trains
      let userTrains = [];
      const userTrainKey = `trainBookings_${uid}`;
      const savedUserTrains = JSON.parse(localStorage.getItem(userTrainKey));
      if (savedUserTrains && Array.isArray(savedUserTrains)) {
        userTrains = savedUserTrains;
      } else {
        const genericTrains = JSON.parse(localStorage.getItem("trainBookings")) || [];
        userTrains = genericTrains.filter(
          (t) => t.userId === uid || (userEmail && t.userEmail === userEmail)
        );
      }
      if (db && uid) {
        try {
          const trainSnap = await getDocs(
            collection(db, "users", uid, "trainBookings")
          );
          const firestoreTrains = [];
          trainSnap.forEach((docSnap) => {
            firestoreTrains.push({ ...docSnap.data(), bookingId: docSnap.id });
          });
          if (firestoreTrains.length > 0) userTrains = firestoreTrains;
        } catch (e) {
          console.log("Firestore train bookings fetch:", e);
        }
      }
      setTrainBookings(userTrains);

      // 4. Flights
      let userFlights = [];
      const userFlightKey = `flightBookings_${uid}`;
      const savedUserFlights = JSON.parse(localStorage.getItem(userFlightKey));
      if (savedUserFlights && Array.isArray(savedUserFlights)) {
        userFlights = savedUserFlights;
      } else {
        const genericFlights = JSON.parse(localStorage.getItem("flightBookings")) || [];
        userFlights = genericFlights.filter(
          (f) => f.userId === uid || (userEmail && f.userEmail === userEmail)
        );
      }
      if (db && uid) {
        try {
          const flightSnap = await getDocs(
            collection(db, "users", uid, "flightBookings")
          );
          const firestoreFlights = [];
          flightSnap.forEach((docSnap) => {
            firestoreFlights.push({ ...docSnap.data(), bookingId: docSnap.id });
          });
          if (firestoreFlights.length > 0) userFlights = firestoreFlights;
        } catch (e) {
          console.log("Firestore flight bookings fetch:", e);
        }
      }
      setFlightBookings(userFlights);

      setLoading(false);
    };

    loadUserData();
    window.addEventListener("focus", loadUserData);
    return () => window.removeEventListener("focus", loadUserData);
  }, []);

  // Filter Logic for Buses
  const getFilteredBusBookings = () => {
    return busBookings.filter((b) => {
      const status = (b.status || "upcoming").toLowerCase();

      let matchesTab = false;
      if (activeStatusTab === "all") {
        matchesTab = status !== "cancelled";
      } else {
        matchesTab = status === activeStatusTab;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.bookingId?.toLowerCase().includes(q) ||
        b.pnr?.toLowerCase().includes(q) ||
        b.passenger?.name?.toLowerCase().includes(q) ||
        b.bus?.name?.toLowerCase().includes(q) ||
        b.bus?.from?.toLowerCase().includes(q) ||
        b.bus?.to?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  };

  // Filter Logic for other services
  const getFilteredList = (list) => {
    return list.filter((item) => {
      const status = (item.status || "upcoming").toLowerCase();
      let matchesTab = false;
      if (activeStatusTab === "all") {
        matchesTab = status !== "cancelled";
      } else {
        matchesTab = status === activeStatusTab;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.bookingId?.toLowerCase().includes(q) ||
        item.pnr?.toLowerCase().includes(q) ||
        item.hotelName?.toLowerCase().includes(q) ||
        item.trainName?.toLowerCase().includes(q) ||
        item.airline?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.from?.toLowerCase().includes(q) ||
        item.to?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  };

  // Tab counts
  const getServiceTabCount = (serviceType, tabKey) => {
    let currentList = [];
    if (serviceType === "buses") currentList = busBookings;
    else if (serviceType === "hotels") currentList = hotelBookings;
    else if (serviceType === "trains") currentList = trainBookings;
    else if (serviceType === "flights") currentList = flightBookings;

    if (tabKey === "all") {
      return currentList.filter((x) => (x.status || "upcoming").toLowerCase() !== "cancelled").length;
    }
    return currentList.filter((x) => (x.status || "upcoming").toLowerCase() === tabKey).length;
  };

  // Cancel Booking Action
  const confirmCancelAction = async (bookingId) => {
    const currentUser = auth.currentUser;
    const uid = currentUser?.uid;

    if (activeService === "buses") {
      const updated = busBookings.map((b) =>
        b.bookingId === bookingId ? { ...b, status: "cancelled" } : b
      );
      setBusBookings(updated);

      if (db) {
        try {
          await updateDoc(doc(db, "bookings", String(bookingId)), {
            status: "cancelled",
            lastUpdated: new Date().toISOString(),
          });
          try {
            await updateDoc(doc(db, "payments", "PAY_" + bookingId), {
              status: "Refunded",
              lastUpdated: new Date().toISOString(),
            });
          } catch (pe) {}
        } catch (be) {
          console.log("Top-level booking cancel update error:", be);
        }
      }

      if (uid) {
        localStorage.setItem(`bookings_${uid}`, JSON.stringify(updated));
        if (db) {
          try {
            await updateDoc(doc(db, "users", uid, "bookings", bookingId), {
              status: "cancelled",
              lastUpdated: new Date().toISOString(),
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    } else if (activeService === "hotels") {
      const updated = hotelBookings.map((h) =>
        h.bookingId === bookingId ? { ...h, status: "cancelled" } : h
      );
      setHotelBookings(updated);

      if (db) {
        try {
          await updateDoc(doc(db, "bookings", String(bookingId)), {
            status: "cancelled",
            lastUpdated: new Date().toISOString(),
          });
        } catch (be) {}
      }

      if (uid) {
        localStorage.setItem(`hotelBookings_${uid}`, JSON.stringify(updated));
        if (db) {
          try {
            await updateDoc(doc(db, "users", uid, "hotelBookings", bookingId), {
              status: "cancelled",
              lastUpdated: new Date().toISOString(),
            });
          } catch (e) {
            console.log(e);
          }
        }
      }
    } else if (activeService === "trains") {
      const updated = trainBookings.map((t) =>
        t.bookingId === bookingId ? { ...t, status: "cancelled" } : t
      );
      setTrainBookings(updated);
      if (db) {
        try {
          await updateDoc(doc(db, "bookings", String(bookingId)), {
            status: "cancelled",
            lastUpdated: new Date().toISOString(),
          });
        } catch (be) {}
      }
      if (uid) {
        localStorage.setItem(`trainBookings_${uid}`, JSON.stringify(updated));
      }
    } else if (activeService === "flights") {
      const updated = flightBookings.map((f) =>
        f.bookingId === bookingId ? { ...f, status: "cancelled" } : f
      );
      setFlightBookings(updated);
      if (db) {
        try {
          await updateDoc(doc(db, "bookings", String(bookingId)), {
            status: "cancelled",
            lastUpdated: new Date().toISOString(),
          });
        } catch (be) {}
      }
      if (uid) {
        localStorage.setItem(`flightBookings_${uid}`, JSON.stringify(updated));
      }
    }

    setCancelModalItem(null);
    await successAlert(`Booking (${bookingId}) has been cancelled successfully.`);
  };

  const handlePrintTicket = (item) => {
    navigate("/e-ticket", { state: { booking: item } });
  };

  const handleDownloadTicketPDF = async (item) => {
    const pnr = item.pnr || "PBK" + (item.bookingId || "1000");
    const bookingId = item.bookingId || "BUS1000";
    const busName = item.bus?.name || item.busName || item.hotelName || item.trainName || item.airline || "BusVista Express";
    const busType = item.bus?.type || item.type || item.roomType || item.selectedClass || "Standard Service";
    const fromCity = item.bus?.from || item.from || item.city || "Origin";
    const toCity = item.bus?.to || item.to || "Destination";
    const departureTime = item.bus?.departure || item.departure || item.checkInDate || "10:00 PM";
    const arrivalTime = item.bus?.arrival || item.arrival || item.checkOutDate || "06:00 AM";
    const duration = item.bus?.duration || item.duration || "Direct";
    const boardingLocation = item.boardingPoint?.location || item.location || "Main Station";
    const droppingLocation = item.droppingPoint?.location || "City Drop Point";
    const passengerName = item.passenger?.name || item.name || "Customer";
    const passengerMobile = item.passenger?.mobile || item.mobile || "9876543210";
    const seats = Array.isArray(item.selectedSeats) ? item.selectedSeats.join(", ") : (item.selectedSeats || item.berth || item.seat || "Assigned");
    const travelDate = item.travelDate || item.bookingDate || item.date || "Date";
    const bookingDate = item.bookingDate || "Recent";
    const totalAmount = item.totalAmount || item.amount || 650;

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "750px";

    container.innerHTML = `
      <div style="width: 700px; padding: 24px; font-family: 'Segoe UI', Arial, sans-serif; background: #ffffff; color: #1e293b; border: 2px solid #cbd5e1; border-radius: 12px; box-sizing: border-box;">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 18px 22px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">🚌 Bus Vista</h2>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #f87171; font-weight: 700;">Official Travel E-Ticket</span>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 4px;">24x7 Helpline: 1800-102-8745</div>
            <div style="background: #ffffff; color: #0f172a; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 800;">
              PNR: <span style="color: #dc2626;">${pnr}</span> &nbsp;|&nbsp; <span style="color: #16a34a;">CONFIRMED</span>
            </div>
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px 20px; border-radius: 8px; margin-top: 14px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 style="margin: 0; font-size: 17px; font-weight: 700; color: #0f172a;">${busName}</h3>
            <span style="font-size: 13px; color: #64748b; font-weight: 600;">${busType}</span>
          </div>
          <div style="background: #fee2e2; color: #dc2626; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700;">
            Booking ID: ${bookingId}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px dashed #cbd5e1; margin-top: 10px;">
          <div style="flex: 1;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">DEPARTURE</span>
            <h4 style="margin: 4px 0 2px; font-size: 18px; color: #0f172a; font-weight: 800;">${fromCity}</h4>
            <span style="font-size: 15px; font-weight: 700; color: #dc2626;">${departureTime}</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${boardingLocation}</div>
          </div>
          <div style="text-align: center; padding: 0 15px;">
            <span style="background: #f1f5f9; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; color: #334155;">${duration}</span>
            <div style="color: #dc2626; font-size: 16px; margin: 4px 0;">────────►</div>
            <span style="font-size: 12px; font-weight: 700; color: #0f172a;">${travelDate}</span>
          </div>
          <div style="flex: 1; text-align: right;">
            <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">ARRIVAL</span>
            <h4 style="margin: 4px 0 2px; font-size: 18px; color: #0f172a; font-weight: 800;">${toCity}</h4>
            <span style="font-size: 15px; font-weight: 700; color: #dc2626;">${arrivalTime}</span>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${droppingLocation}</div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #64748b;">PASSENGER NAME</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">${passengerName}</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #64748b;">CONTACT MOBILE</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 700; color: #0f172a;">+91 ${passengerMobile}</td>
          </tr>
          <tr>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #64748b;">SEAT NUMBER(S)</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 14px; font-weight: 800; color: #dc2626;">💺 ${seats}</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #64748b;">BOOKING DATE</td>
            <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #334155;">${bookingDate}</td>
          </tr>
        </table>

        <div style="background: #fff1f2; border: 1px solid #fecdd3; padding: 14px 20px; border-radius: 8px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #9f1239; display: block;">TOTAL FARE PAID</span>
            <strong style="font-size: 22px; color: #be123c; font-weight: 800;">₹ ${totalAmount}</strong>
            <span style="background: #22c55e; color: #ffffff; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">PAID ONLINE</span>
          </div>
          <div style="text-align: right; font-size: 12px; color: #9f1239; font-weight: 700;">
            🛡️ 100% VERIFIED M-TICKET<br/>
            <small style="font-size: 10px; font-weight: 500; color: #881337;">Show on mobile during boarding</small>
          </div>
        </div>

        <div style="margin-top: 20px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 14px;">
          <div style="font-family: monospace; font-size: 20px; letter-spacing: 4px; color: #334155; font-weight: bold;">||||||| | ||||| ||| ||||||| | ||||| |||||| || | |||||||</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600;">PNR: ${pnr} • BOOKING ID: ${bookingId}</div>
          <p style="font-size: 10px; color: #94a3b8; margin: 8px 0 0;">Please report at boarding point 15 mins before departure. Carry valid Gov. Photo ID proof during travel.</p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container.firstElementChild, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, Math.min(imgHeight, pageHeight - margin * 2));
      pdf.save(`BusVista_Ticket_${pnr}.pdf`);
      await successAlert(`Ticket (${pnr}) downloaded successfully!`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      document.body.removeChild(container);
    }
  };

  const filteredBuses = getFilteredBusBookings();
  const filteredHotels = getFilteredList(hotelBookings);
  const filteredTrains = getFilteredList(trainBookings);
  const filteredFlights = getFilteredList(flightBookings);

  return (
    <div className="red-black-bookings-page">
      <Navbar />

      {/* 1. Hero Header Banner */}
      <section className="bookings-hero-banner">
        <div className="bookings-hero-container">
          <div>
            <div className="hero-badge-tag">
              <span>🎟️ YOUR TRAVEL DASHBOARD</span>
            </div>
            <h1 className="hero-heading">My Bookings</h1>
            <p className="hero-subheading">
              Manage your confirmed bus, hotel, train, and flight tickets with live tracking.
            </p>
          </div>

          <div className="bookings-search-bar-wrap">
            <FaSearch className="search-bar-icon" />
            <input
              type="text"
              className="bookings-search-input"
              placeholder="Search by PNR, Booking ID, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="bookings-main-content-layout">
        {/* Service Category Navigation (Buses, Hotels, Trains, Flights) */}
        <div className="service-category-nav-strip">
          <button
            type="button"
            className={`service-cat-pill ${activeService === "buses" ? "active" : ""}`}
            onClick={() => setActiveService("buses")}
          >
            <FaBus />
            <span>Buses</span>
            <span className="cat-count-tag">{busBookings.length}</span>
          </button>

          <button
            type="button"
            className={`service-cat-pill ${activeService === "hotels" ? "active" : ""}`}
            onClick={() => setActiveService("hotels")}
          >
            <FaHotel />
            <span>Hotels</span>
            <span className="cat-count-tag">{hotelBookings.length}</span>
          </button>

          <button
            type="button"
            className={`service-cat-pill ${activeService === "trains" ? "active" : ""}`}
            onClick={() => setActiveService("trains")}
          >
            <FaTrain />
            <span>Trains</span>
            <span className="cat-count-tag">{trainBookings.length}</span>
          </button>

          <button
            type="button"
            className={`service-cat-pill ${activeService === "flights" ? "active" : ""}`}
            onClick={() => setActiveService("flights")}
          >
            <FaPlane />
            <span>Flights</span>
            <span className="cat-count-tag">{flightBookings.length}</span>
          </button>
        </div>

        {/* Status Filter Tabs (All, Upcoming, Completed, Cancelled) */}
        <div className="bookings-filter-tabs-row">
          <button
            type="button"
            className={`booking-tab-pill-btn ${activeStatusTab === "all" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("all")}
          >
            <span>All Bookings</span>
            <span className="tab-count-badge">{getServiceTabCount(activeService, "all")}</span>
          </button>

          <button
            type="button"
            className={`booking-tab-pill-btn ${activeStatusTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("upcoming")}
          >
            <span>Upcoming</span>
            <span className="tab-count-badge">{getServiceTabCount(activeService, "upcoming")}</span>
          </button>

          <button
            type="button"
            className={`booking-tab-pill-btn ${activeStatusTab === "completed" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("completed")}
          >
            <span>Completed</span>
            <span className="tab-count-badge">{getServiceTabCount(activeService, "completed")}</span>
          </button>

          <button
            type="button"
            className={`booking-tab-pill-btn ${activeStatusTab === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveStatusTab("cancelled")}
          >
            <span>Cancelled</span>
            <span className="tab-count-badge">{getServiceTabCount(activeService, "cancelled")}</span>
          </button>
        </div>

        {/* Bookings List Cards Render */}
        <div className="bookings-cards-list">
          {/* 1. BUS BOOKINGS */}
          {activeService === "buses" && (
            <>
              {filteredBuses.length === 0 ? (
                <div className="no-bookings-empty-state">
                  <div className="empty-icon-circle">
                    <FaBus />
                  </div>
                  <h3>No Bus Bookings Found</h3>
                  <p>
                    {activeStatusTab === "all"
                      ? "You haven't booked any bus tickets yet. Search & book your first journey now!"
                      : `No ${activeStatusTab} bus bookings found.`}
                  </p>
                  <button
                    type="button"
                    className="book-new-bus-btn"
                    onClick={() => navigate("/")}
                  >
                    Book a Bus Ticket
                  </button>
                </div>
              ) : (
                filteredBuses.map((item) => (
                  <div
                    key={item.bookingId}
                    className={`red-booking-card ${item.status || "upcoming"}`}
                  >
                    {/* Top Strip */}
                    <div className="booking-card-top-strip">
                      <div className="operator-left-meta">
                        <div className="operator-name-box">
                          <FaBus className="bus-icon-red" />
                          <h3>{item.bus?.name || "Bus Service"}</h3>
                          <span className="bus-type-tag">{item.bus?.type || "AC Sleeper"}</span>
                        </div>
                        <div className="pnr-booking-pills">
                          <span className="pnr-pill">PNR: {item.pnr || "PBK" + item.bookingId}</span>
                          <span className="booking-id-pill">ID: {item.bookingId}</span>
                        </div>
                      </div>

                      <div>
                        {item.status === "cancelled" ? (
                          <span className="status-pill cancelled">
                            <FaTimesCircle /> CANCELLED
                          </span>
                        ) : (
                          <span className="status-pill upcoming">
                            <FaCheckCircle /> UPCOMING • CONFIRMED
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="booking-journey-timeline-box">
                      <div className="timeline-node">
                        <span className="node-time">{item.bus?.departure || "10:00 PM"}</span>
                        <span className="node-city">{item.bus?.from || "Source"}</span>
                        <span className="node-point-sub">
                          <FaMapMarkerAlt /> {item.boardingPoint?.location || "Boarding Point"}
                        </span>
                      </div>

                      <div className="timeline-duration-middle">
                        <span className="duration-pill">{item.bus?.duration || "06h 00m"}</span>
                        <div className="duration-line-arrow">
                          <span className="dot"></span>
                          <span className="line"></span>
                          <FaArrowRight className="arrow" />
                        </div>
                        <span className="journey-date-tag">
                          <FaCalendarAlt /> {item.travelDate || "Date"}
                        </span>
                      </div>

                      <div className="timeline-node text-right">
                        <span className="node-time">{item.bus?.arrival || "06:00 AM"}</span>
                        <span className="node-city">{item.bus?.to || "Destination"}</span>
                        <span className="node-point-sub">
                          <FaMapMarkerAlt /> {item.droppingPoint?.location || "Dropping Point"}
                        </span>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div className="booking-details-meta-grid">
                      <div className="meta-cell">
                        <span className="meta-label">PASSENGER NAME</span>
                        <span className="meta-value">
                          <FaUser className="cell-icon" /> {item.passenger?.name || "Passenger"}
                        </span>
                      </div>

                      <div className="meta-cell">
                        <span className="meta-label">SELECTED SEATS</span>
                        <span className="meta-value seat-red-badge">
                          💺 {Array.isArray(item.selectedSeats) ? item.selectedSeats.join(", ") : item.selectedSeats || "Seat"}
                        </span>
                      </div>

                      <div className="meta-cell">
                        <span className="meta-label">BOOKING DATE</span>
                        <span className="meta-value">
                          <FaCalendarAlt className="cell-icon" /> {item.bookingDate || "Recent"}
                        </span>
                      </div>

                      <div className="meta-cell total-fare-cell">
                        <span className="meta-label">TOTAL FARE PAID</span>
                        <div className="fare-tag-group">
                          <span className="fare-red-amount">₹ {item.totalAmount || 650}</span>
                          <span className="paid-online-tag">PAID ONLINE</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Strip */}
                    <div className="booking-card-actions-strip">
                      <div className="actions-left-group">
                        {item.status !== "cancelled" && (
                          <button
                            type="button"
                            className="action-link-btn track-live-btn"
                            onClick={() => setTrackPnr(item.pnr || "PBK" + item.bookingId)}
                          >
                            <FaMapMarkerAlt /> <span>Track Live Bus</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="action-link-btn print-eticket-btn"
                          onClick={() => handlePrintTicket(item)}
                        >
                          <FaPrint /> <span>Print / E-Ticket</span>
                        </button>
                        <button
                          type="button"
                          className="action-link-btn download-ticket-btn"
                          onClick={() => handleDownloadTicketPDF(item)}
                        >
                          <FaDownload /> <span>Download Ticket</span>
                        </button>
                      </div>

                      <div className="actions-right-group">
                        {item.status !== "cancelled" && (
                          <button
                            type="button"
                            className="action-link-btn cancel-ticket-btn"
                            onClick={() => setCancelModalItem(item)}
                          >
                            <FaBan /> <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* 2. HOTEL BOOKINGS */}
          {activeService === "hotels" && (
            <>
              {filteredHotels.length === 0 ? (
                <div className="no-bookings-empty-state">
                  <div className="empty-icon-circle">
                    <FaHotel />
                  </div>
                  <h3>No Hotel Bookings Found</h3>
                  <p>You have not booked any hotel stays yet.</p>
                  <button
                    type="button"
                    className="book-new-bus-btn"
                    onClick={() => navigate("/hotels")}
                  >
                    Browse Hotels
                  </button>
                </div>
              ) : (
                filteredHotels.map((item) => (
                  <div
                    key={item.bookingId}
                    className={`red-booking-card ${item.status || "upcoming"}`}
                  >
                    <div className="booking-card-top-strip">
                      <div className="operator-left-meta">
                        <div className="operator-name-box">
                          <FaHotel className="bus-icon-red" />
                          <h3>{item.hotelName || "Hotel Stay"}</h3>
                          <span className="bus-type-tag">{item.roomType || "Standard Room"}</span>
                        </div>
                        <div className="pnr-booking-pills">
                          <span className="booking-id-pill">ID: {item.bookingId}</span>
                        </div>
                      </div>

                      <div>
                        {item.status === "cancelled" ? (
                          <span className="status-pill cancelled">
                            <FaTimesCircle /> CANCELLED
                          </span>
                        ) : (
                          <span className="status-pill upcoming">
                            <FaCheckCircle /> CONFIRMED STAY
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="booking-details-meta-grid">
                      <div className="meta-cell">
                        <span className="meta-label">LOCATION</span>
                        <span className="meta-value">
                          <FaMapMarkerAlt className="cell-icon" /> {item.location || item.city || "India"}
                        </span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-label">CHECK-IN</span>
                        <span className="meta-value">
                          <FaCalendarAlt className="cell-icon" /> {item.checkInDate || "2026-08-20"}
                        </span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-label">GUESTS</span>
                        <span className="meta-value">
                          <FaUserFriends className="cell-icon" /> {item.guests || "2 Guests, 1 Room"}
                        </span>
                      </div>
                      <div className="meta-cell total-fare-cell">
                        <span className="meta-label">TOTAL AMOUNT</span>
                        <div className="fare-tag-group">
                          <span className="fare-red-amount">₹ {item.totalAmount || 3400}</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-card-actions-strip">
                      <div className="actions-left-group">
                        <button
                          type="button"
                          className="action-link-btn print-eticket-btn"
                          onClick={() => window.print()}
                        >
                          <FaPrint /> <span>Print Voucher</span>
                        </button>
                        <button
                          type="button"
                          className="action-link-btn download-ticket-btn"
                          onClick={() => handleDownloadTicketPDF(item)}
                        >
                          <FaDownload /> <span>Download Voucher</span>
                        </button>
                      </div>
                      <div className="actions-right-group">
                        {item.status !== "cancelled" && (
                          <button
                            type="button"
                            className="action-link-btn cancel-ticket-btn"
                            onClick={() => setCancelModalItem(item)}
                          >
                            <FaBan /> <span>Cancel Stay</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* 3. TRAIN BOOKINGS */}
          {activeService === "trains" && (
            <>
              {filteredTrains.length === 0 ? (
                <div className="no-bookings-empty-state">
                  <div className="empty-icon-circle">
                    <FaTrain />
                  </div>
                  <h3>No Train Bookings Found</h3>
                  <p>You have not booked any train tickets yet.</p>
                  <button
                    type="button"
                    className="book-new-bus-btn"
                    onClick={() => navigate("/trains")}
                  >
                    Search Trains
                  </button>
                </div>
              ) : (
                filteredTrains.map((item) => (
                  <div
                    key={item.bookingId}
                    className={`red-booking-card ${item.status || "upcoming"}`}
                  >
                    <div className="booking-card-top-strip">
                      <div className="operator-left-meta">
                        <div className="operator-name-box">
                          <FaTrain className="bus-icon-red" />
                          <h3>{item.trainName || "IRCTC Express"}</h3>
                          <span className="bus-type-tag">Train #{item.trainNo || "12001"}</span>
                        </div>
                        <div className="pnr-booking-pills">
                          <span className="pnr-pill">PNR: {item.pnr || "TRN100001"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="status-pill upcoming">
                          <FaCheckCircle /> CONFIRMED BERTH
                        </span>
                      </div>
                    </div>

                    <div className="booking-journey-timeline-box">
                      <div className="timeline-node">
                        <span className="node-time">{item.departure || "05:30 AM"}</span>
                        <span className="node-city">{item.from || "Origin"}</span>
                      </div>
                      <div className="timeline-duration-middle">
                        <span className="duration-pill">{item.duration || "04h 15m"}</span>
                        <div className="duration-line-arrow">
                          <span className="dot"></span>
                          <span className="line"></span>
                          <FaArrowRight className="arrow" />
                        </div>
                        <span className="journey-date-tag">
                          <FaCalendarAlt /> {item.travelDate || "Date"}
                        </span>
                      </div>
                      <div className="timeline-node text-right">
                        <span className="node-time">{item.arrival || "09:45 AM"}</span>
                        <span className="node-city">{item.to || "Destination"}</span>
                      </div>
                    </div>

                    <div className="booking-details-meta-grid">
                      <div className="meta-cell">
                        <span className="meta-label">CLASS / COACH</span>
                        <span className="meta-value">{item.selectedClass || "CC"}</span>
                      </div>
                      <div className="meta-cell">
                        <span className="meta-label">BERTH / SEAT</span>
                        <span className="meta-value seat-red-badge">{item.berth || "C1-22"}</span>
                      </div>
                      <div className="meta-cell total-fare-cell">
                        <span className="meta-label">FARE</span>
                        <div className="fare-tag-group">
                          <span className="fare-red-amount">₹ {item.totalAmount || 780}</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-card-actions-strip">
                      <div className="actions-left-group">
                        <button
                          type="button"
                          className="action-link-btn print-eticket-btn"
                          onClick={() => handlePrintTicket(item)}
                        >
                          <FaPrint /> <span>Print Ticket</span>
                        </button>
                        <button
                          type="button"
                          className="action-link-btn download-ticket-btn"
                          onClick={() => handleDownloadTicketPDF(item)}
                        >
                          <FaDownload /> <span>Download Ticket</span>
                        </button>
                      </div>
                      <div className="actions-right-group">
                        {item.status !== "cancelled" && (
                          <button
                            type="button"
                            className="action-link-btn cancel-ticket-btn"
                            onClick={() => setCancelModalItem(item)}
                          >
                            <FaBan /> <span>Cancel Ticket</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* 4. FLIGHT BOOKINGS */}
          {activeService === "flights" && (
            <>
              {filteredFlights.length === 0 ? (
                <div className="no-bookings-empty-state">
                  <div className="empty-icon-circle">
                    <FaPlane />
                  </div>
                  <h3>No Flight Bookings Found</h3>
                  <p>You have not booked any flight tickets yet.</p>
                  <button
                    type="button"
                    className="book-new-bus-btn"
                    onClick={() => navigate("/flights")}
                  >
                    Search Flights
                  </button>
                </div>
              ) : (
                filteredFlights.map((item) => (
                  <div
                    key={item.bookingId}
                    className={`red-booking-card ${item.status || "upcoming"}`}
                  >
                    <div className="booking-card-top-strip">
                      <div className="operator-left-meta">
                        <div className="operator-name-box">
                          <FaPlane className="bus-icon-red" />
                          <h3>{item.airline || "IndiGo"}</h3>
                          <span className="bus-type-tag">Flight {item.flightNo || "6E-101"}</span>
                        </div>
                        <div className="pnr-booking-pills">
                          <span className="pnr-pill">PNR: {item.pnr || "FLT100001"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="status-pill upcoming">
                          <FaCheckCircle /> CONFIRMED SEAT
                        </span>
                      </div>
                    </div>

                    <div className="booking-journey-timeline-box">
                      <div className="timeline-node">
                        <span className="node-time">{item.departure || "06:15 AM"}</span>
                        <span className="node-city">{item.from || "Origin Airport"}</span>
                      </div>
                      <div className="timeline-duration-middle">
                        <span className="duration-pill">{item.duration || "02h 10m"}</span>
                        <div className="duration-line-arrow">
                          <span className="dot"></span>
                          <span className="line"></span>
                          <FaArrowRight className="arrow" />
                        </div>
                        <span className="journey-date-tag">
                          <FaCalendarAlt /> {item.travelDate || "Date"}
                        </span>
                      </div>
                      <div className="timeline-node text-right">
                        <span className="node-time">{item.arrival || "08:25 AM"}</span>
                        <span className="node-city">{item.to || "Destination Airport"}</span>
                      </div>
                    </div>

                    <div className="booking-card-actions-strip">
                      <div className="actions-left-group">
                        <button
                          type="button"
                          className="action-link-btn print-eticket-btn"
                          onClick={() => handlePrintTicket(item)}
                        >
                          <FaPrint /> <span>Print Pass</span>
                        </button>
                        <button
                          type="button"
                          className="action-link-btn download-ticket-btn"
                          onClick={() => handleDownloadTicketPDF(item)}
                        >
                          <FaDownload /> <span>Download Ticket</span>
                        </button>
                      </div>
                      <div className="actions-right-group">
                        {item.status !== "cancelled" && (
                          <button
                            type="button"
                            className="action-link-btn cancel-ticket-btn"
                            onClick={() => setCancelModalItem(item)}
                          >
                            <FaBan /> <span>Cancel Flight</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>

      {/* Cancel Modal Confirmation */}
      {cancelModalItem && (
        <div className="cancel-modal-backdrop" onClick={() => setCancelModalItem(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon-wrap">
              <FaExclamationTriangle />
            </div>
            <h3>Cancel {activeService.toUpperCase().slice(0, -1)} Booking</h3>
            <p>
              Are you sure you want to cancel booking <strong>{cancelModalItem.bookingId}</strong> (PNR: {cancelModalItem.pnr})?
            </p>
            <div className="refund-estimate-box">
              <span>Estimated Refund Amount:</span>
              <strong>₹ {cancelModalItem.totalAmount || 0}</strong>
            </div>
            <div className="cancel-modal-buttons-row">
              <button
                type="button"
                className="cancel-keep-btn"
                onClick={() => setCancelModalItem(null)}
              >
                No, Keep Booking
              </button>
              <button
                type="button"
                className="cancel-confirm-btn"
                onClick={() => confirmCancelAction(cancelModalItem.bookingId)}
              >
                Yes, Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Track Ticket Modal */}
      <TrackTicketModal
        isOpen={Boolean(trackPnr)}
        onClose={() => setTrackPnr(null)}
        initialPnr={trackPnr}
      />

      <Footer />
    </div>
  );
};

export default MyBookings;
