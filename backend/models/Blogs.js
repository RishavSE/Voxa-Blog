const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },   // user email or MongoDB _id
  userName: { type: String, required: true }, // display name
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: Object,
  mediaUrl: String,
  email: String, // blog owner email
  createdAt: { type: Date, default: Date.now },

  // ✅ New fields
  likes: { type: Number, default: 0 },
  likedUsers: [String], // optional: user IDs/emails who liked to prevent duplicates
  comments: [commentSchema] // embedded subdocument array
});

module.exports = mongoose.model("Blog", blogSchema);
