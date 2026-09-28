// hotelId links each offer to a specific room in hotels.js
// originalPrice = hotel room's actual per-night rate from hotels.js
// discountedPrice = originalPrice after discount applied
export const offersData = [
  {
    id: 1,
    hotelId: 4, // Royal Penthouse, Alexandria — $650/night
    title: "Royal Suite Escape",
    category: "Bundle",
    tag: "Most Popular",
    tagColor: "bg-amber-400 text-amber-900",
    description: "Book 2 nights in our Royal Penthouse (Alexandria) and get a complimentary cruise experience for two, including dinner and sunset views.",
    originalPrice: 650,       // hotel.price per night
    discountedPrice: 455,     // 650 × 70% (30% off)
    discountPercent: 30,
    features: ["2 Nights Stay", "Cruise for Two", "Dinner Included", "Late Checkout"],
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "🚢 Cruise Included",
  },
  {
    id: 2,
    hotelId: 1, // Standard Room, Alexandria — $120/night
    title: "Triple Room Deal",
    category: "Discount",
    tag: "Limited Rooms",
    tagColor: "bg-red-500 text-white",
    description: "Book 2 Standard Rooms (Alexandria) for the weekend and get your 3rd room at 50% off. Perfect for family getaways and group trips.",
    originalPrice: 120,       // hotel.price per night
    discountedPrice: 90,      // 120 × 75% (25% off)
    discountPercent: 25,
    features: ["3rd Room 50% Off", "Free Breakfast", "Pool Access", "Free Parking"],
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "🛏️ 3 Rooms Deal",
  },
  {
    id: 3,
    hotelId: 3, // Ocean View Suite, Alexandria — $320/night
    title: "Honeymoon Paradise",
    category: "Package",
    tag: "Romantic",
    tagColor: "bg-pink-500 text-white",
    description: "The ultimate romantic escape — an Ocean View Suite (Alexandria) with rose petal turndown, couples spa session, and candlelit dinner.",
    originalPrice: 320,       // hotel.price per night
    discountedPrice: 240,     // 320 × 75% (25% off)
    discountPercent: 25,
    features: ["Sea View Suite", "Couples Spa", "Candlelit Dinner", "Champagne Welcome"],
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "💑 Couples Special",
  },
  {
    id: 4,
    hotelId: 11, // Business Suite, Cairo — $295/night
    title: "Business & Comfort",
    category: "Package",
    tag: "Weekday Deal",
    tagColor: "bg-blue-500 text-white",
    description: "All-inclusive business package in our Cairo Business Suite with executive lounge access, high-speed WiFi, airport transfers, and express laundry.",
    originalPrice: 295,       // hotel.price per night
    discountedPrice: 221,     // 295 × 75% (25% off)
    discountPercent: 25,
    features: ["Executive Lounge", "Airport Transfer", "Express Laundry", "Meeting Room 2hrs"],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "💼 Business Pack",
  },
  {
    id: 5,
    hotelId: 15, // Coral Suite, Sharm El Sheikh — $340/night
    title: "Summer Splash Package",
    category: "Seasonal",
    tag: "Summer Special",
    tagColor: "bg-cyan-500 text-white",
    description: "Make the most of summer in our Coral Suite (Sharm El Sheikh) with unlimited pool & beach access, water sports equipment, BBQ dinner, and a sunset cocktail hour.",
    originalPrice: 340,       // hotel.price per night
    discountedPrice: 231,     // 340 × 68% (32% off)
    discountPercent: 32,
    features: ["Unlimited Pool", "Water Sports", "BBQ Dinner", "Cocktail Hour"],
    expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "☀️ Summer Vibes",
  },
  {
    id: 6,
    hotelId: 8, // Sunset Penthouse, Marsa Alam — $620/night
    title: "Weekend Family Fun",
    category: "Bundle",
    tag: "Family",
    tagColor: "bg-green-500 text-white",
    description: "A full family weekend in our Sunset Penthouse (Marsa Alam) — kids stay & eat free, family movie night setup, splash pool access, and guided city tour.",
    originalPrice: 620,       // hotel.price per night
    discountedPrice: 453,     // 620 × 73% (27% off)
    discountPercent: 27,
    features: ["Kids Stay Free", "Kids Eat Free", "Family Movie Night", "City Tour"],
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    badge: "👨‍👩‍👧 Family Pack",
  },
];

export const validPromoCodes = {
  SAVE10: { discount: 10, label: "10% off your booking!" },
  HOTEL20: { discount: 20, label: "20% off your booking!" },
  SUMMER15: { discount: 15, label: "15% Summer discount!" },
  VIP30: { discount: 30, label: "30% VIP discount!" },
};