// Demo-mode API: the Express routes from backend/ re-implemented in the browser
// on top of demo/db.js. Response shapes and status codes follow the real
// controllers so the React app can't tell the difference.

import { db, save, newId, isObjectId } from "./db.js";

const DAY = 24 * 60 * 60 * 1000;
const nowIso = () => new Date().toISOString();

// ---------- helpers ----------

const json = (status, body) => ({ status, body });
const ok = (body) => json(200, body);
const created = (body) => json(201, body);
const noContent = () => json(204, null);
const notFound = (message = "Not found") => json(404, { message });

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const branchMatches = (branch = "", value = "") => {
  const base = String(branch).trim().replace(/\s+Branch$/i, "");
  return new RegExp(`^${escapeRegex(base)}(?:\\s+Branch)?$`, "i").test(String(value || ""));
};
const includesI = (haystack, needle) =>
  String(haystack || "").toLowerCase().includes(String(needle || "").toLowerCase());
const sameI = (a, b) => String(a || "").toLowerCase() === String(b || "").toLowerCase();

const dateOnly = (value) => {
  if (!value) return null;
  const d = new Date(`${String(value).split("T")[0]}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};
const stayDateKeys = (checkIn, checkOut) => {
  const keys = [];
  const cur = dateOnly(checkIn);
  const end = dateOnly(checkOut);
  if (!cur || !end || cur >= end) return keys;
  while (cur < end) {
    keys.push(cur.toISOString().split("T")[0]);
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return keys;
};
const hasManualBlock = (room, keys) => keys.some((k) => room?.dateStatuses?.[k] === "reserved");
const isCancelled = (status) => sameI(status, "cancelled");

const sortRooms = (rooms, sortBy = "") => {
  const list = [...rooms];
  if (sortBy === "low-high") list.sort((a, b) => a.price - b.price);
  else if (sortBy === "high-low") list.sort((a, b) => b.price - a.price);
  else if (sortBy === "rating" || sortBy === "popularity") list.sort((a, b) => b.rating - a.rating);
  else list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return list;
};

const bookingRoomId = (b) => b?.roomId || b?.room || b?.roomKey || null;

const overlapping = (checkIn, checkOut) =>
  db().bookings.filter(
    (b) =>
      !isCancelled(b.status) &&
      new Date(b.checkIn) < new Date(checkOut) &&
      new Date(b.checkOut) > new Date(checkIn)
  );

const validateStay = (checkIn, checkOut) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    return json(400, { message: "Invalid date format" });
  }
  if (inDate < today || outDate < today) {
    return json(400, { message: "You cannot search using past dates" });
  }
  if (outDate <= inDate) {
    return json(400, { message: "Check-out date must be after check-in date" });
  }
  return null;
};

// ---------- auth ----------

const makeToken = (user) => `demo.${user._id}.${Date.now().toString(36)}`;

function currentUser(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  const [, userId] = header.slice(7).split(".");
  const user = db().users.find((u) => u._id === userId);
  return user ? { userId: user._id, role: user.role, user } : null;
}

const protect = (handler) => (req) => {
  const auth = currentUser(req);
  if (!auth) return json(401, { message: req.headers.authorization ? "Invalid token" : "No token provided" });
  req.user = auth;
  return handler(req);
};
const adminOnly = (handler) =>
  protect((req) => (req.user.role === "admin" ? handler(req) : json(403, { message: "Forbidden" })));

const userResponse = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  fullName: `${u.firstName} ${u.lastName}`.trim(),
  email: u.email,
  phone: u.phone,
  role: u.role,
  status: u.status,
});

function profileFor(userId) {
  const data = db();
  let profile = data.profiles.find((p) => p.userId === userId);
  if (!profile) {
    profile = { userId, countryCode: "+20", address: "", city: "", country: "", dob: "", avatar: "", bio: "", activityHistory: [], createdAt: nowIso(), updatedAt: nowIso() };
    data.profiles.push(profile);
  }
  return profile;
}

function addActivity(userId, activity) {
  const profile = profileFor(userId);
  profile.activityHistory = [{ ...activity, createdAt: nowIso() }, ...(profile.activityHistory || [])].slice(0, 50);
  profile.updatedAt = nowIso();
}

const adminUserResponse = (u) => {
  const p = db().profiles.find((profile) => profile.userId === u._id);
  return {
    ...userResponse(u),
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt || null,
    address: p?.address || u.address || "",
    city: p?.city || u.city || "",
    country: p?.country || u.country || "",
    avatar:
      p?.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${u.firstName}${u.lastName}` || u.email)}`,
    activityHistory: p?.activityHistory || [],
  };
};

function register({ body }) {
  const { firstName, lastName, email, phone, password } = body;
  const errors = [];
  if (!firstName || String(firstName).trim().length < 2) errors.push({ msg: "First name must be at least 2 characters", path: "firstName" });
  if (!lastName || String(lastName).trim().length < 2) errors.push({ msg: "Last name must be at least 2 characters", path: "lastName" });
  if (!/^\S+@\S+\.\S+$/.test(String(email || ""))) errors.push({ msg: "Invalid email address", path: "email" });
  if (!phone) errors.push({ msg: "Phone is required", path: "phone" });
  if (!password || String(password).length < 6) errors.push({ msg: "Password must be at least 6 characters", path: "password" });
  if (errors.length) return json(400, { errors });

  const data = db();
  if (data.users.some((u) => sameI(u.email, email))) return json(400, { message: "Email already registered" });

  const user = {
    _id: newId(), firstName: String(firstName).trim(), lastName: String(lastName).trim(),
    email: String(email).trim().toLowerCase(), phone: String(phone).trim(), password: String(password),
    role: "user", status: "active", favorites: [], createdAt: nowIso(), updatedAt: nowIso(),
  };
  data.users.push(user);
  save();
  return created({ message: "User registered successfully", token: makeToken(user), user: userResponse(user) });
}

function login({ body }) {
  const { email, password } = body;
  if (!email || !password) return json(400, { errors: [{ msg: "Email and password are required" }] });
  const user = db().users.find((u) => sameI(u.email, email));
  if (!user || user.password !== String(password)) return json(401, { message: "Invalid credentials" });
  user.lastLoginAt = nowIso();
  addActivity(user._id, { type: "login", title: "User logged in", description: "User logged into the system.", metadata: { loginAt: nowIso() } });
  save();
  return ok({ message: "Login successful", token: makeToken(user), user: userResponse(user) });
}

function createUserByAdmin({ body }) {
  const { firstName, lastName, email, phone, address = "", role = "staff" } = body;
  if (!firstName || !lastName || !email || !phone) {
    return json(400, { message: "First name, last name, email, and phone are required" });
  }
  const data = db();
  if (data.users.some((u) => sameI(u.email, email))) return json(400, { message: "Email already registered" });
  const temporaryPassword = newId().slice(0, 10);
  const user = {
    _id: newId(), firstName, lastName, email: String(email).toLowerCase(), phone, password: temporaryPassword,
    role: ["admin", "staff"].includes(String(role).toLowerCase()) ? "admin" : "user",
    status: "active", favorites: [], createdAt: nowIso(), updatedAt: nowIso(),
  };
  data.users.push(user);
  Object.assign(profileFor(user._id), { address });
  addActivity(user._id, { type: "staff_added", title: "Staff member added", description: `${firstName} ${lastName} was added by an admin.`, metadata: { email, role: user.role } });
  save();
  return created({ message: "User created successfully", temporaryPassword, user: adminUserResponse(user) });
}

function updateUserStatus({ params, body }) {
  const user = db().users.find((u) => u._id === params.id);
  if (!user) return notFound("User not found");
  const previousStatus = user.status;
  const requested = String(body.status || "").toLowerCase();
  user.status = ["active", "blocked"].includes(requested) ? requested : previousStatus === "active" ? "blocked" : "active";
  user.updatedAt = nowIso();
  addActivity(user._id, {
    type: "status_changed",
    title: user.status === "blocked" ? "User blocked" : "User unblocked",
    description: `Account status changed to ${user.status}.`,
    metadata: { previousStatus, nextStatus: user.status },
  });
  save();
  return ok({ message: `User ${user.status === "blocked" ? "blocked" : "unblocked"} successfully`, user: adminUserResponse(user) });
}

// ---------- hotels ----------

function listHotels({ query }) {
  let list = [...db().hotels];
  if (query.search) list = list.filter((h) => includesI(h.name, query.search) || includesI(h.address, query.search));
  if (query.city && query.city !== "all") list = list.filter((h) => h.city === query.city);
  if (query.status && query.status !== "all") list = list.filter((h) => h.status === query.status);
  list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return ok({ count: list.length, hotels: list });
}

function validateHotel(body) {
  const errors = [];
  if (!body.name) errors.push({ msg: "Branch name is required", path: "name" });
  if (!body.city) errors.push({ msg: "City is required", path: "city" });
  if (!body.address) errors.push({ msg: "Address is required", path: "address" });
  return errors.length ? json(400, { errors }) : null;
}

function listingRooms({ query }) {
  let rooms = [];
  db().hotels
    .filter((h) => h.status === "Active")
    .forEach((hotel) =>
      (hotel.rooms || []).forEach((room) =>
        rooms.push({
          _id: room._id, hotelId: hotel._id, hotelName: hotel.hotelName, branch: hotel.name, city: hotel.city,
          location: hotel.address, status: hotel.status, roomName: room.roomName, type: room.type, price: room.price,
          rating: room.rating ?? hotel.rating ?? 0, guests: room.guests, beds: room.beds, baths: room.baths,
          size: room.size ?? 0, available: room.available, featured: room.featured, image: room.image || hotel.image,
          amenities: room.amenities?.length ? room.amenities : hotel.amenities, description: hotel.description,
          phone: hotel.phone, email: hotel.email, checkIn: query.checkIn || "", checkOut: query.checkOut || "",
        })
      )
    );
  rooms = rooms.filter((r) => r.available === true);
  if (query.branch?.trim()) rooms = rooms.filter((r) => sameI(r.branch, query.branch));
  if (query.guests && !Number.isNaN(parseInt(query.guests, 10))) rooms = rooms.filter((r) => r.guests >= parseInt(query.guests, 10));
  return ok({ count: rooms.length, rooms });
}

// ---------- rooms ----------

const normalizeRoomPayload = (body = {}) => {
  const status = body.status === "Occupied" || body.status === "Maintenance" ? body.status : "Available";
  const dateStatuses = Object.fromEntries(
    Object.entries(body.dateStatuses || {}).map(([k, v]) => [k, v === "reserved" ? "reserved" : "available"])
  );
  return { ...body, status, available: status === "Available", dateStatuses };
};

function userSearchRooms({ query }) {
  const { destination, branch, roomType, type, guests, maxPrice, rating, sortBy, checkIn, checkOut } = query;
  const hasStay = Boolean(checkIn && checkOut);
  let rooms = [...db().rooms];

  if (branch) rooms = rooms.filter((r) => branchMatches(branch, r.branch));
  if (roomType || type) rooms = rooms.filter((r) => sameI(r.type, (roomType || type).trim()));
  if (guests) rooms = rooms.filter((r) => r.guests >= Number(guests));
  if (maxPrice && !Number.isNaN(Number(maxPrice))) rooms = rooms.filter((r) => r.price <= Number(maxPrice));
  if (rating) rooms = rooms.filter((r) => r.rating >= Number(rating));
  if (destination) {
    const k = destination.trim();
    rooms = rooms.filter((r) => ["hotelName", "branch", "city", "location", "roomName", "type"].some((f) => includesI(r[f], k)));
  }

  if (!hasStay) {
    rooms = rooms.filter((r) => r.available !== false && (!r.status || r.status === "Available"));
    return ok(sortRooms(rooms, sortBy));
  }

  const invalid = validateStay(checkIn, checkOut);
  if (invalid) return invalid;

  rooms = rooms.filter((r) => !sameI(r.status, "maintenance"));
  const keys = stayDateKeys(checkIn, checkOut);
  const free = rooms.filter((r) => !hasManualBlock(r, keys));
  const clashes = overlapping(checkIn, checkOut).filter((b) =>
    free.some((r) => String(bookingRoomId(b)) === r._id || b.roomName === r.roomName)
  );
  const booked = new Set(clashes.flatMap((b) => [bookingRoomId(b), b.roomName]).filter(Boolean).map(String));
  const available = free.filter((r) => !booked.has(r._id) && !booked.has(r.roomName));

  if (available.length === 0 && clashes.length > 0) {
    return json(409, { message: "This room is reserved during the selected period. Please change the dates and try again.", available: false });
  }
  return ok(sortRooms(available, sortBy));
}

// ---------- bookings ----------

const withUser = (booking) => {
  const u = db().users.find((user) => user._id === booking.userId);
  return { ...booking, userId: u ? { _id: u._id, firstName: u.firstName, email: u.email } : booking.userId ?? null };
};

function searchAvailability({ body }) {
  const { branch, roomType, roomId, roomName, checkIn, checkOut, guests } = body;
  if ((!branch && !roomId && !roomName) || !checkIn || !checkOut || !guests) {
    return json(400, { message: "Room details, check-in, check-out, and guests are required" });
  }
  const invalid = validateStay(checkIn, checkOut);
  if (invalid) return invalid;
  const guestNumber = Number(guests);
  if (!Number.isFinite(guestNumber) || guestNumber < 1) return json(400, { message: "Guests must be a valid number" });

  let rooms = db().rooms.filter((r) => r.guests >= guestNumber && !sameI(r.status, "maintenance"));
  if (roomId && isObjectId(roomId)) rooms = rooms.filter((r) => r._id === roomId);
  else if (roomName?.trim()) {
    rooms = rooms.filter((r) => sameI(r.roomName, roomName.trim()));
    if (branch) rooms = rooms.filter((r) => branchMatches(branch, r.branch));
  } else if (branch) rooms = rooms.filter((r) => branchMatches(branch, r.branch));
  if (roomType?.trim()) rooms = rooms.filter((r) => sameI(r.type, roomType.trim()));

  const keys = stayDateKeys(checkIn, checkOut);
  const free = rooms.filter((r) => !hasManualBlock(r, keys));
  const clashes = overlapping(checkIn, checkOut).filter((b) =>
    free.length
      ? free.some((r) => String(bookingRoomId(b)) === r._id || b.roomName === r.roomName)
      : (roomId && String(bookingRoomId(b)) === String(roomId)) ||
        (roomName && sameI(b.roomName, roomName)) ||
        (branch && branchMatches(branch, b.branch))
  );
  const booked = new Set(clashes.flatMap((b) => [bookingRoomId(b), b.roomName]).filter(Boolean).map(String));
  const available = free.filter((r) => !booked.has(r._id) && !booked.has(r.roomName));

  if (available.length === 0) {
    return clashes.length
      ? json(409, { message: "This room is already reserved for the selected dates. Please choose different dates.", available: false })
      : json(404, { message: "Selected dates are unavailable for this room.", available: false });
  }
  return ok({ message: "Dates are available", available: true, data: { branch, roomType, checkIn, checkOut, guests }, rooms: available });
}

function createBooking(req) {
  const { roomId, room: roomField, name, email, phone, roomKey: incomingKey, ...rest } = req.body;
  if (!name || !email || !phone) return json(400, { message: "Missing required fields" });
  if (!rest.checkIn || !rest.checkOut) return json(500, { message: "Booking validation failed: checkIn and checkOut are required" });

  const resolvedId = roomId || roomField;
  const data = db();
  let room = null;
  if (resolvedId) {
    room = isObjectId(resolvedId)
      ? data.rooms.find((r) => r._id === resolvedId)
      : data.rooms.find(
          (r) => (!rest.roomName || sameI(r.roomName, rest.roomName)) && (!rest.branch || sameI(r.branch, rest.branch))
        ) || null;
  }

  const nights =
    Number(rest.nights) || Math.max(1, Math.ceil((new Date(rest.checkOut) - new Date(rest.checkIn)) / DAY));
  const booking = {
    _id: newId(),
    name, email: String(email).toLowerCase(), phone,
    ...rest,
    room: room?._id,
    roomId: room?._id || (isObjectId(resolvedId) ? resolvedId : undefined),
    roomKey: String(incomingKey || resolvedId || room?._id || ""),
    confirmationCode: rest.confirmationCode || `BW-${Date.now().toString(36).toUpperCase()}`,
    image: rest.image || room?.image || "",
    hotelName: rest.hotelName || room?.hotelName || "Blue Wave Hotel",
    branch: rest.branch || room?.branch || "",
    city: rest.city || room?.city || "",
    location: rest.location || room?.location || "",
    roomName: rest.roomName || room?.roomName || "",
    roomType: rest.roomType || room?.type || "",
    beds: rest.beds || room?.beds || 1,
    baths: rest.baths || room?.baths || 1,
    size: rest.size || room?.size || 1,
    description: rest.description || room?.description || "",
    amenities: rest.amenities || room?.amenities || [],
    guests: rest.guests || room?.guests || 1,
    price: rest.price ?? room?.price ?? 0,
    nights,
    total: Number(rest.total ?? (room?.price || 0) * nights),
    paymentMethod: ["card", "google", "apple", "paypal"].includes(rest.paymentMethod) ? rest.paymentMethod : "card",
    status: rest.status || "Confirmed",
    cancelledAt: null,
    userId: req.user.userId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  data.bookings.push(booking);
  addActivity(req.user.userId, {
    type: "booking_created", title: "Booking created",
    description: `${booking.roomName || "Room"} at ${booking.branch || "Blue Wave Branch"} was booked.`,
    metadata: { bookingId: booking._id, confirmationCode: booking.confirmationCode, total: booking.total },
  });
  save();
  return created(booking);
}

function myBookings(req) {
  const data = db();
  const list = data.bookings
    .filter((b) => b.userId === req.user.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((b) => {
      const room = data.rooms.find((r) => r._id === String(bookingRoomId(b)));
      return {
        ...b,
        roomId: bookingRoomId(b) || "",
        image: b.image || room?.image || "",
        branch: b.branch || room?.branch || "",
        roomName: b.roomName || room?.roomName || "",
        guests: b.guests || room?.guests || 1,
        price: b.price ?? room?.price ?? 0,
      };
    });
  return ok(list);
}

function cancelMyBooking(req) {
  const booking = db().bookings.find((b) => b._id === req.params.id && b.userId === req.user.userId);
  if (!booking) return notFound("Booking not found");
  Object.assign(booking, { status: "Cancelled", cancelledAt: nowIso(), updatedAt: nowIso() });
  addActivity(req.user.userId, {
    type: "booking_cancelled", title: "Booking cancelled",
    description: `${booking.roomName || "Room"} at ${booking.branch || "Blue Wave Branch"} was cancelled.`,
    metadata: { bookingId: booking._id, confirmationCode: booking.confirmationCode },
  });
  save();
  return ok({ message: "Booking cancelled successfully", booking });
}

// ---------- profile ----------

function bookingSnapshot(b) {
  const checkOut = b.checkOut ? new Date(b.checkOut) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const status = isCancelled(b.status) ? "cancelled" : checkOut && checkOut < today ? "completed" : "upcoming";
  return {
    bookingId: b._id, roomId: String(bookingRoomId(b) || ""), roomName: b.roomName || "",
    hotelName: b.hotelName || "Blue Wave Hotel", branch: b.branch || "", city: b.city || "",
    location: b.location || "", image: b.image || "", roomType: b.roomType || "",
    beds: Number(b.beds) || 1, baths: Number(b.baths) || 1, size: Number(b.size) || 1,
    description: b.description || "", amenities: Array.isArray(b.amenities) ? b.amenities : [],
    bookedBy: { name: b.name || "", email: b.email || "", phone: b.phone || "" },
    confirmationCode: b.confirmationCode || "", pricePerNight: Number(b.price) || 0,
    checkIn: b.checkIn || null, checkOut: b.checkOut || null, guests: Number(b.guests) || 1,
    nights: Number(b.nights) || 1, total: Number(b.total ?? b.price ?? 0), status,
    rawBookingStatus: b.status || "confirmed",
    statusDetails: {
      bookedAt: b.createdAt, cancelledAt: b.cancelledAt || null,
      completedAt: status === "completed" ? b.checkOut : null, lastUpdatedAt: b.updatedAt || b.createdAt,
    },
    bookedAt: b.createdAt,
  };
}

function profileResponse(user) {
  const p = profileFor(user._id);
  const snaps = db().bookings
    .filter((b) => b.userId === user._id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(bookingSnapshot);
  return {
    _id: user._id, id: user._id, firstName: user.firstName, lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(), email: user.email, phone: user.phone,
    role: user.role, status: user.status, createdAt: user.createdAt, updatedAt: p.updatedAt || user.updatedAt,
    countryCode: p.countryCode ?? "+20", address: p.address ?? "", city: p.city ?? "", country: p.country ?? "",
    dob: p.dob ?? "", avatar: p.avatar ?? "", bio: p.bio ?? "",
    bookingStats: {
      totalBooked: snaps.length,
      totalCancelled: snaps.filter((s) => s.status === "cancelled").length,
      totalCompleted: snaps.filter((s) => s.status === "completed").length,
    },
    upcomingStays: snaps.filter((s) => s.status === "upcoming").slice(0, 20),
    bookingHistory: snaps.filter((s) => s.status !== "upcoming").slice(0, 20),
    activityHistory: p.activityHistory || [],
  };
}

function updateMyProfile(req) {
  const user = req.user.user;
  const body = req.body;
  if (body.email && db().users.some((u) => u._id !== user._id && sameI(u.email, body.email))) {
    return json(400, { message: "Email already registered" });
  }
  const changed = [];
  ["firstName", "lastName", "email", "phone"].forEach((f) => {
    if (body[f] !== undefined) { user[f] = body[f]; changed.push(f); }
  });
  const p = profileFor(user._id);
  ["countryCode", "address", "city", "country", "dob", "avatar", "bio"].forEach((f) => {
    if (body[f] !== undefined) { p[f] = body[f]; changed.push(f); }
  });
  user.updatedAt = p.updatedAt = nowIso();
  if (changed.length) {
    addActivity(user._id, { type: "profile_updated", title: "Profile updated", description: `Updated ${changed.join(", ")}`, metadata: { changedFields: changed } });
  }
  save();
  return ok({ message: "Profile updated successfully", user: profileResponse(user) });
}

function changeMyPassword(req) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return json(400, { message: "Current password and new password are required" });
  if (String(newPassword).length < 6) return json(400, { message: "New password must be at least 6 characters long" });
  if (req.user.user.password !== currentPassword) return json(400, { message: "Current password is incorrect" });
  req.user.user.password = String(newPassword);
  addActivity(req.user.userId, { type: "password_changed", title: "Password changed", description: "Account password was updated successfully." });
  save();
  return ok({ message: "Password updated successfully" });
}

// ---------- favorites ----------

function toggleFavorite(req) {
  const { hotelId, roomId } = req.body;
  if (!roomId) return json(400, { message: "roomId is required" });
  const user = req.user.user;
  user.favorites = user.favorites || [];
  const index = user.favorites.findIndex((f) => String(f.roomId) === String(roomId));
  let action;
  if (index > -1) { user.favorites.splice(index, 1); action = "removed"; }
  else { user.favorites.push({ hotelId: isObjectId(hotelId) ? hotelId : null, roomId: String(roomId) }); action = "added"; }
  save();
  return ok({ message: `Favorite ${action} successfully`, action, favorites: user.favorites });
}

function myFavorites(req) {
  const data = db();
  const favorites = (req.user.user.favorites || [])
    .map((fav) => {
      const room = data.rooms.find((r) => r._id === String(fav.roomId));
      if (!room) return null;
      const hotel = data.hotels.find((h) => h._id === fav.hotelId) || data.hotels.find((h) => h.name === room.branch) || null;
      return {
        _id: room._id, roomId: room._id, hotelId: hotel?._id || fav.hotelId || null,
        hotelName: room.hotelName || hotel?.hotelName || "Blue Wave Hotel", branch: room.branch || hotel?.name || "",
        city: room.city || hotel?.city || "", location: room.location || hotel?.address || "",
        status: room.status || (room.available ? "Available" : "Occupied"), roomName: room.roomName, type: room.type,
        price: room.price, rating: room.rating ?? hotel?.rating ?? 0, guests: room.guests, beds: room.beds,
        baths: room.baths, size: room.size ?? 0, available: room.available, featured: room.featured,
        image: room.image || hotel?.image || "", amenities: room.amenities?.length ? room.amenities : hotel?.amenities || [],
        description: room.description || hotel?.description || "", phone: hotel?.phone || "", email: hotel?.email || "",
      };
    })
    .filter(Boolean);
  return ok({ count: favorites.length, favorites });
}

// ---------- reviews ----------

function reviewOwnerOrAdmin(req, review) {
  return String(review.userId) === String(req.user.userId) || req.user.role === "admin";
}

// ---------- generic CRUD ----------

const findIn = (collection, id) => db()[collection].find((item) => item._id === id);
function removeFrom(collection, id) {
  const list = db()[collection];
  const index = list.findIndex((item) => item._id === id);
  if (index === -1) return null;
  const [removed] = list.splice(index, 1);
  save();
  return removed;
}

// ---------- routes ----------

const routes = [
  // auth
  ["POST", "/auth/register", register],
  ["POST", "/auth/login", login],
  ["POST", "/auth/logout", protect(() => ok({ message: "Logout successful" }))],
  ["GET", "/auth/me", protect((req) => ok({ user: userResponse(req.user.user) }))],
  ["GET", "/auth/users", adminOnly(() => {
    const users = [...db().users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return ok({ count: users.length, users: users.map(adminUserResponse) });
  })],
  ["POST", "/auth/users", adminOnly(createUserByAdmin)],
  ["PATCH", "/auth/users/:id/status", adminOnly(updateUserStatus)],

  // hotels
  ["GET", "/hotels", listHotels],
  ["GET", "/hotels/listing-rooms", listingRooms],
  ["GET", "/hotels/:id", ({ params }) => findIn("hotels", params.id) ? ok(findIn("hotels", params.id)) : notFound("Branch not found")],
  ["POST", "/hotels", adminOnly(({ body }) => {
    const invalid = validateHotel(body);
    if (invalid) return invalid;
    const hotel = { hotelName: "Blue Wave Hotel", status: "Active", rating: 0, image: "", amenities: [], description: "", phone: "", email: "", rooms: [], ...body, _id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    db().hotels.push(hotel);
    save();
    return created({ message: "Branch created successfully", hotel });
  })],
  ["PUT", "/hotels/:id", adminOnly(({ params, body }) => {
    const invalid = validateHotel(body);
    if (invalid) return invalid;
    const hotel = findIn("hotels", params.id);
    if (!hotel) return notFound("Branch not found");
    Object.assign(hotel, body, { _id: hotel._id, updatedAt: nowIso() });
    save();
    return ok({ message: "Branch updated successfully", hotel });
  })],
  ["DELETE", "/hotels/:id", adminOnly(({ params }) =>
    removeFrom("hotels", params.id) ? ok({ message: "Branch deleted successfully" }) : notFound("Branch not found"))],

  // rooms
  ["GET", "/rooms/featured", () => ok(db().rooms.filter((r) => r.featured && r.available).slice(0, 4))],
  ["GET", "/rooms/filter", ({ query }) => {
    let rooms = [...db().rooms];
    if (query.branch) rooms = rooms.filter((r) => r.branch === query.branch);
    if (query.type) rooms = rooms.filter((r) => r.type === query.type);
    if (query.available !== undefined) rooms = rooms.filter((r) => r.available === (query.available === "true"));
    return ok(sortRooms(rooms));
  }],
  ["GET", "/rooms/user-search", userSearchRooms],
  ["GET", "/rooms", () => ok(sortRooms(db().rooms))],
  ["GET", "/rooms/:id", ({ params }) => findIn("rooms", params.id) ? ok(findIn("rooms", params.id)) : notFound("Room not found")],
  ["POST", "/rooms", protect(({ body }) => {
    const room = { hotelName: "Blue Wave Hotel", rating: 0, featured: false, description: "", amenities: [], ...normalizeRoomPayload(body), _id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    db().rooms.push(room);
    save();
    return created(room);
  })],
  ["PATCH", "/rooms/:id", protect(({ params, body }) => {
    const room = findIn("rooms", params.id);
    if (!room) return notFound("Room not found");
    Object.assign(room, normalizeRoomPayload({ ...room, ...body }), { _id: room._id, updatedAt: nowIso() });
    save();
    return ok(room);
  })],
  ["DELETE", "/rooms/:id", protect(({ params }) => removeFrom("rooms", params.id) ? noContent() : notFound("Room not found"))],

  // bookings
  ["POST", "/bookings/search", searchAvailability],
  ["GET", "/bookings", () => ok([...db().bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(withUser))],
  ["GET", "/bookings/my-bookings", protect(myBookings)],
  ["GET", "/bookings/:id", ({ params }) => findIn("bookings", params.id) ? ok(withUser(findIn("bookings", params.id))) : notFound("Booking not found")],
  ["POST", "/bookings", protect(createBooking)],
  ["PATCH", "/bookings/:id/cancel", protect(cancelMyBooking)],
  ["PATCH", "/bookings/:id", protect(({ params, body }) => {
    const booking = findIn("bookings", params.id);
    if (!booking) return notFound("Booking not found");
    Object.assign(booking, body, { _id: booking._id, updatedAt: nowIso() });
    save();
    return ok(withUser(booking));
  })],
  ["DELETE", "/bookings/:id", protect(({ params }) => removeFrom("bookings", params.id) ? noContent() : notFound("Booking not found"))],

  // reviews
  ["GET", "/reviews", () => ok([...db().reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))],
  ["POST", "/reviews", protect((req) => {
    const review = { helpful: 0, unhelpful: 0, ...req.body, verified: req.body.verified ?? true, userId: req.user.userId, _id: newId(), createdAt: nowIso(), updatedAt: nowIso() };
    db().reviews.push(review);
    save();
    return created(review);
  })],
  ["PATCH", "/reviews/:id", protect((req) => {
    const review = findIn("reviews", req.params.id);
    if (!review) return notFound("Review not found");
    if (!reviewOwnerOrAdmin(req, review)) return json(403, { message: "Forbidden" });
    ["comment", "rating", "title", "branch"].forEach((f) => { if (req.body[f] !== undefined) review[f] = req.body[f]; });
    review.updatedAt = nowIso();
    save();
    return ok(review);
  })],
  ["DELETE", "/reviews/:id", protect((req) => {
    const review = findIn("reviews", req.params.id);
    if (!review) return notFound("Review not found");
    if (!reviewOwnerOrAdmin(req, review)) return json(403, { message: "Forbidden" });
    removeFrom("reviews", review._id);
    return noContent();
  })],

  // favorites
  ["GET", "/favorites", protect(myFavorites)],
  ["POST", "/favorites/toggle", protect(toggleFavorite)],

  // profile
  ["GET", "/profile/me", protect((req) => ok({ user: profileResponse(req.user.user) }))],
  ["PUT", "/profile/me", protect(updateMyProfile)],
  ["PUT", "/profile/change-password", protect(changeMyPassword)],

  // offers
  ["GET", "/offers", () => ok(db().offers)],
  ["GET", "/offers/:id", ({ params }) => findIn("offers", params.id) ? ok(findIn("offers", params.id)) : notFound("Offer not found")],
  ["POST", "/offers", adminOnly(({ body }) => {
    if (!body.title || !body.type || !body.badge) return json(400, { errors: [{ msg: "Title, type and badge are required" }] });
    const offer = {
      title: body.title, type: body.type, badge: body.badge, discount: Number(body.discount),
      originalPrice: Number(body.originalPrice), pricePerNight: Number(body.pricePerNight),
      expiryDate: body.expiryDate, roomId: body.roomId || null, hotelId: body.hotelId,
      description: body.description || "", active: true, _id: newId(), createdAt: nowIso(), updatedAt: nowIso(),
    };
    db().offers.push(offer);
    save();
    return created(offer);
  })],
  ["PUT", "/offers/:id", adminOnly(({ params, body }) => {
    const offer = findIn("offers", params.id);
    if (!offer) return notFound("Offer not found");
    Object.assign(offer, body, { _id: offer._id, updatedAt: nowIso() });
    save();
    return ok(offer);
  })],
  ["PATCH", "/offers/:id/toggle", adminOnly(({ params }) => {
    const offer = findIn("offers", params.id);
    if (!offer) return notFound("Offer not found");
    offer.active = !offer.active;
    save();
    return ok(offer);
  })],
  ["DELETE", "/offers/:id", adminOnly(({ params }) =>
    removeFrom("offers", params.id) ? ok({ message: "Offer deleted successfully" }) : notFound("Offer not found"))],

  // newsletter
  ["POST", "/newsletter/subscribe", ({ body }) => {
    const email = String(body?.email ?? "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { message: "Please enter a valid email address." });
    const list = db().newsletter;
    const isNew = !list.some((s) => s.email === email);
    if (isNew) { list.push({ _id: newId(), email, subscribedAt: nowIso() }); save(); }
    return ok({ message: "You're subscribed! (Welcome emails are switched off in this demo.)", emailed: false, isNew });
  }],

  // contact form
  ["POST", "/contact-messages", protect(({ body, user }) => {
    const message = { ...body, userId: user.userId, status: "new", _id: newId(), createdAt: nowIso() };
    db().contactMessages.push(message);
    save();
    return created(message);
  })],

  // audit log: accepted and dropped
  ["POST", "/audit/events", () => created({ ok: true })],
];

const compiled = routes.map(([method, pattern, handler]) => {
  const keys = [];
  const regex = new RegExp(
    "^" + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return "([^/]+)"; }) + "/?$"
  );
  return { method, regex, keys, handler };
});

// Returns { status, body } for a request, or null when no route matches.
export function handle({ method, path, query, headers, body }) {
  for (const route of compiled) {
    if (route.method !== method) continue;
    const match = path.match(route.regex);
    if (!match) continue;
    const params = Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(match[i + 1])]));
    try {
      return route.handler({ method, path, params, query, headers, body: body || {} });
    } catch (error) {
      return json(500, { message: error.message || "Server error" });
    }
  }
  return null;
}
