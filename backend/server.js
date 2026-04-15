const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected successfully!"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/events", require("./routes/events"));
app.use("/api/registrations", require("./routes/registrations"));
app.use("/api/admin", require("./routes/admin")); // R2 US12

const { startReminderScheduler } = require("./services/notificationService");
startReminderScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
