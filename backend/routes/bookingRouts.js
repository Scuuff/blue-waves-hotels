import express from "express";
import {
  createBooking,
  searchAvailability,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getMyBookings,
  cancelMyBooking,
} from "../controller/bookingController.js";

import { protect } from "../MiddleWares/auth.js";

const router = express.Router();

router.post("/search", searchAvailability);
router.get("/", getBookings);
router.get("/my-bookings", protect, getMyBookings);
router.get("/:id", getBookingById);
router.post("/", protect, createBooking);
router.patch("/:id", protect, updateBooking);
router.patch("/:id/cancel", protect, cancelMyBooking);
router.delete("/:id", protect, deleteBooking);

export default router;