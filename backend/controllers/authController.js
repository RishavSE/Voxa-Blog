const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// @route   POST /register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role: role || "user", // Default to "user" if not provided
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
};

// @route   POST /reset-password
// @desc    Reset user password
// @access  Public
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route   POST /login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    // Find user with email and role
    const user = await User.findOne({ email, role });
    if (!user)
      return res
        .status(404)
        .json({ message: "Invalid credentials (email or role mismatch)" });

    // Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    user.lastLogin = new Date();
    await user.save();
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return response
    res.status(200).json({
      token,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
