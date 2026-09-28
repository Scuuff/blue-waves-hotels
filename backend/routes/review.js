// routes/reviews.js
import express from "express";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controller/reviewController.js";
import { protect } from "../MiddleWares/auth.js";

const router = express.Router();

router.get("/", getReviews);
router.post("/", protect, createReview);
router.patch("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

export default router;
