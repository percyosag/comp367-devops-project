const cron = require("node-cron");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const User = require("../models/User");
const { sendReminderEmail } = require("./emailReminder");

function startReminderScheduler() {
  cron.schedule("0 8 * * *", async () => {
    console.log("[Scheduler] Running daily reminder check...");

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      const upcomingEvents = await Event.find({
        date: { $gte: startOfTomorrow, $lte: endOfTomorrow },
      });

      for (const event of upcomingEvents) {
        const pendingReminders = await Registration.find({
          event: event._id,
          status: "confirmed",
          reminderSent: false,
        }).populate("user", "name email");

        for (const reg of pendingReminders) {
          if (!reg.user?.email) continue;

          try {
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

            console.log(`[Scheduler] Reminder sent to ${reg.user.email} for "${event.title}"`);
          } catch (emailErr) {
            console.error(`[Scheduler] Failed to send reminder to ${reg.user.email}:`, emailErr.message);
          }
        }
      }

      console.log("[Scheduler] Reminder check complete.");
    } catch (err) {
      console.error("[Scheduler] Error during reminder check:", err.message);
    }
  });

  console.log("[Scheduler] Daily reminder scheduler started (runs at 8:00 AM).");
}

module.exports = { startReminderScheduler };
