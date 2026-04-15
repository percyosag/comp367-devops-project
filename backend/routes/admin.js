const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");


router.use(auth, adminOnly);

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/users/:id/deactivate", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot deactivate another admin account." });
    }

    if (user.isActive === false) {
      return res.status(400).json({ message: "User account is already deactivated." });
    }

    user.isActive = false;
    await user.save();
    res.json({ message: `Account for ${user.name} has been deactivated.` });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

router.patch("/users/:id/reactivate", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.isActive !== false) {
      return res.status(400).json({ message: "User account is already active." });
    }

    user.isActive = true;
    await user.save();
    res.json({ message: `Account for ${user.name} has been reactivated.` });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});


router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete another admin account." });
    }

    await Registration.deleteMany({ user: req.params.id });
    await Event.deleteMany({ organizer: req.params.id });
    await user.deleteOne();

    res.json({ message: `User ${user.name} and all their data have been permanently deleted.` });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});


router.post("/test-reminders", async (req, res) => {
  try {
    const Registration = require("../models/Registration");
    const Event = require("../models/Event");
    const { sendReminderEmail } = require("../services/emailReminder");

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.setHours(0, 0, 0, 0));
    const end   = new Date(tomorrow.setHours(23, 59, 59, 999));

    const events = await Event.find({ date: { $gte: start, $lte: end } });

    let sent = 0;
    let skipped = 0;

    for (const event of events) {
      const pending = await Registration.find({
        event: event._id,
        status: "confirmed",
        reminderSent: false,
      }).populate("user", "name email");

      for (const reg of pending) {
        if (!reg.user?.email) continue;
        await sendReminderEmail({
          toEmail: reg.user.email,
          toName: reg.user.name,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventLocation: event.location,
        });
        reg.reminderSent = true;
        await reg.save();
        sent++;
      }

      const alreadySent = await Registration.countDocuments({
        event: event._id,
        status: "confirmed",
        reminderSent: true,
      });
      skipped += alreadySent;
    }

    res.json({
      message: "Reminder check complete.",
      eventsFound: events.length,
      emailsSent: sent,
      alreadyReminded: skipped,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
