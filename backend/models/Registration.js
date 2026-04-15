const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["confirmed", "waitlisted", "cancelled"],
      default: "confirmed",
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Registration", RegistrationSchema);
