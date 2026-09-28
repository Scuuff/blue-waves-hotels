import { apiGet } from "../services/apiClient";
import { normalizeRoomRecord } from "./roomMedia";

/* ---------------------------------------------------------------------------
   Blue Wave rule-based chat engine.

   Pipeline: normalize → score intents → extract entities → resolve reply.
   Replies are plain objects the widget renders:
   { text, chips?: [{ label, send? , to?, href? }], rooms?: [], branches?: [] }
   - chips with `send` post that text back into the chat as the user;
   - chips with `to` are internal links; `href` are external links.
--------------------------------------------------------------------------- */

export function normalizeText(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DEFAULT_CHIPS = [
  { label: "Check availability", send: "Show me available rooms" },
  { label: "Cancellation policy", send: "What is the cancellation policy?" },
  { label: "Check-in times", send: "What time is check-in?" },
  { label: "Branch contacts", send: "How do I contact a branch?" },
  { label: "Talk to a human", send: "I want to talk to a human" },
];

const HANDOFF_CHIPS = [
  { label: "Send us a message", to: "/help" },
  { label: "WhatsApp us", href: "https://wa.me/201005550123" },
];

/* ── Intents ──
   `keywords` are normalized phrases; multi-word phrases score higher.
   `answer` is a static reply; `action` defers to a live-data resolver. */
const INTENTS = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening", "salam"],
    answer: {
      text: "Hello! Welcome to Blue Wave Hotel. I can help you find rooms, explain our policies, or connect you with any of our branches. What would you like to know?",
      chips: DEFAULT_CHIPS,
    },
  },
  {
    id: "thanks",
    keywords: ["thank", "thanks", "thx", "appreciate"],
    answer: {
      text: "You're most welcome! Is there anything else I can help you with?",
      chips: DEFAULT_CHIPS,
    },
  },
  {
    id: "check_in_time",
    keywords: [
      "check in",
      "checkin",
      "check out",
      "checkout",
      "arrival time",
      "what time",
      "leave by",
    ],
    answer: {
      text: "Standard check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out can be requested — availability varies by branch and occupancy.",
      chips: [
        { label: "Check availability", send: "Show me available rooms" },
        { label: "Contact a branch", send: "How do I contact a branch?" },
      ],
    },
  },
  {
    id: "cancellation",
    keywords: [
      "cancel",
      "cancellation",
      "cancellation policy",
      "call off",
      "money back",
    ],
    answer: {
      text: "Free cancellation is available on most bookings up to 48 hours before check-in. Late cancellations (within 48 hours) may incur a one-night charge. Non-refundable rates are clearly marked at booking time.",
      chips: [
        { label: "Refund timing", send: "How long do refunds take?" },
        { label: "Talk to a human", send: "I want to talk to a human" },
      ],
    },
  },
  {
    id: "refunds",
    keywords: ["refund", "refunds", "get my money", "reimburse"],
    answer: {
      text: "Once a cancellation is confirmed, refunds are initiated within 24 hours. Depending on your payment provider, the funds typically appear in your account within 5–10 business days.",
      chips: [
        { label: "Cancellation policy", send: "What is the cancellation policy?" },
      ],
    },
  },
  {
    id: "book_how",
    keywords: [
      "how to book",
      "how do i book",
      "make a booking",
      "make a reservation",
      "reserve a room",
      "booking steps",
    ],
    answer: {
      text: "Booking is easy: browse our rooms, pick your dates and room type, then complete the secure checkout. You'll get an instant confirmation email with your reservation code.",
      chips: [
        { label: "Browse rooms", to: "/hotels" },
        { label: "Show me available rooms", send: "Show me available rooms" },
      ],
    },
  },
  {
    id: "book_someone_else",
    keywords: ["someone else", "for my friend", "another person", "for my wife", "for my husband"],
    answer: {
      text: "Absolutely — during checkout, enter the guest's name in the Guest Details section. The confirmation goes to your email, and the guest checks in with a valid ID matching the reservation name.",
    },
  },
  {
    id: "min_stay",
    keywords: ["minimum stay", "minimum nights", "one night", "how many nights"],
    answer: {
      text: "Most of our properties have a one-night minimum. During peak seasons some branches may require a two-night minimum — this is clearly noted on the room selection page.",
    },
  },
  {
    id: "pets",
    keywords: ["pet", "pets", "dog", "cat", "animal"],
    answer: {
      text: "Our Ain El Sokhna and Marsa Alam branches are pet-friendly for dogs under 25 kg (a small nightly surcharge applies). Other branches don't currently allow pets.",
    },
  },
  {
    id: "transfers",
    keywords: ["airport", "transfer", "shuttle", "pick up", "pickup"],
    answer: {
      text: "Yes! All five Blue Wave branches offer private airport transfers. Add one during booking, or contact the concierge at least 24 hours before arrival.",
      chips: [{ label: "Branch contacts", send: "How do I contact a branch?" }],
    },
  },
  {
    id: "loyalty",
    keywords: ["loyalty", "points", "rewards", "membership", "programme", "program"],
    answer: {
      text: "Create a free Blue Wave account and you're automatically enrolled in our loyalty programme. Every eligible booking earns points redeemable for upgrades, spa credits, and complimentary nights.",
      chips: [{ label: "Create account", to: "/register" }],
    },
  },
  {
    id: "password",
    keywords: ["password", "forgot", "reset", "cant log in", "cannot log in", "login problem"],
    answer: {
      text: "Click 'Log In' then 'Forgot Password'. Enter your registered email and we'll send a secure reset link within minutes — check your spam folder if you don't see it.",
      chips: [{ label: "Go to login", to: "/login" }],
    },
  },
  {
    id: "offers",
    keywords: ["offer", "offers", "deal", "deals", "discount", "promotion", "promo"],
    answer: {
      text: "We regularly run exclusive offers on rooms and suites across our branches. Have a look at what's live right now:",
      chips: [{ label: "View current offers", to: "/offers" }],
    },
  },
  {
    id: "emergency",
    keywords: ["emergency", "urgent", "medical", "safety", "help now"],
    answer: {
      text: "For emergencies during your stay — safety, medical, or urgent booking issues — please call our 24/7 priority line right away: +20 122 999 0000.",
      chips: HANDOFF_CHIPS,
    },
  },
  {
    id: "handoff",
    keywords: [
      "human",
      "agent",
      "real person",
      "someone",
      "complaint",
      "complain",
      "speak to",
      "talk to",
      "support team",
      "customer service",
    ],
    answer: {
      text: "Of course — our guest relations team is happy to help personally. You can send us a message (we reply within 24 hours) or reach us instantly on WhatsApp.",
      chips: HANDOFF_CHIPS,
    },
  },
  {
    id: "room_search",
    keywords: [
      "room",
      "rooms",
      "available",
      "availability",
      "vacancy",
      "book",
      "suite",
      "deluxe",
      "penthouse",
      "standard",
      "price",
      "prices",
      "cost",
      "how much",
      "cheap",
      "under",
      "budget",
      "stay",
    ],
    action: "searchRooms",
  },
  {
    id: "branch_contact",
    keywords: [
      "branch",
      "branches",
      "contact",
      "phone",
      "number",
      "email",
      "address",
      "location",
      "where are you",
      "call",
    ],
    action: "branchContact",
  },
];

/* Branch cities used for entity extraction; matched against live branch names. */
const CITY_WORDS = [
  "alexandria",
  "cairo",
  "sharm",
  "marsa alam",
  "sokhna",
];

export function matchIntent(message) {
  const text = normalizeText(message);
  if (!text) return null;

  let best = null;
  let bestScore = 0;

  for (const intent of INTENTS) {
    let score = 0;
    for (const phrase of intent.keywords) {
      const words = phrase.split(" ");
      const hit =
        words.length > 1
          ? text.includes(phrase)
          : new RegExp(`\\b${phrase}\\b`).test(text);
      if (hit) score += words.length * 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return best ? { intent: best, score: bestScore } : null;
}

export function extractEntities(message) {
  const text = normalizeText(message);
  const entities = {};

  const price = text.match(
    /(?:under|below|less than|max|maximum|up to|cheaper than|within)\s*\$?\s*(\d+)/
  );
  if (price) entities.maxPrice = Number(price[1]);

  const guests = text.match(/(\d+)\s*(?:guests?|people|persons?|adults?)/);
  if (guests) entities.guests = Number(guests[1]);

  const type = text.match(/\b(deluxe|suite|penthouse|standard)\b/);
  if (type) {
    const t = type[1];
    entities.roomType = t.charAt(0).toUpperCase() + t.slice(1);
  }

  for (const city of CITY_WORDS) {
    if (text.includes(city)) {
      entities.city = city;
      break;
    }
  }

  return entities;
}

/* ── Live-data resolvers ── */

let branchCache = null;
async function loadBranches() {
  if (branchCache) return branchCache;
  const data = await apiGet("/hotels");
  branchCache = Array.isArray(data?.hotels)
    ? data.hotels.filter((hotel) => hotel?.status !== "Inactive")
    : [];
  return branchCache;
}

function branchNameForCity(branches, city) {
  if (!city) return null;
  const match = branches.find((b) =>
    normalizeText(b.name || "").includes(city)
  );
  return match?.name || null;
}

/* Room searches resolve branch names from the rooms themselves — the hotels
   directory and the room catalog can disagree (e.g. a branch with rooms but
   no directory entry). */
let roomBranchCache = null;
async function loadRoomBranchNames() {
  if (roomBranchCache) return roomBranchCache;
  const data = await apiGet("/rooms");
  roomBranchCache = [
    ...new Set(
      (Array.isArray(data) ? data : [])
        .map((room) => room.branch)
        .filter(Boolean)
    ),
  ];
  return roomBranchCache;
}

async function resolveRoomSearch(entities) {
  const branchNames = await loadRoomBranchNames().catch(() => []);
  const branchName =
    entities.city && branchNames.length
      ? branchNames.find((name) => normalizeText(name).includes(entities.city)) ||
        null
      : null;

  const params = new URLSearchParams();
  if (branchName) params.append("branch", branchName);
  if (entities.roomType) params.append("type", entities.roomType);
  if (entities.maxPrice) params.append("maxPrice", entities.maxPrice);
  if (entities.guests) params.append("guests", entities.guests);

  const data = await apiGet(`/rooms/user-search?${params.toString()}`);
  const rooms = (Array.isArray(data) ? data : []).map(normalizeRoomRecord);

  const filters = [
    branchName,
    entities.roomType,
    entities.maxPrice ? `under $${entities.maxPrice}` : null,
    entities.guests ? `for ${entities.guests} guests` : null,
  ]
    .filter(Boolean)
    .join(", ");

  if (rooms.length === 0) {
    return {
      text: `I couldn't find any rooms${filters ? ` matching ${filters}` : ""} right now. Try adjusting your criteria, or browse everything on our search page.`,
      chips: [
        { label: "Browse all rooms", to: "/hotels" },
        { label: "Talk to a human", send: "I want to talk to a human" },
      ],
    };
  }

  return {
    text: `I found ${rooms.length} room${rooms.length > 1 ? "s" : ""}${
      filters ? ` matching ${filters}` : ""
    } — here ${rooms.length > 1 ? "are the top picks" : "it is"}:`,
    rooms: rooms.slice(0, 3),
    chips: [{ label: "See all results", to: "/hotels" }],
  };
}

async function resolveBranchContact(entities) {
  const branches = await loadBranches();

  if (branches.length === 0) {
    return {
      text: "I couldn't load our branch directory right now. You can reach our central line 24/7 at +20 3 480 1234, or use the Help Center.",
      chips: HANDOFF_CHIPS,
    };
  }

  const branchName = branchNameForCity(branches, entities.city);
  const selected = branchName
    ? branches.filter((b) => b.name === branchName)
    : branches;

  return {
    text: branchName
      ? `Here are the contact details for ${branchName}:`
      : "Here are all our branches — every front desk is open 24/7:",
    branches: selected.slice(0, 5).map((b) => ({
      name: b.name || "Branch",
      address: b.address || "Address not available",
      phone: b.phone || "Phone not available",
      email: b.email || "Email not available",
    })),
    chips: [{ label: "Visit Help Center", to: "/help" }],
  };
}

const FALLBACK_REPLY = {
  text: "Hmm, I'm not sure about that one — but a human definitely is! You can send our team a message or reach us on WhatsApp. Meanwhile, here's what I'm great at:",
  chips: [...HANDOFF_CHIPS, ...DEFAULT_CHIPS.slice(0, 3)],
};

export const GREETING_REPLY = {
  text: "Hello! I'm the Blue Wave concierge. I can check live room availability, explain our policies, or share branch contacts. How can I help?",
  chips: DEFAULT_CHIPS,
};

/* ── Main entry: message in → reply object out ── */
export async function getBotReply(message) {
  const matched = matchIntent(message);
  const entities = extractEntities(message);

  // A city mention with no other signal still means "tell me about that branch".
  if (!matched && entities.city) {
    return resolveBranchContact(entities).catch(() => FALLBACK_REPLY);
  }

  if (!matched) return FALLBACK_REPLY;

  const { intent } = matched;

  try {
    if (intent.action === "searchRooms") return await resolveRoomSearch(entities);
    if (intent.action === "branchContact")
      return await resolveBranchContact(entities);
  } catch {
    return {
      text: "I couldn't reach our booking system just now. Please try again in a moment, or contact us directly.",
      chips: HANDOFF_CHIPS,
    };
  }

  return intent.answer || FALLBACK_REPLY;
}
