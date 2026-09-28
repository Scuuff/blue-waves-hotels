import express from "express";
import {
  createRoom,
  getRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getFeaturedRooms,
  filterRooms,
   userSearchRooms,
} from "../controller/roomController.js";
import { protect } from "../MiddleWares/auth.js";

const router = express.Router();

router.get("/featured", getFeaturedRooms);
router.get("/filter", filterRooms);
router.get("/user-search", userSearchRooms);
router.get("/", getRooms);
router.get("/:id", getRoomById);

router.post("/", protect, createRoom);
router.patch("/:id", protect, updateRoom);
router.delete("/:id", protect, deleteRoom);

export default router;