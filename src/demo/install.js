// Demo mode wiring: routes the app's API calls to demo/server.js instead of
// the network, and shows a small badge with the demo logins.
//
// The app talks to the API in several ways (http://localhost:5050/api/...,
// /api/..., `${origin}/api/...`, and axios), so we intercept at fetch and at
// axios' adapter. Anything that isn't an API call (images, fonts, map tiles)
// goes to the real network untouched.

import axios, { AxiosError } from "axios";
import { handle } from "./server.js";
import { DEMO_ACCOUNTS, resetDemo } from "./db.js";

const LATENCY_MS = 180; // feel like a real server, not an instant mock

function toApiPath(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl, window.location.href);
  } catch {
    return null;
  }
  const isBackendHost = url.host === "localhost:5050";
  const isSameOrigin = url.origin === window.location.origin;
  if (!isBackendHost && !isSameOrigin) return null;

  let path = url.pathname;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (base && path.startsWith(`${base}/api/`)) path = path.slice(base.length);
  if (path.startsWith("/api/")) path = path.slice(4);
  else if (!isBackendHost) return null;

  return { path, query: Object.fromEntries(url.searchParams) };
}

function lowerHeaders(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) return Object.fromEntries([...headers.entries()]);
  return Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
}

function parseBody(body) {
  if (body == null || body === "") return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

async function respond({ method, rawUrl, headers, body }) {
  const target = toApiPath(rawUrl);
  if (!target) return null;
  await wait();
  const result = handle({
    method: String(method || "GET").toUpperCase(),
    path: target.path,
    query: target.query,
    headers: lowerHeaders(headers),
    body: parseBody(body),
  }) || { status: 404, body: { message: `Cannot ${method} /api${target.path}` } };
  return result;
}

function patchFetch() {
  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const isRequest = typeof Request !== "undefined" && input instanceof Request;
    const rawUrl = isRequest ? input.url : String(input);
    if (!toApiPath(rawUrl)) return realFetch(input, init);

    const method = init.method || (isRequest ? input.method : "GET");
    const headers = init.headers || (isRequest ? input.headers : undefined);
    const body = init.body ?? (isRequest && method !== "GET" ? await input.clone().text() : undefined);

    const result = await respond({ method, rawUrl, headers, body });
    return new Response(result.status === 204 ? null : JSON.stringify(result.body), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  };
}

function patchAxios() {
  const defaultAdapter = axios.getAdapter(axios.defaults.adapter);
  axios.defaults.adapter = async (config) => {
    const rawUrl = axios.getUri(config);
    if (!toApiPath(rawUrl)) return defaultAdapter(config);

    const result = await respond({ method: config.method, rawUrl, headers: config.headers?.toJSON?.() || config.headers, body: config.data });
    const response = { data: result.body, status: result.status, statusText: String(result.status), headers: {}, config, request: {} };
    const valid = config.validateStatus ? config.validateStatus(result.status) : result.status < 400;
    if (valid) return response;
    throw new AxiosError(
      `Request failed with status code ${result.status}`,
      result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      response.request,
      response
    );
  };
}

function showBadge() {
  const box = document.createElement("div");
  box.id = "bw-demo-badge";
  box.innerHTML = `
    <style>
      #bw-demo-badge { position: fixed; right: 96px; bottom: 24px; z-index: 2147483000; font: 500 13px/1.4 system-ui, sans-serif; }
      #bw-demo-badge button.pill { border: 0; cursor: pointer; border-radius: 999px; padding: 8px 14px; background: #16283c; color: #fff; box-shadow: 0 6px 20px rgba(0,0,0,.25); font: inherit; }
      #bw-demo-badge .pill i { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #4ade80; margin-right: 8px; }
      #bw-demo-badge .card { display: none; position: absolute; right: 0; bottom: 46px; width: 290px; background: #fff; color: #16283c; border-radius: 14px; padding: 16px; box-shadow: 0 12px 40px rgba(0,0,0,.25); }
      #bw-demo-badge.open .card { display: block; }
      #bw-demo-badge h4 { margin: 0 0 6px; font-size: 14px; }
      #bw-demo-badge p { margin: 0 0 10px; color: #3c5068; font-size: 12px; }
      #bw-demo-badge code { display: block; background: #f2f7fc; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; font-size: 12px; user-select: all; }
      #bw-demo-badge .reset { border: 1px solid #c9d6e3; background: none; border-radius: 8px; padding: 6px 10px; cursor: pointer; font: inherit; font-size: 12px; color: #2f6fb3; }
    </style>
    <div class="card" role="dialog" aria-label="Demo information">
      <h4>Live demo</h4>
      <p>Everything works, but data is saved only in your browser. Try these accounts:</p>
      <code><b>Guest</b><br>${DEMO_ACCOUNTS.guest.email}<br>${DEMO_ACCOUNTS.guest.password}</code>
      <code><b>Admin</b><br>${DEMO_ACCOUNTS.admin.email}<br>${DEMO_ACCOUNTS.admin.password}</code>
      <button class="reset" type="button">Reset demo data</button>
    </div>
    <button class="pill" type="button" aria-expanded="false"><i></i>Live demo · logins</button>`;
  const pill = box.querySelector(".pill");
  pill.addEventListener("click", () => {
    const open = box.classList.toggle("open");
    pill.setAttribute("aria-expanded", String(open));
  });
  box.querySelector(".reset").addEventListener("click", () => {
    resetDemo();
    ["token", "user"].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    window.location.reload();
  });
  document.body.appendChild(box);
}

export function installDemo() {
  patchFetch();
  patchAxios();
  if (document.body) showBadge();
  else window.addEventListener("DOMContentLoaded", showBadge);
}
