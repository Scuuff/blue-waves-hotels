import { useCallback, useEffect, useState } from "react";

const API_URL = "/api/bookings";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function buildHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function normalizeBooking(booking) {
  return {
    ...booking,
    id: booking._id || booking.id,
    status: booking.status || "Pending",
    notes: booking.notes || `Room: ${booking.roomName || "Room"}`,
    payment: booking.payment?.length ? booking.payment : ["Booking created"],
  };
}

export default function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetch(API_URL, {
        headers: buildHeaders(),
      }).then(parseResponse);

      setBookings(data.map(normalizeBooking));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const updateStatus = async (id, status) => {
    const updatedBooking = await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify({ status }),
    }).then(parseResponse);

    const normalizedBooking = normalizeBooking(updatedBooking);
    setBookings(prev =>
      prev.map(booking => (booking.id === id ? normalizedBooking : booking))
    );

    return normalizedBooking;
  };

  const approveBooking = async (id) => {
    const booking = await updateStatus(id, "Confirmed");
    alert(`${booking.name} has been approved`);
  };

  const cancelBooking = async (id) => {
    const booking = await updateStatus(id, "Cancelled");
    alert(`${booking.name} has been cancelled`);
  };

  const addBooking = async (bookingData) => {
    const createdBooking = await fetch(API_URL, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(bookingData),
    }).then(parseResponse);

    setBookings(prev => [normalizeBooking(createdBooking), ...prev]);
  };

  const deleteBooking = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: buildHeaders(),
    }).then(parseResponse);

    setBookings(prev => prev.filter(booking => booking.id !== id));
  };

  return {
    bookings,
    loading,
    error,
    approveBooking,
    cancelBooking,
    updateStatus,
    addBooking,
    deleteBooking,
    refreshBookings: loadBookings,
  };
}
