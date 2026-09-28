// This file just stores the starting offers data
// In Phase 2, this will come from MongoDB instead

// Prices use the actual hotel room per-night rate from hotels.js
export const initialOffers = [
  {
    id: 1,
    title: "Royal Suite Escape",
    type: "Bundle",
    discount: 30,
    originalPrice: 650,   // Royal Penthouse, Alexandria — hotel.price
    pricePerNight: 455,   // 650 × 70%
    expiryDate: "2026-05-10",
    active: true,
    badge: "Most Popular",
  },
  {
    id: 2,
    title: "Triple Room Deal",
    type: "Discount",
    discount: 25,
    originalPrice: 120,   // Standard Room, Alexandria — hotel.price
    pricePerNight: 90,    // 120 × 75%
    expiryDate: "2026-05-20",
    active: true,
    badge: "Limited Rooms",
  },
  {
    id: 3,
    title: "Honeymoon Paradise",
    type: "Package",
    discount: 25,
    originalPrice: 320,   // Ocean View Suite, Alexandria — hotel.price
    pricePerNight: 240,   // 320 × 75%
    expiryDate: "2026-06-01",
    active: true,
    badge: "Romantic",
  },
  {
    id: 4,
    title: "Business & Comfort",
    type: "Package",
    discount: 25,
    originalPrice: 295,   // Business Suite, Cairo — hotel.price
    pricePerNight: 221,   // 295 × 75%
    expiryDate: "2026-05-25",
    active: true,
    badge: "Weekday Deal",
  },
  {
    id: 5,
    title: "Summer Splash Package",
    type: "Seasonal",
    discount: 32,
    originalPrice: 340,   // Coral Suite, Sharm El Sheikh — hotel.price
    pricePerNight: 231,   // 340 × 68%
    expiryDate: "2026-07-01",
    active: true,
    badge: "Summer Special",
  },
  {
    id: 6,
    title: "Weekend Family Fun",
    type: "Bundle",
    discount: 27,
    originalPrice: 620,   // Sunset Penthouse, Marsa Alam — hotel.price
    pricePerNight: 453,   // 620 × 73%
    expiryDate: "2026-05-15",
    active: true,
    badge: "Family",
  },
];

// All available offer types for the form dropdown
export const offerTypes = ["Bundle", "Discount", "Package", "Seasonal"];

// All available badges for the form dropdown
export const badgeOptions = [
  "Most Popular",
  "Limited Rooms",
  "Romantic",
  "Weekday Deal",
  "Summer Special",
  "Family",
];