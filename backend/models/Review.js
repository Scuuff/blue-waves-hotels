// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    title: String,
    comment: String,
    rating: Number,
    branch: String,
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    userId: String, // from JWT
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

export default mongoose.model("Review", reviewSchema);
