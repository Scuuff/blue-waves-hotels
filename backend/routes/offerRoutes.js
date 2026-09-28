import express from "express";
import { body, param } from "express-validator";
import {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  toggleOffer,
  deleteOffer,
} from "../controllers/offerController.js";
import { protect } from "../MiddleWares/auth.js";

const router = express.Router();

// Admin-only guard — runs after `protect`, which attaches req.user from the JWT
const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// Validation rules for creating/updating an offer
const offerRules = [
  body("title").trim().notEmpty().withMessage("Title is required")
    .isLength({ max: 120 }).withMessage("Title must be at most 120 characters"),
  body("type").isIn(["Bundle", "Discount", "Package", "Seasonal"])
    .withMessage("Type must be Bundle, Discount, Package, or Seasonal"),
  body("badge").trim().notEmpty().withMessage("Badge is required"),
  body("discount").isInt({ min: 1, max: 99 })
    .withMessage("Discount must be an integer between 1 and 99"),
  body("originalPrice").isFloat({ min: 1 })
    .withMessage("Original price must be a positive number"),
  body("pricePerNight").isFloat({ min: 1 })
    .withMessage("Price per night must be a positive number"),
  body("expiryDate").isISO8601().withMessage("Expiry date must be a valid date"),
  body("roomId").optional().isMongoId().withMessage("roomId must be a valid room id"),
  body("hotelId").optional().isInt().withMessage("hotelId must be an integer"),
  body("description").optional().isString().trim()
    .isLength({ max: 500 }).withMessage("Description must be at most 500 characters"),
];

// Validates that :id in the URL is a valid MongoDB ObjectId
const idRule = [param("id").isMongoId().withMessage("Invalid offer id")];

// PUBLIC — anyone can view offers
router.get("/", getOffers);
router.get("/:id", idRule, getOfferById);

// PROTECTED — admin only (valid JWT + role === "admin")
router.post("/", protect, requireAdmin, offerRules, createOffer);
router.put("/:id", protect, requireAdmin, idRule, offerRules, updateOffer);
router.patch("/:id/toggle", protect, requireAdmin, idRule, toggleOffer);
router.delete("/:id", protect, requireAdmin, idRule, deleteOffer);

export default router;
