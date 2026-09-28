import express from "express";
import { protect } from "../MiddleWares/auth.js";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../controller/profileController.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.put("/change-password", protect, changeMyPassword);

export default router;