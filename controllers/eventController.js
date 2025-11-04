import Event from "../models/Event.js";

export const getMyEvents = async (req, res) => {
  const events = await Event.find({ user: req.user._id });
  res.json(events);
};

export const createEvent = async (req, res) => {
  const { title, date } = req.body;
  const event = await Event.create({ user: req.user._id, title, date });
  res.status(201).json(event);
};

export const updateEvent = async (req, res) => {
  const { isSwappable } = req.body;
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: "Event not found" });
  if (event.user.toString() !== req.user._id.toString())
    return res.status(401).json({ message: "Not authorized" });

  event.isSwappable = isSwappable;
  await event.save();
  res.json(event);
};
export const getSwappableSlots = async (req, res) => {
  try {
    const events = await Event.find({
      isSwappable: true,
      user: { $ne: req.user._id }, // exclude own events
    }).populate("user", "name email");

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch swappable slots" });
  }
};
