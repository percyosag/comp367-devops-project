const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer", "name email");
    if (!event) return res.status(404).json({ message: "Event not found." });

    const registeredCount = await Registration.countDocuments({
      event: req.params.id,
      status: { $ne: "cancelled" }
    });

    const spotsLeft = event.capacity - registeredCount;

    res.json({ ...event.toObject(), registeredCount, spotsLeft });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "Event not found." });
    }
    res.status(500).json({ message: "Server error." });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res.status(403).json({ message: "Only organizers can create events." });
    }

    const { title, description, date, time, location, capacity } = req.body;

    if (!title || !description || !date || !time || !location || !capacity) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const formattedDate = date.split("T")[0];

    if (new Date(formattedDate) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({ message: "Event date cannot be in the past." });
    }

    if (Number(capacity) < 1) {
      return res.status(400).json({ message: "Capacity must be at least 1." });
    }

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date: formattedDate,   
      time,
      location: location.trim(),
      capacity: Number(capacity),
      organizer: req.user.id,
    });

    const event = await newEvent.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create event." });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own events." });
    }

    const { title, description, date, time, location, capacity } = req.body;

    if (!title || !description || !date || !time || !location || !capacity) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const confirmedCount = await Registration.countDocuments({
      event: req.params.id,
      status: "confirmed"
    });

    if (Number(capacity) < confirmedCount) {
      return res.status(400).json({
        message: `Cannot reduce capacity below current confirmed registrations (${confirmedCount}).`
      });
    }

    const formattedDate = date.split("T")[0]; 

    event.title = title.trim();
    event.description = description.trim();
    event.date = formattedDate;   
    event.time = time;
    event.location = location.trim();
    event.capacity = Number(capacity);

    const updated = await event.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update event." });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own events." });
    }

    await Registration.deleteMany({ event: req.params.id });
    await event.deleteOne();

    res.json({ message: "Event and all its registrations have been deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event." });
  }
});

module.exports = router;
