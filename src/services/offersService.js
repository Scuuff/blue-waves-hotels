const BASE_URL = "http://localhost:5050/api/offers";

// Helper — reads the JWT token saved by LoginPage after a successful login
const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

// Helper — builds Authorization header for admin requests
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken() || ""}`,
});

async function parseOfferResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.message ||
      data?.errors?.[0]?.msg ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }
  return data;
}

// ─── PUBLIC ───────────────────────────────────────────────

// GET all offers
export const fetchOffers = async () => {
  const res = await fetch(BASE_URL);
  return parseOfferResponse(res);
};

// GET single offer
export const fetchOfferById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  return parseOfferResponse(res);
};

// ─── ADMIN (protected) ────────────────────────────────────

// POST — create new offer
export const createOffer = async (offerData) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(offerData),
  });
  return parseOfferResponse(res);
};

// PUT — update offer
export const updateOffer = async (id, offerData) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(offerData),
  });
  return parseOfferResponse(res);
};

// PATCH — toggle active/inactive
export const toggleOffer = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  return parseOfferResponse(res);
};

// DELETE — remove offer
export const deleteOffer = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return parseOfferResponse(res);
};
