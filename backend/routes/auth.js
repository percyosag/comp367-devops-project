const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const allowedRoles = ["community_member", "organizer"];
    const userRole = allowedRoles.includes(role) ? role : "community_member";

    const newUser = new User({ name, email: email.toLowerCase(), password: hashedPassword, role: userRole });
    await newUser.save();

    res.status(201).json({ message: "Account created successfully. Please log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact an administrator." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/fix-users", async (req, res) => {
  try {
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    res.json({ message: "Fixed", usersUpdated: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
