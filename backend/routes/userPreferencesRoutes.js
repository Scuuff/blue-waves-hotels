import express from "express";
import {
  deleteUserPreferenceScope,
  getUserPreferenceScope,
  saveUserPreferenceScope,
} from "../controller/userPreferencesController.js";
import { protect, requireRole } from "../MiddleWares/auth.js";

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/:scope", getUserPreferenceScope);
router.post("/:scope", saveUserPreferenceScope);
router.delete("/:scope", deleteUserPreferenceScope);

export default router;
