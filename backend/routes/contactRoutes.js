import express from "express";
import {
  createContactMessage,
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from "../controller/contactController.js";
import { protect, requireRole } from "../MiddleWares/auth.js";

const router = express.Router();

router.get("/", protect, requireRole("admin"), getContactMessages);
router.post("/", protect, createContactMessage);
router.patch("/:id", protect, requireRole("admin"), updateContactMessageStatus);
router.delete("/:id", protect, requireRole("admin"), deleteContactMessage);

export default router;
