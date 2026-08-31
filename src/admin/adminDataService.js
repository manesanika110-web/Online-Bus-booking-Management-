import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";
import busData from "../data/busData";

/**
 * Real-time Firestore service for BusVista Admin Panel
 * Connecting 7 Active Collections:
 * 1. users
 * 2. buses
 * 3. routes
 * 4. bookings
 * 5. payments
 * 6. support_queries
 * 7. bus_locations
 * 8. admins
 */

// Generate initial routes from bus fleet
const generateInitialRoutes = (buses) => {
  const routeMap = new Map();

  buses.forEach((b) => {
    const key = `${b.from} -> ${b.to}`;
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        id: `RT_${b.from.toLowerCase().slice(0, 3)}_${b.to.toLowerCase().slice(0, 3)}`,
        from: b.from,
        to: b.to,
        routeName: `${b.from} to ${b.to} Express Route`,
        distance: b.from === "Sangli" && b.to === "Goa" ? "245 km" : "180 km",
        duration: b.duration || "5h 30m",
        baseFare: b.price || 650,
        busesCount: 1,
        status: "Active",
        stops: (b.boardingPoints || []).map((p) => p.location).slice(0, 3),
        totalTripsToday: 6,
        createdAt: new Date().toISOString(),
      });
    } else {
      const existing = routeMap.get(key);
      existing.busesCount += 1;
      if (b.price && b.price < existing.baseFare) {
        existing.baseFare = b.price;
      }
    }
  });

  return Array.from(routeMap.values());
};

// Generate initial live GPS tracking records
const generateInitialBusLocations = (buses) => {
  const sampleCoordinates = [
    { loc: "NH-48 Near Karad Toll Plaza", next: "Kolhapur Bypass", speed: "68 km/h", lat: 17.2895, lng: 74.1812, status: "On Time" },
    { loc: "Gaganbawda Ghat Pass (NH-166)", next: "Kankavli ST Stand", speed: "42 km/h", lat: 16.5367, lng: 73.8291, status: "On Time" },
    { loc: "Mapusa Gandhi Circle, Goa", next: "Panjim KTC Bus Stand", speed: "35 km/h", lat: 15.5937, lng: 73.8142, status: "Approaching Terminal" },
    { loc: "Pune-Bangalore Highway, Swargate", next: "Shirwal Chowk", speed: "55 km/h", lat: 18.5018, lng: 73.8586, status: "On Route" },
    { loc: "Banda Border Checkpost (MH-Goa)", next: "Pernem Highway", speed: "60 km/h", lat: 15.8116, lng: 73.8744, status: "On Time" },
  ];

  return buses.slice(0, 8).map((bus, idx) => {
    const geo = sampleCoordinates[idx % sampleCoordinates.length];
    return {
      id: `LOC_${bus.id || 100 + idx}`,
      busId: String(bus.id || 100 + idx),
      busName: bus.name || "BusVista Express",
      busNumber: `MH-${10 + (idx % 40)} BV-${1000 + idx}`,
      route: `${bus.from} ➔ ${bus.to}`,
      driverName: ["Suresh Patil", "Ramesh Shinde", "Anil Kadam", "Santosh More", "Vijay Jadhav"][idx % 5],
      driverContact: `+91 98${idx}452${idx}10`,
      latitude: geo.lat,
      longitude: geo.lng,
      speed: geo.speed,
      currentLocation: geo.loc,
      nextStop: geo.next,
      status: geo.status,
      heading: "South-West",
      liveGPSActive: true,
      lastUpdated: new Date().toISOString(),
    };
  });
};

/**
 * 1. Subscribe to USERS Collection (Real-Time)
 */
export const subscribeToUsers = (callback) => {
  if (!db) {
    callback([]);
    return () => {};
  }

  try {
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const usersList = [];
        snapshot.forEach((docSnap) => {
          usersList.push({ id: docSnap.id, ...docSnap.data() });
        });
        callback(usersList);
      },
      (error) => {
        console.warn("Users onSnapshot error:", error);
        callback([]);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToUsers error:", error);
    callback([]);
    return () => {};
  }
};

/**
 * 2. Subscribe to BUSES Collection (Real-Time)
 */
export const subscribeToBuses = (callback) => {
  if (!db) {
    callback(busData);
    return () => {};
  }

  try {
    const busesCol = collection(db, "buses");
    const unsubscribe = onSnapshot(
      busesCol,
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            const seedPromises = busData.slice(0, 15).map((bus) => {
              const busId = String(bus.id || `BUS_${Math.random()}`);
              return setDoc(doc(db, "buses", busId), {
                ...bus,
                id: bus.id,
                status: "Active",
                lastUpdated: new Date().toISOString(),
              });
            });
            await Promise.all(seedPromises);
          } catch (seedErr) {
            console.warn("Bus seed error:", seedErr);
            callback(busData);
            return;
          }
          callback(busData);
        } else {
          const busesList = [];
          snapshot.forEach((docSnap) => {
            busesList.push({ ...docSnap.data(), docId: docSnap.id });
          });
          callback(busesList);
        }
      },
      (error) => {
        console.warn("Buses onSnapshot error:", error);
        callback(busData);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToBuses error:", error);
    callback(busData);
    return () => {};
  }
};

/**
 * 3. Subscribe to ROUTES Collection (Real-Time)
 */
export const subscribeToRoutes = (callback) => {
  if (!db) {
    callback(generateInitialRoutes(busData));
    return () => {};
  }

  try {
    const routesCol = collection(db, "routes");
    const unsubscribe = onSnapshot(
      routesCol,
      async (snapshot) => {
        if (snapshot.empty) {
          const initialRoutes = generateInitialRoutes(busData);
          try {
            const seedPromises = initialRoutes.map((rt) =>
              setDoc(doc(db, "routes", rt.id), rt)
            );
            await Promise.all(seedPromises);
          } catch (seedErr) {
            console.warn("Routes seed error:", seedErr);
            callback(initialRoutes);
            return;
          }
          callback(initialRoutes);
        } else {
          const routesList = [];
          snapshot.forEach((docSnap) => {
            routesList.push({ ...docSnap.data(), docId: docSnap.id });
          });
          callback(routesList);
        }
      },
      (error) => {
        console.warn("Routes onSnapshot error:", error);
        callback(generateInitialRoutes(busData));
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToRoutes error:", error);
    callback(generateInitialRoutes(busData));
    return () => {};
  }
};

/**
 * 4. Subscribe to BOOKINGS Collection (Real-Time Firestore)
 */
export const subscribeToBookings = (callback) => {
  if (!db) {
    const local = JSON.parse(localStorage.getItem("bookings")) || [];
    callback(local);
    return () => {};
  }

  try {
    const bookingsCol = collection(db, "bookings");
    const unsubscribe = onSnapshot(
      bookingsCol,
      (snapshot) => {
        const bookingsList = [];
        snapshot.forEach((docSnap) => {
          bookingsList.push({ ...docSnap.data(), docId: docSnap.id, id: docSnap.id });
        });

        // Sort by timestamp/bookingDate/createdAt descending
        const sorted = bookingsList.sort((a, b) => {
          const tA = new Date(a.createdAt || a.bookingDate || a.timestamp || 0).getTime();
          const tB = new Date(b.createdAt || b.bookingDate || b.timestamp || 0).getTime();
          return tB - tA;
        });

        callback(sorted);
      },
      (error) => {
        console.warn("Bookings onSnapshot error:", error);
        const local = JSON.parse(localStorage.getItem("bookings")) || [];
        callback(local);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToBookings error:", error);
    const local = JSON.parse(localStorage.getItem("bookings")) || [];
    callback(local);
    return () => {};
  }
};

/**
 * 5. Subscribe to PAYMENTS Collection (Real-Time Firestore)
 */
export const subscribeToPayments = (callback) => {
  if (!db) {
    const local = JSON.parse(localStorage.getItem("payments")) || [];
    callback(local);
    return () => {};
  }

  try {
    const paymentsCol = collection(db, "payments");
    const unsubscribe = onSnapshot(
      paymentsCol,
      (snapshot) => {
        const paymentsList = [];
        snapshot.forEach((docSnap) => {
          paymentsList.push({ ...docSnap.data(), docId: docSnap.id, id: docSnap.id });
        });

        const sorted = paymentsList.sort((a, b) => {
          const tA = new Date(a.timestamp || a.date || a.createdAt || 0).getTime();
          const tB = new Date(b.timestamp || b.date || b.createdAt || 0).getTime();
          return tB - tA;
        });

        callback(sorted);
      },
      (error) => {
        console.warn("Payments onSnapshot error:", error);
        const local = JSON.parse(localStorage.getItem("payments")) || [];
        callback(local);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToPayments error:", error);
    const local = JSON.parse(localStorage.getItem("payments")) || [];
    callback(local);
    return () => {};
  }
};

/**
 * 6. Subscribe to SUPPORT_QUERIES Collection (Real-Time Firestore)
 */
export const subscribeToSupportQueries = (callback) => {
  if (!db) {
    callback([]);
    return () => {};
  }

  try {
    const sqCol = collection(db, "support_queries");
    const unsubscribe = onSnapshot(
      sqCol,
      (snapshot) => {
        const queriesList = [];
        snapshot.forEach((docSnap) => {
          queriesList.push({ ...docSnap.data(), docId: docSnap.id, id: docSnap.id });
        });

        const sorted = queriesList.sort((a, b) => {
          const tA = new Date(a.createdAt || a.timestamp || 0).getTime();
          const tB = new Date(b.createdAt || b.timestamp || 0).getTime();
          return tB - tA;
        });

        callback(sorted);
      },
      (error) => {
        console.warn("Support Queries onSnapshot error:", error);
        callback([]);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToSupportQueries error:", error);
    callback([]);
    return () => {};
  }
};

/**
 * Support Queries Actions
 */
export const addSupportQueryToFirestore = async (queryData) => {
  if (!db) return false;
  try {
    const qId = queryData.id || `QUERY_${Date.now()}`;
    const docRef = doc(db, "support_queries", qId);
    await setDoc(docRef, {
      ...queryData,
      id: qId,
      status: queryData.status || "Open",
      createdAt: queryData.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("addSupportQuery error:", err);
    throw err;
  }
};

export const updateSupportQueryStatusInFirestore = async (queryId, newStatus) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "support_queries", String(queryId));
    await updateDoc(docRef, {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("updateSupportQueryStatus error:", err);
    throw err;
  }
};

export const deleteSupportQueryFromFirestore = async (queryId) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "support_queries", String(queryId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("deleteSupportQuery error:", err);
    throw err;
  }
};

/**
 * Save New Booking to Firestore Directly (and Top-Level Payments)
 */
export const saveBookingToFirestore = async (bookingData) => {
  if (!db) return false;
  try {
    const bookingId = String(bookingData.bookingId || `BUS${Math.floor(100000 + Math.random() * 900000)}`);
    const pnr = String(bookingData.pnr || `PBK${Math.floor(100000 + Math.random() * 900000)}`);
    const docRef = doc(db, "bookings", bookingId);

    const fullBookingObj = {
      bookingId,
      pnr,
      userId: bookingData.userId || "",
      userEmail: bookingData.userEmail || bookingData.passenger?.email || "",
      bookingDate: bookingData.bookingDate || new Date().toISOString(),
      travelDate: bookingData.travelDate || bookingData.bookingDate || new Date().toISOString(),
      passenger: {
        name: bookingData.passenger?.name || bookingData.name || "Customer",
        mobile: bookingData.passenger?.mobile || bookingData.mobile || "",
        email: bookingData.passenger?.email || bookingData.userEmail || "",
        age: bookingData.passenger?.age || "",
        gender: bookingData.passenger?.gender || "Passenger",
      },
      bus: bookingData.bus || {},
      selectedSeats: bookingData.selectedSeats || [],
      boardingPoint: bookingData.boardingPoint || {},
      droppingPoint: bookingData.droppingPoint || {},
      totalAmount: Number(bookingData.totalAmount || bookingData.amount || 0),
      paymentMethod: bookingData.paymentMethod || "UPI",
      status: bookingData.status || "confirmed",
      createdAt: bookingData.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(docRef, fullBookingObj, { merge: true });

    // Also write to top-level payments collection
    const paymentId = "PAY_" + bookingId;
    await setDoc(
      doc(db, "payments", paymentId),
      {
        transactionId: paymentId,
        paymentId,
        bookingId,
        pnr,
        passengerName: fullBookingObj.passenger.name,
        email: fullBookingObj.userEmail,
        mobile: fullBookingObj.passenger.mobile,
        amount: fullBookingObj.totalAmount,
        method: fullBookingObj.paymentMethod,
        status: "Success",
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    return true;
  } catch (err) {
    console.error("saveBookingToFirestore error:", err);
    throw err;
  }
};

/**
 * 7. Subscribe to BUS_LOCATIONS Collection (Real-Time GPS Tracking)
 */
export const subscribeToBusLocations = (callback) => {
  if (!db) {
    callback(generateInitialBusLocations(busData));
    return () => {};
  }

  try {
    const locCol = collection(db, "bus_locations");
    const unsubscribe = onSnapshot(
      locCol,
      async (snapshot) => {
        if (snapshot.empty) {
          const initialLocs = generateInitialBusLocations(busData);
          try {
            const seedPromises = initialLocs.map((locObj) =>
              setDoc(doc(db, "bus_locations", locObj.id), locObj)
            );
            await Promise.all(seedPromises);
          } catch (seedErr) {
            console.warn("bus_locations seed error:", seedErr);
            callback(initialLocs);
            return;
          }
          callback(initialLocs);
        } else {
          const locList = [];
          snapshot.forEach((docSnap) => {
            locList.push({ id: docSnap.id, ...docSnap.data() });
          });
          callback(locList);
        }
      },
      (error) => {
        console.warn("bus_locations onSnapshot error:", error);
        callback(generateInitialBusLocations(busData));
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToBusLocations error:", error);
    callback(generateInitialBusLocations(busData));
    return () => {};
  }
};

/**
 * 8. Subscribe to ADMINS Collection (Real-Time)
 */
export const subscribeToAdmins = (callback) => {
  if (!db) {
    callback([
      {
        id: "admin_busvista",
        email: "busvista@gmail.com",
        name: "Master Administrator",
        role: "Super Admin",
        status: "Active",
        permissions: ["all"],
      },
    ]);
    return () => {};
  }

  try {
    const adminsCol = collection(db, "admins");
    const unsubscribe = onSnapshot(
      adminsCol,
      async (snapshot) => {
        if (snapshot.empty) {
          const defaultAdmin = {
            id: "admin_busvista",
            email: "busvista@gmail.com",
            name: "Master Administrator",
            role: "Super Admin",
            status: "Active",
            permissions: ["all", "manage_buses", "manage_routes", "manage_bookings", "manage_users", "view_finances"],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, "admins", defaultAdmin.id), defaultAdmin);
          } catch (err) {
            console.warn("Admins seed warning:", err);
          }
          callback([defaultAdmin]);
        } else {
          const adminList = [];
          snapshot.forEach((docSnap) => {
            adminList.push({ id: docSnap.id, ...docSnap.data() });
          });
          callback(adminList);
        }
      },
      (error) => {
        console.warn("Admins onSnapshot error:", error);
        callback([
          {
            id: "admin_busvista",
            email: "busvista@gmail.com",
            name: "Master Administrator",
            role: "Super Admin",
            status: "Active",
          },
        ]);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error("subscribeToAdmins error:", error);
    callback([]);
    return () => {};
  }
};

/**
 * Bus GPS Location Update
 */
export const updateBusLocationInFirestore = async (locationId, locData) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "bus_locations", String(locationId));
    await updateDoc(docRef, {
      ...locData,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("updateBusLocation error:", err);
    throw err;
  }
};

/**
 * Bus CRUD Actions
 */
export const addBusToFirestore = async (busDataObj) => {
  if (!db) return false;
  try {
    const newId = busDataObj.id || Date.now();
    const docRef = doc(db, "buses", String(newId));
    await setDoc(docRef, {
      ...busDataObj,
      id: newId,
      status: busDataObj.status || "Active",
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("addBus error:", err);
    throw err;
  }
};

export const updateBusInFirestore = async (busId, updatedData) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "buses", String(busId));
    await updateDoc(docRef, {
      ...updatedData,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("updateBus error:", err);
    throw err;
  }
};

export const deleteBusFromFirestore = async (busId) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "buses", String(busId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("deleteBus error:", err);
    throw err;
  }
};

/**
 * Route CRUD Actions
 */
export const addRouteToFirestore = async (routeObj) => {
  if (!db) return false;
  try {
    const routeId =
      routeObj.id ||
      `RT_${routeObj.from.toLowerCase().slice(0, 3)}_${routeObj.to.toLowerCase().slice(0, 3)}_${Date.now()}`;
    const docRef = doc(db, "routes", routeId);
    await setDoc(docRef, {
      ...routeObj,
      id: routeId,
      createdAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("addRoute error:", err);
    throw err;
  }
};

export const updateRouteInFirestore = async (routeId, updatedData) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "routes", String(routeId));
    await updateDoc(docRef, {
      ...updatedData,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("updateRoute error:", err);
    throw err;
  }
};

export const deleteRouteFromFirestore = async (routeId) => {
  if (!db) return false;
  try {
    const docRef = doc(db, "routes", String(routeId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error("deleteRoute error:", err);
    throw err;
  }
};

/**
 * Booking Status Updates
 */
export const updateBookingStatusInFirestore = async (bookingId, newStatus, userId) => {
  if (!db) return false;
  try {
    const mainDocRef = doc(db, "bookings", String(bookingId));
    await updateDoc(mainDocRef, {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });

    if (newStatus === "cancelled" || newStatus === "Refunded") {
      try {
        const paymentDocRef = doc(db, "payments", `PAY_${bookingId}`);
        await updateDoc(paymentDocRef, {
          status: "Refunded",
          lastUpdated: new Date().toISOString(),
        });
      } catch (pe) {}
    }

    if (userId) {
      try {
        const userDocRef = doc(db, "users", userId, "bookings", String(bookingId));
        await updateDoc(userDocRef, {
          status: newStatus,
          lastUpdated: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("User subcollection update note:", e);
      }
    }

    const local = JSON.parse(localStorage.getItem("bookings")) || [];
    const updatedLocal = local.map((b) =>
      (b.bookingId || b.id) === bookingId ? { ...b, status: newStatus } : b
    );
    localStorage.setItem("bookings", JSON.stringify(updatedLocal));

    return true;
  } catch (err) {
    console.error("updateBookingStatus error:", err);
    throw err;
  }
};

/**
 * User Status Updates (e.g. Active, Suspended)
 */
export const updateUserStatusInFirestore = async (userId, newStatus) => {
  if (!db) return false;
  try {
    const userDocRef = doc(db, "users", String(userId));
    await updateDoc(userDocRef, {
      status: newStatus,
      lastUpdated: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error("updateUserStatus error:", err);
    throw err;
  }
};
