const BOOKINGS_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL?.trim()) ||
  (typeof window !== "undefined" && window.location?.origin
    ? window.location.origin
    : "http://localhost:5050");

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export async function createBooking(payload, token) {
  let response;

  try {
    response = await fetch(`${BOOKINGS_BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Cannot connect to the booking server. Make sure the backend is running on port 5050.");
  }

  return parseResponse(response);
}

export async function getMyBookings(token = getToken()) {
  let response;

  try {
    response = await fetch(`${BOOKINGS_BASE_URL}/api/bookings/my-bookings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("Cannot connect to the booking server. Make sure the backend is running on port 5050.");
  }

  return parseResponse(response);
}

export async function cancelMyBooking(bookingId, token = getToken()) {
  let response;

  try {
    response = await fetch(`${BOOKINGS_BASE_URL}/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error("Cannot connect to the booking server. Make sure the backend is running on port 5050.");
  }

  return parseResponse(response);
}
