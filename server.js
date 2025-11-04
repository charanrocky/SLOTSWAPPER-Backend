import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import swapRoutes from "./routes/swapRoutes.js";

import job from "./config/cron.js";

if (process.env.NODE_ENV === "production") job.start();
dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/swaps", swapRoutes);

app.get("/api/hello", (req, res) => {
  res.send("Its'Working");
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});
global.io = io; // so controllers can emit
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  socket.join(userId);

  socket.on("sendSwapAccepted", (data) => {
    io.to(data.toUserId).emit("swapAccepted", {
      otherUser: data.fromName,
    });
  });

  socket.on("sendSwapRequest", (data) => {
    io.to(data.toUserId).emit("newSwapRequest", {
      from: data.fromName,
    });
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
