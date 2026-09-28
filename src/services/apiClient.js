import { getCurrentAdminIdentity } from "../utils/currentAdminIdentity";

function resolveApiBase() {
  const envBase = import.meta.env.VITE_PUNISHMENT_API_URL;
  if (typeof envBase === "string" && envBase.trim().length > 0) {
    return envBase.replace(/\/+$/, "");
  }

  // Prefer same-origin API path to avoid mixed-content and CORS issues.
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api`;
  }

  return "http://localhost:5050/api";
}

const API_BASE = resolveApiBase();

function buildHeaders(extraHeaders = {}) {
  const actor = getCurrentAdminIdentity();
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || sessionStorage.getItem("token")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "x-actor-id": actor.userId,
    "x-actor-role": actor.role,
    "x-actor-name": actor.name,
    ...extraHeaders,
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message ?? `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function apiGet(path, headers = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "GET",
      headers: buildHeaders(headers),
    });
  } catch {
    throw new Error("Cannot connect to Punishment API. Ensure backend is running and API URL is correct.");
  }
  return parseResponse(response);
}

export async function apiPost(path, body = {}, headers = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot connect to Punishment API. Ensure backend is running and API URL is correct.");
  }
  return parseResponse(response);
}

export async function apiPatch(path, body = {}, headers = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "PATCH",
      headers: buildHeaders(headers),
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Cannot connect to Punishment API. Ensure backend is running and API URL is correct.");
  }
  return parseResponse(response);
}

export async function apiDelete(path, headers = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "DELETE",
      headers: buildHeaders(headers),
    });
  } catch {
    throw new Error("Cannot connect to Punishment API. Ensure backend is running and API URL is correct.");
  }
  return parseResponse(response);
}

export function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  return query.toString();
}
