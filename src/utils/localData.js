import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const serviceKeys = {
  buses: "bookings",
  hotels: "hotelBookings",
  trains: "trainBookings",
  flights: "flightBookings",
};

export const readStoredArray = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
    console.warn(`Stored data for "${key}" is not an array.`);
  } catch (error) {
    console.warn(`Unable to read stored data for "${key}":`, error);
  }
  return [];
};

export const writeStoredArray = (key, records) => {
  try {
    localStorage.setItem(key, JSON.stringify(records));
    return true;
  } catch (error) {
    console.error(`Unable to save stored data for "${key}":`, error);
    return false;
  }
};

export const readStoredObject = (key) => {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : null;
  } catch (error) {
    console.warn(`Unable to read stored data for "${key}":`, error);
    return null;
  }
};

export const writeStoredObject = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Unable to save stored data for "${key}":`, error);
    return false;
  }
};

export const readPendingBooking = () => {
  try {
    const value = sessionStorage.getItem("pendingBooking");
    if (!value) return null;
    return JSON.parse(value);
  } catch (error) {
    console.warn("Unable to read the pending booking:", error);
    return null;
  }
};

export const savePendingBooking = (booking) => {
  try {
    sessionStorage.setItem("pendingBooking", JSON.stringify(booking));
  } catch (error) {
    console.error("Unable to save the pending booking:", error);
    throw new Error(
      "Unable to preserve booking details for the confirmation page.",
      { cause: error },
    );
  }
};

export const mergeRecords = (...recordSets) => {
  const records = new Map();
  for (const recordSet of recordSets) {
    for (const record of recordSet) {
      const id = record.bookingId || record.id || record.pnr;
      if (!id) continue;
      const key = String(id);
      const existing = records.get(key);
      if (!existing) {
        records.set(key, record);
        continue;
      }

      const existingTime = new Date(
        existing.lastUpdated || existing.updatedAt || existing.createdAt || 0,
      ).getTime();
      const incomingTime = new Date(
        record.lastUpdated || record.updatedAt || record.createdAt || 0,
      ).getTime();
      const newerRecord = incomingTime >= existingTime ? record : existing;
      const olderRecord = incomingTime >= existingTime ? existing : record;
      records.set(key, { ...olderRecord, ...newerRecord });
    }
  }
  return Array.from(records.values()).sort((a, b) => {
    const dateA = new Date(a.createdAt || a.bookingDate || 0).getTime();
    const dateB = new Date(b.createdAt || b.bookingDate || 0).getTime();
    return dateB - dateA;
  });
};

export const updateStoredBookingStatus = (booking, service, status) => {
  const collectionName = serviceKeys[service];
  if (!collectionName) throw new Error(`Unknown booking service: ${service}`);

  const updatedBooking = {
    ...booking,
    status,
    lastUpdated: new Date().toISOString(),
  };
  const keys = new Set([collectionName, "bookings"]);
  if (booking.userId) keys.add(`${collectionName}_${booking.userId}`);

  let saved = true;
  for (const key of keys) {
    const records = readStoredArray(key);
    const updatedRecords = mergeRecords(
      records.map((record) =>
        String(record.bookingId || record.id) ===
        String(booking.bookingId || booking.id)
          ? updatedBooking
          : record,
      ),
      [updatedBooking],
    );
    saved = writeStoredArray(key, updatedRecords) && saved;
  }
  return saved;
};

export const persistBooking = async (booking, service, payment) => {
  const collectionName = serviceKeys[service];
  if (!collectionName) throw new Error(`Unknown booking service: ${service}`);

  const localKeys = new Set([collectionName, "bookings"]);
  if (booking.userId) {
    localKeys.add(`${collectionName}_${booking.userId}`);
  }

  let localSaved = true;
  for (const key of localKeys) {
    const records = readStoredArray(key);
    const merged = mergeRecords(records, [booking]);
    localSaved = writeStoredArray(key, merged) && localSaved;
  }
  if (!localSaved) {
    console.error("One or more local booking copies could not be saved.");
  }

  let remoteSaved = false;
  let syncError = null;
  if (db) {
    try {
      const bookingId = String(booking.bookingId || booking.id);
      const writes = [
        setDoc(doc(db, "bookings", bookingId), booking, { merge: true }),
      ];

      if (booking.userId) {
        writes.push(
          setDoc(
            doc(db, "users", booking.userId, collectionName, bookingId),
            booking,
            { merge: true },
          ),
        );
      }

      if (payment) {
        writes.push(
          setDoc(doc(db, "payments", String(payment.paymentId)), payment, {
            merge: true,
          }),
        );
      }

      await Promise.all(writes);
      remoteSaved = true;
    } catch (error) {
      syncError = error;
      console.error("Unable to sync booking with Firestore:", error);
    }
  }

  return { localSaved, remoteSaved, syncError };
};
