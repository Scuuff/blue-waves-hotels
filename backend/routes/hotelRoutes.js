import express from "express";
import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
  getAllListingRooms,
} from "../controller/hotelController.js";
import { protect, requireRole } from "../MiddleWares/auth.js";
import { hotelRules } from "../MiddleWares/validators.js";

const router = express.Router();

router.get("/", getAllHotels);
router.get("/listing-rooms", getAllListingRooms);
router.get("/:id", getHotelById);

router.post("/", protect, requireRole("admin"), hotelRules, createHotel);
router.put("/:id", protect, requireRole("admin"), hotelRules, updateHotel);
router.delete("/:id", protect, requireRole("admin"), deleteHotel);

export default router;