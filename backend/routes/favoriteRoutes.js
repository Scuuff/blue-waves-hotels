import express from "express";
import { protect } from "../MiddleWares/auth.js";
import {
  toggleFavorite,
  getMyFavorites,
} from "../controller/favoriteController.js";

const router = express.Router();

router.get("/", protect, getMyFavorites);
router.post("/toggle", protect, toggleFavorite);

export default router;