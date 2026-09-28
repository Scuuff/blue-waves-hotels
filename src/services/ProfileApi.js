const API_BASE = "http://localhost:5050/api";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export async function getMyProfile() {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  return data;
}

export async function updateMyProfile(profileData) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}

export async function changeMyPassword(passwordData) {
  const token = getToken();

  const res = await fetch(`${API_BASE}/profile/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(passwordData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update password");
  }

  return data;
}

export async function getMyBookings() {
  const token = getToken();

  const res = await fetch(`${API_BASE}/bookings/my-bookings`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch bookings");
  }

  return data;
}

export async function cancelMyBooking(bookingId) {
  const token = getToken();

  const requestOptions = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  const cancelResponse = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, requestOptions);
  const cancelData = await cancelResponse.json();

  if (cancelResponse.ok) {
    return cancelData;
  }

  const fallbackResponse = await fetch(`${API_BASE}/bookings/${bookingId}`, {
    ...requestOptions,
    body: JSON.stringify({
      status: "Cancelled",
      cancelledAt: new Date().toISOString(),
    }),
  });

  const fallbackData = await fallbackResponse.json();

  if (!fallbackResponse.ok) {
    throw new Error(cancelData.message || fallbackData.message || "Failed to cancel booking");
  }

  return fallbackData;
}
