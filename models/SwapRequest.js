import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  offeredEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  requestedEvent: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
});

export default mongoose.model("SwapRequest", swapRequestSchema);
