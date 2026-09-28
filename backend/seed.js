import mongoose from "mongoose";
import dotenv from "dotenv";
import Offer from "./models/Offer.js";

dotenv.config({ path: "./backend/.env" });

// Expiry dates are relative to the seed run, not hardcoded calendar dates —
// fixed dates silently go stale and make every seeded offer read as expired.
const daysFromNow = (days) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const seedOffers = [
  {
    title: "Royal Suite Escape",
    type: "Bundle",
    badge: "Most Popular",
    discount: 30,
    originalPrice: 650,
    pricePerNight: 455,
    expiryDate: daysFromNow(30),
    active: true,
    hotelId: 4,
  },
  {
    title: "Triple Room Deal",
    type: "Discount",
    badge: "Limited Rooms",
    discount: 25,
    originalPrice: 120,
    pricePerNight: 90,
    expiryDate: daysFromNow(45),
    active: true,
    hotelId: 1,
  },
  {
    title: "Honeymoon Paradise",
    type: "Package",
    badge: "Romantic",
    discount: 25,
    originalPrice: 320,
    pricePerNight: 240,
    expiryDate: daysFromNow(60),
    active: true,
    hotelId: 3,
  },
  {
    title: "Business & Comfort",
    type: "Package",
    badge: "Weekday Deal",
    discount: 25,
    originalPrice: 295,
    pricePerNight: 221,
    expiryDate: daysFromNow(50),
    active: true,
    hotelId: 11,
  },
  {
    title: "Summer Splash Package",
    type: "Seasonal",
    badge: "Summer Special",
    discount: 32,
    originalPrice: 340,
    pricePerNight: 231,
    expiryDate: daysFromNow(90),
    active: true,
    hotelId: 15,
  },
  {
    title: "Weekend Family Fun",
    type: "Bundle",
    badge: "Family",
    discount: 27,
    originalPrice: 620,
    pricePerNight: 453,
    expiryDate: daysFromNow(21),
    active: true,
    hotelId: 8,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    await Offer.deleteMany(); // clear old offers first
    await Offer.insertMany(seedOffers);

    console.log("✅ 6 offers seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seed();
