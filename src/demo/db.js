// In-browser "database" for demo mode (GitHub Pages build).
// Collections live in localStorage, so each visitor gets their own copy that
// survives reloads. Records mirror the Mongoose models in backend/models.

import hotels, { branchDetails } from "../data/hotels.js";
import { offersData } from "../data/offersData";
import homeReviews from "../data/reviewsData";

// Bump when the seed shape changes so visitors get a fresh copy.
const DB_KEY = "bw-demo-db-v2";

export const DEMO_ACCOUNTS = {
  guest: { email: "guest@bluewaves.demo", password: "guest123" },
  admin: { email: "admin@bluewaves.demo", password: "admin123" },
};

// 24-char hex ids, so frontend checks that expect Mongo ObjectIds still pass.
export function newId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function isObjectId(value) {
  return /^[a-f0-9]{24}$/i.test(String(value || ""));
}

const now = () => new Date().toISOString();
const daysFromToday = (days) => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
};

function seed() {
  const createdAt = now();

  // Rooms: one record per room in the local catalogue.
  const localIdToRoomId = new Map();
  const rooms = hotels.map((room) => {
    const _id = newId();
    localIdToRoomId.set(String(room.id), _id);
    return {
      _id,
      hotelName: room.hotelName || "Blue Wave Hotel",
      branch: room.branch,
      city: room.city,
      location: room.location,
      roomName: room.roomName,
      type: room.type,
      price: Number(room.price) || 0,
      rating: Number(room.rating) || 0,
      guests: Number(room.guests) || 1,
      beds: Number(room.beds) || 1,
      baths: Number(room.baths) || 1,
      size: Number(room.size) || 1,
      available: room.available !== false,
      status: room.available === false ? "Occupied" : "Available",
      featured: !!room.featured,
      image: room.image,
      description: room.description || `${room.type} room at the ${room.branch}.`,
      amenities: Array.isArray(room.amenities) ? room.amenities : [],
      dateStatuses: {},
      createdAt,
      updatedAt: createdAt,
    };
  });

  // Hotels (branches), each carrying its rooms like the listing endpoint expects.
  const hotelsCollection = branchDetails.map((branch) => {
    const branchRooms = rooms.filter((room) => room.branch === branch.title);
    const ratings = branchRooms.map((room) => room.rating).filter(Boolean);
    return {
      _id: newId(),
      name: branch.title,
      hotelName: "Blue Wave Hotel",
      city: branch.title.replace(/\s+Branch$/i, ""),
      address: branchRooms[0]?.location || branch.title.replace(/\s+Branch$/i, ""),
      status: "Active",
      rating: ratings.length ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 4.5,
      image: branch.image,
      amenities: Array.isArray(branch.features) ? branch.features : [],
      description: branch.description,
      phone: "+20 100 000 0000",
      email: `${branch.slug}@bluewaves.demo`,
      rooms: branchRooms.map((room) => ({ ...room })),
      createdAt,
      updatedAt: createdAt,
    };
  });

  const users = [
    {
      _id: newId(), firstName: "Demo", lastName: "Guest", email: DEMO_ACCOUNTS.guest.email,
      phone: "+20 101 234 5678", password: DEMO_ACCOUNTS.guest.password, role: "user",
      status: "active", favorites: [], createdAt, updatedAt: createdAt,
    },
    {
      _id: newId(), firstName: "Demo", lastName: "Admin", email: DEMO_ACCOUNTS.admin.email,
      phone: "+20 102 345 6789", password: DEMO_ACCOUNTS.admin.password, role: "admin",
      status: "active", favorites: [], createdAt, updatedAt: createdAt,
    },
    ...[
      ["Mariam", "Hassan"], ["Omar", "El-Sayed"], ["Nour", "Adel"], ["Youssef", "Kamal"],
    ].map(([firstName, lastName], i) => ({
      _id: newId(), firstName, lastName,
      email: `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, "") + "@example.com",
      phone: `+20 10${i} 555 01${i}${i}`, password: "demo-user", role: "user",
      status: i === 3 ? "blocked" : "active", favorites: [], createdAt, updatedAt: createdAt,
    })),
  ];

  // A few bookings so the profile and admin dashboard have something to show.
  const guest = users[0];
  const pick = (index) => rooms[index % rooms.length];
  const bookingFor = (user, room, startInDays, nights, status = "Confirmed") => {
    const checkIn = daysFromToday(startInDays);
    const checkOut = daysFromToday(startInDays + nights);
    return {
      _id: newId(),
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      room: room._id,
      roomId: room._id,
      roomKey: room._id,
      branch: room.branch,
      guests: Math.min(2, room.guests),
      roomName: room.roomName,
      hotelName: room.hotelName,
      city: room.city,
      location: room.location,
      image: room.image,
      roomType: room.type,
      beds: room.beds,
      baths: room.baths,
      size: room.size,
      description: room.description,
      amenities: room.amenities,
      price: room.price,
      checkIn,
      checkOut,
      nights,
      total: room.price * nights,
      confirmationCode: `BW-${newId().slice(0, 8).toUpperCase()}`,
      paymentMethod: "card",
      status,
      cancelledAt: status === "Cancelled" ? createdAt : null,
      userId: user._id,
      createdAt,
      updatedAt: createdAt,
    };
  };
  const bookings = [
    bookingFor(guest, pick(2), 12, 3),
    bookingFor(guest, pick(7), -40, 2),
    bookingFor(users[2], pick(4), 5, 4),
    bookingFor(users[3], pick(9), 20, 2),
    bookingFor(users[4], pick(11), 30, 5, "Cancelled"),
  ];

  // Past stays spread over earlier months, so the dashboard chart has a history.
  const today = new Date();
  const perMonth = [2, 3, 2, 4, 3, 5, 4, 3, 2];
  perMonth.forEach((count, monthsAgo) => {
    for (let i = 0; i < count; i++) {
      const stay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - monthsAgo - 1, 3 + i * 6));
      const startInDays = Math.round((stay - today) / (24 * 60 * 60 * 1000));
      const user = users[2 + ((monthsAgo + i) % 3)];
      const booking = bookingFor(user, pick(monthsAgo * 3 + i), startInDays, 2 + (i % 3), i === 2 ? "Cancelled" : "Confirmed");
      booking.createdAt = booking.updatedAt = new Date(stay.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString();
      bookings.push(booking);
    }
  });

  const reviews = homeReviews.map((review) => ({
    _id: newId(),
    name: review.name,
    title: review.title,
    comment: review.text || review.comment || "",
    rating: Number(review.rating) || 5,
    branch: review.branch,
    helpful: Number(review.helpful) || 0,
    unhelpful: 0,
    verified: review.verified ?? true,
    userId: null,
    createdAt: review.createdAt || createdAt,
    updatedAt: review.createdAt || createdAt,
  }));

  // Offers in the admin (Mongo) shape; expiries are pushed into the future.
  const offers = offersData.map((offer, i) => ({
    _id: newId(),
    title: offer.title,
    type: offer.category,
    badge: offer.badge || offer.tag || offer.category,
    discount: Number(offer.discountPercent) || 10,
    originalPrice: Number(offer.originalPrice) || 100,
    pricePerNight: Number(offer.discountedPrice) || 90,
    expiryDate: daysFromToday(3 + i * 4),
    active: true,
    description: offer.description || "",
    roomId: localIdToRoomId.get(String(offer.hotelId)) || null,
    hotelId: offer.hotelId,
    createdAt,
    updatedAt: createdAt,
  }));

  return {
    users,
    profiles: [],
    hotels: hotelsCollection,
    rooms,
    bookings,
    reviews,
    offers,
    newsletter: [],
    contactMessages: [],
  };
}

let cache = null;

export function db() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) cache = JSON.parse(raw);
  } catch {
    cache = null;
  }
  if (!cache) {
    cache = seed();
    save();
  }
  return cache;
}

export function save() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or blocked: keep working in memory for this visit.
  }
}

export function resetDemo() {
  cache = seed();
  save();
}
