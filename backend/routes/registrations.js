const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  const { eventId } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: "eventId is required." });
  }

  try {
    if (req.user.role !== "community_member") {
      return res
        .status(403)
        .json({ message: "Only community members can register for events." });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (new Date(event.date) < new Date().setHours(0, 0, 0, 0)) {
      return res.status(400).json({
        message: "Cannot register for an event that has already passed.",
      });
    }

    const existing = await Registration.findOne({
      event: eventId,
      user: req.user.id,
    });
    if (existing) {
      if (existing.status === "cancelled") {
        const confirmedCount = await Registration.countDocuments({
          event: eventId,
          status: "confirmed",
        });
        existing.status =
          confirmedCount >= event.capacity ? "waitlisted" : "confirmed";
        existing.registrationDate = new Date();
        existing.reminderSent = false;
        await existing.save();
        return res.status(200).json({
          message:
            existing.status === "waitlisted"
              ? "Event is full. You have been added to the waitlist."
              : "Re-registration successful!",
          registration: existing,
        });
      }
      return res
        .status(400)
        .json({ message: "You are already registered for this event." });
    }

    // const confirmedCount = await Registration.countDocuments({ event: eventId, status: "confirmed" });
    // const status = confirmedCount >= event.capacity ? "waitlisted" : "confirmed";

    const confirmedCount = await Registration.countDocuments({
      event: eventId,
      status: "confirmed",
    });

    let status = "confirmed";

    if (confirmedCount >= event.capacity) {
      status = "waitlisted";
    }

    const newRegistration = new Registration({
      event: eventId,
      user: req.user.id,
      status,
    });
    await newRegistration.save();

    return res.status(201).json({
      message:
        status === "waitlisted"
          ? "Event is full. You have been added to the waitlist."
          : "Registration successful!",
      registration: newRegistration,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Registration failed." });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user.id })
      .populate("event")
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/event/:eventId", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: "Event not found." });

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You do not own this event." });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate("user", "name email")
      .sort({ status: 1, createdAt: 1 });

    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration)
      return res.status(404).json({ message: "Registration not found." });

    if (registration.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own registrations." });
    }

    if (registration.status === "cancelled") {
      return res
        .status(400)
        .json({ message: "This registration is already cancelled." });
    }

    const wasConfirmed = registration.status === "confirmed";
    registration.status = "cancelled";
    await registration.save();

    if (wasConfirmed) {
      const nextWaitlisted = await Registration.findOne({
        event: registration.event,
        status: "waitlisted",
      }).sort({ createdAt: 1 });

      if (nextWaitlisted) {
        nextWaitlisted.status = "confirmed";
        await nextWaitlisted.save();
      }
    }

    res.json({ message: "Registration cancelled successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to cancel registration." });
  }
});

router.get("/event/:eventId/export", auth, async (req, res) => {
  try {
    // const event = await Event.findById(req.params.eventId);
    // if (!event) return res.status(404).json({ message: "Event not found." });
    if (!event.capacity || event.capacity <= 0) {
      return res
        .status(400)
        .json({ message: "Event capacity is not properly configured." });
    }

    if (
      event.organizer.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. You do not own this event." });
    }

    const registrations = await Registration.find({
      event: req.params.eventId,
      status: { $ne: "cancelled" },
    })
      .populate("user", "name email")
      .sort({ status: 1, createdAt: 1 });

    const header = "Name,Email,Status,Registered On\n";
    const rows = registrations.map((r) => {
      const name = `"${r.user?.name || "N/A"}"`;
      const email = `"${r.user?.email || "N/A"}"`;
      const status = r.status;
      const date = new Date(r.registrationDate).toLocaleDateString();
      return `${name},${email},${status},${date}`;
    });

    const csv = header + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="participants-${req.params.eventId}.csv"`,
    );
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to export participants." });
  }
});

module.exports = router;
