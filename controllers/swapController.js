import SwapRequest from "../models/SwapRequest.js";
import Event from "../models/Event.js";

// ✅ Create a new swap request
export const createSwapRequest = async (req, res) => {
  try {
    const { requestedEventId, offeredEventId } = req.body;

    if (!requestedEventId || !offeredEventId) {
      return res.status(400).json({ message: "Both event IDs are required" });
    }

    // Find both events with their owners
    const requestedEvent = await Event.findById(requestedEventId).populate(
      "user"
    );
    const offeredEvent = await Event.findById(offeredEventId).populate("user");

    if (!requestedEvent || !offeredEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!requestedEvent.user || !offeredEvent.user) {
      return res.status(400).json({ message: "Event missing assigned user" });
    }

    // Create swap request
    const swap = await SwapRequest.create({
      requester: req.user._id,
      receiver: requestedEvent.user._id,
      requestedEvent: requestedEvent._id,
      offeredEvent: offeredEvent._id,
      status: "pending",
    });

    // ✅ Emit to receiver user in real time
    if (global.io && requestedEvent.user && requestedEvent.user._id) {
      global.io
        .to(requestedEvent.user._id.toString())
        .emit("swap-request-received", {
          fromUser: req.user._id,
          fromName: req.user.name,
          offeredEvent: offeredEvent.title,
          requestedEvent: requestedEvent.title,
        });
    }

    res.status(201).json(swap);
  } catch (error) {
    console.error("Error in createSwapRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get incoming and outgoing requests for logged-in user
export const getRequests = async (req, res) => {
  try {
    const incoming = await SwapRequest.find({
      receiver: req.user._id,
    }).populate("offeredEvent requestedEvent requester", "name title date");
    const outgoing = await SwapRequest.find({
      requester: req.user._id,
    }).populate("offeredEvent requestedEvent receiver", "name title date");
    res.json({ incoming, outgoing });
  } catch (error) {
    console.error("Error fetching swap requests:", error);
    res.status(500).json({ message: "Failed to fetch requests" });
  }
};

// ✅ Accept a swap request and swap ownership
export const acceptSwap = async (req, res) => {
  try {
    const { id } = req.params;
    const swap = await SwapRequest.findById(id).populate(
      "offeredEvent requestedEvent requester receiver"
    );

    if (!swap) return res.status(404).json({ message: "Swap not found" });

    // Ensure only the receiver can accept
    if (swap.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Swap ownership of the two events
    const tempUser = swap.offeredEvent.user;
    swap.offeredEvent.user = swap.requestedEvent.user;
    swap.requestedEvent.user = tempUser;
    swap.status = "accepted";

    await swap.offeredEvent.save();
    await swap.requestedEvent.save();
    await swap.save();

    // ✅ Notify both users
    if (global.io) {
      // Notify requester that their swap was accepted
      global.io.to(swap.requester._id.toString()).emit("swap-updated", {
        fromName: swap.receiver.name,
        offeredEvent: swap.offeredEvent.title,
        requestedEvent: swap.requestedEvent.title,
      });

      // Notify receiver as confirmation
      global.io.to(swap.receiver._id.toString()).emit("swap-confirmed", {
        message: "You successfully accepted the swap!",
      });
    }

    res.json({ message: "Swap accepted successfully" });
  } catch (error) {
    console.error("Error in acceptSwap:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
