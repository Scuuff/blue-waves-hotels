import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },
    hotelName: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
      default: "Blue Wave Hotel",
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be less than 0"],
      max: [5, "Rating cannot be more than 5"],
      default: 0,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
      match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);