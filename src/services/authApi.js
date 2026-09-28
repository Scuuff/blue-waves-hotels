// Auth API Client - Uses direct backend URL, not the admin/punishment API
const AUTH_BASE_URL = "http://localhost:5050";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function authFetch(path, options = {}) {
  const response = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.includeAuth !== false && getToken()
        ? { Authorization: `Bearer ${getToken()}` }
        : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || data?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register(payload) {
    return authFetch("/api/auth/register", {
      method: "POST",
      body: payload,
      includeAuth: false,
    });
  },

  login(payload) {
    return authFetch("/api/auth/login", {
      method: "POST",
      body: payload,
      includeAuth: false,
    });
  },

  logout() {
    return authFetch("/api/auth/logout", {
      method: "POST",
    });
  },

  me() {
    return authFetch("/api/auth/me", {
      method: "GET",
    });
  },
};
