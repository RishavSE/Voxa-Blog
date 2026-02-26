const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: String, required: true },   
  userName: { type: String, required: true }, 
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const blogSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: Object,
  mediaUrl: String,
  email: String, 
  createdAt: { type: Date, default: Date.now },

 
  likes: { type: Number, default: 0 },
  likedUsers: [String], 
  comments: [commentSchema] 
});

module.exports = mongoose.model("Blog", blogSchema);
