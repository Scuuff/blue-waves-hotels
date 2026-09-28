// Single source of truth for "is this offer still live?".
//
// An offer carries two independent signals:
//   - `active`     — a manual on/off switch the admin toggles with Pause/Activate
//   - `expiryDate` — the date the deal stops being valid
//
// An offer is only bookable when BOTH agree. Reading just one of them is what
// let the admin page show "Active" for offers the user page had already
// labelled "Offer Expired".

// Returns a valid Date, or null when the offer has no usable expiry.
export function getOfferExpiry(offer) {
  const raw = offer?.expiryDate ?? offer?.expiresAt;
  if (!raw) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// A missing or unparseable date counts as expired — we never want a broken
// date to read as "still available" and leave a bookable price on screen.
export function isOfferExpired(offer, now = Date.now()) {
  const expiry = getOfferExpiry(offer);
  if (!expiry) return true;
  return expiry.getTime() <= now;
}

// The rule the whole app shares: switched on AND not past its date.
export function isOfferLive(offer, now = Date.now()) {
  return Boolean(offer?.active) && !isOfferExpired(offer, now);
}

// "expired" | "paused" | "active" — expiry wins, since a paused offer that is
// also out of date is expired for every practical purpose.
export function getOfferStatus(offer, now = Date.now()) {
  if (isOfferExpired(offer, now)) return "expired";
  return offer?.active ? "active" : "paused";
}
