import express from "express";
import {
  getMyEvents,
  createEvent,
  updateEvent,
  getSwappableSlots,
} from "../controllers/eventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.get("/swappable", protect, getSwappableSlots);

export default router;
