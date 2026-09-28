import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      default: "Blue Wave Hotel",
      trim: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    roomName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Standard", "Deluxe", "Suite", "Penthouse"],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
    },
    beds: {
      type: Number,
      required: true,
      min: 1,
    },
    baths: {
      type: Number,
      required: true,
      min: 1,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    available: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Maintenance"],
      default: "Available",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    dateStatuses: {
      type: Map,
      of: {
        type: String,
        enum: ["available", "reserved"],
      },
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
