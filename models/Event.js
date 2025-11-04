import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  date: Date,
  isSwappable: { type: Boolean, default: false },
});

export default mongoose.model("Event", eventSchema);
