const express = require("express");
const router = express.Router();
const { register, login, resetPassword } = require("../controllers/authController");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword); // Add this line

module.exports = router;
