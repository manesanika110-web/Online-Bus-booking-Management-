import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import AdminDashboard from "./AdminDashboard";
import AdminUsers from "./AdminUsers";
import AdminBuses from "./AdminBuses";
import AdminRoutes from "./AdminRoutes";
import AdminBookings from "./AdminBookings";
import AdminPayments from "./AdminPayments";
import AdminSupportQueries from "./AdminSupportQueries";
import AdminLiveTracking from "./AdminLiveTracking";

import {
  subscribeToUsers,
  subscribeToBuses,
  subscribeToRoutes,
  subscribeToBookings,
  subscribeToPayments,
  subscribeToSupportQueries,
  subscribeToBusLocations,
  subscribeToAdmins,
} from "./adminDataService";

import "../css/AdminPanel.css";

function AdminLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab from URL query or state
  const tabFromUrl = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLiveSynced, setIsLiveSynced] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Real-time Firestore Collections
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [supportQueries, setSupportQueries] = useState([]);
  const [busLocations, setBusLocations] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track initial booking count for incoming toast notifications
  const prevBookingsCount = useRef(null);
  const prevQueriesCount = useRef(null);
  const [incomingAlertToast, setIncomingAlertToast] = useState(null);

  // Sync tab with URL search parameter
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    setSearchQuery("");
  };

  useEffect(() => {
    if (tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Real-time Firestore Subscriptions for all Active Collections
  useEffect(() => {
    setIsLoading(true);

    // 1. users
    const unsubUsers = subscribeToUsers((data) => {
      setUsers(data);
      setLastUpdated(new Date());
    });

    // 2. buses
    const unsubBuses = subscribeToBuses((data) => {
      setBuses(data);
      setLastUpdated(new Date());
    });

    // 3. routes
    const unsubRoutes = subscribeToRoutes((data) => {
      setRoutes(data);
      setLastUpdated(new Date());
    });

    // 4. bookings
    const unsubBookings = subscribeToBookings((data) => {
      // Check if new booking arrived in real-time
      if (prevBookingsCount.current !== null && data.length > prevBookingsCount.current) {
        const latest = data[0];
        if (latest) {
          setIncomingAlertToast({
            type: "booking",
            title: "🎉 Real-Time Booking Received!",
            message: `${latest.passenger?.name || latest.name || "Customer"} booked ${latest.bus?.from && latest.bus?.to ? `${latest.bus.from} ➔ ${latest.bus.to}` : "Bus"} (₹${latest.totalAmount || 650}) • PNR: ${latest.pnr || "PBK" + (latest.bookingId || "NEW")}`,
            targetTab: "bookings",
          });
          setTimeout(() => setIncomingAlertToast(null), 6000);
        }
      }
      prevBookingsCount.current = data.length;
      setBookings(data);
      setLastUpdated(new Date());
      setIsLoading(false);
    });

    // 5. payments
    const unsubPayments = subscribeToPayments((data) => {
      setPayments(data);
      setLastUpdated(new Date());
    });

    // 6. support_queries
    const unsubSupportQueries = subscribeToSupportQueries((data) => {
      if (prevQueriesCount.current !== null && data.length > prevQueriesCount.current) {
        const latest = data[0];
        if (latest) {
          setIncomingAlertToast({
            type: "support",
            title: "🎧 New Customer Support Query Received!",
            message: `${latest.name} submitted: "${latest.issueType || "Query"}" - ${latest.message?.slice(0, 60)}...`,
            targetTab: "support",
          });
          setTimeout(() => setIncomingAlertToast(null), 6000);
        }
      }
      prevQueriesCount.current = data.length;
      setSupportQueries(data);
      setLastUpdated(new Date());
    });

    // 7. bus_locations
    const unsubLocations = subscribeToBusLocations((data) => {
      setBusLocations(data);
      setLastUpdated(new Date());
    });

    // 8. admins
    const unsubAdmins = subscribeToAdmins((data) => {
      setAdmins(data);
      setLastUpdated(new Date());
    });

    return () => {
      unsubUsers();
      unsubBuses();
      unsubRoutes();
      unsubBookings();
      unsubPayments();
      unsubSupportQueries();
      unsubLocations();
      unsubAdmins();
    };
  }, []);

  // Counts for sidebar badges
  const counts = {
    users: users.length,
    buses: buses.length,
    routes: routes.length,
    bookings: bookings.length,
    payments: payments.length || bookings.length,
    supportQueries: supportQueries.filter((q) => (q.status || "Open").toLowerCase() === "open").length,
    liveBuses: busLocations.length || "LIVE",
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  return (
    <div className="admin-app-layout">
      {/* 1. Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        counts={counts}
      />

      {/* 2. Main Administration Canvas */}
      <div className="admin-main-viewport">
        <AdminNavbar
          activeTab={activeTab}
          onToggleSidebar={() => setIsMobileOpen(!isMobileOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isLiveSynced={isLiveSynced}
          lastUpdated={lastUpdated}
          bookings={bookings}
          supportQueries={supportQueries}
          admins={admins}
          onRefresh={handleRefresh}
          setActiveTab={handleTabChange}
        />

        {/* Real-Time Live In-App Toast */}
        {incomingAlertToast && (
          <div
            className="admin-live-notification-toast"
            onClick={() => handleTabChange(incomingAlertToast.targetTab)}
            style={{ cursor: "pointer" }}
          >
            <div className="toast-pulse-dot"></div>
            <div className="toast-text-wrap">
              <strong>{incomingAlertToast.title}</strong>
              <span>{incomingAlertToast.message}</span>
            </div>
            <button
              type="button"
              className="toast-dismiss"
              onClick={(e) => {
                e.stopPropagation();
                setIncomingAlertToast(null);
              }}
            >
              ×
            </button>
          </div>
        )}

        <main className="admin-content-canvas">
          {activeTab === "dashboard" && (
            <AdminDashboard
              users={users}
              buses={buses}
              routes={routes}
              bookings={bookings}
              payments={payments}
              supportQueries={supportQueries}
              busLocations={busLocations}
              admins={admins}
              setActiveTab={handleTabChange}
              onOpenAddBus={() => handleTabChange("buses")}
              onOpenAddRoute={() => handleTabChange("routes")}
            />
          )}

          {activeTab === "users" && (
            <AdminUsers
              users={users}
              bookings={bookings}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "buses" && (
            <AdminBuses
              buses={buses}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "routes" && (
            <AdminRoutes
              routes={routes}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "bookings" && (
            <AdminBookings
              bookings={bookings}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "payments" && (
            <AdminPayments
              payments={payments}
              bookings={bookings}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "support" && (
            <AdminSupportQueries
              queries={supportQueries}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === "livetracking" && (
            <AdminLiveTracking
              busLocations={busLocations}
              bookings={bookings}
              buses={buses}
              routes={routes}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
