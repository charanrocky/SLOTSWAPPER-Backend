import express from "express";
import {
  createSwapRequest,
  getRequests,
  acceptSwap,
} from "../controllers/swapController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createSwapRequest);
router.get("/", protect, getRequests);
router.post("/:id/accept", protect, acceptSwap);

export default router;
