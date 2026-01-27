const express = require("express");
const multer = require("multer");
const { cloudinary } = require("../utils/Cloudnary");
const Blog = require("../models/Blogs");
const { v4: uuidv4 } = require("uuid"); // for comment IDs

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ GET all blogs (optionally filter by user email)
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    const blogs = await Blog.find(email ? { email } : {}).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    console.error("GET /blogs error:", err);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
});

// ✅ POST a new blog
router.post("/", upload.single("media"), async (req, res) => {
  try {
    let mediaUrl = null;

    if (req.file) {
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      const uploadRes = await cloudinary.uploader.upload(base64, {
        folder: "voxablogs",
        resource_type: "auto",
      });
      mediaUrl = uploadRes.secure_url;
    }

    const newBlog = new Blog({
      title: req.body.title,
      description: req.body.description,
      content: JSON.parse(req.body.content),
      mediaUrl,
      email: req.body.email,
      createdAt: new Date(),
      likes: 0,
      likedUsers: [],
      comments: [],
    });

    const saved = await newBlog.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /blogs error:", err);
    res.status(500).json({ error: "Failed to post blog" });
  }
});

// ✅ POST /blogs/:id/like → like a blog post
router.post("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.likedUsers.includes(userId)) {
      return res.status(400).json({ error: "Already liked" });
    }

    blog.likes += 1;
    blog.likedUsers.push(userId);
    await blog.save();
    res.json({ likes: blog.likes });
  } catch (err) {
    console.error("POST /blogs/:id/like error:", err);
    res.status(500).json({ error: "Failed to like blog" });
  }
});

// ✅ POST /blogs/:id/comment → add comment
router.post("/:id/comment", async (req, res) => {
  try {
    console.log("🔵 Comment POST body:", req.body);
    const { userId, userName, text } = req.body;

    if (!text || !userId || !userName) {
      return res.status(400).json({ error: "Missing data" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const newComment = {
      userId,
      userName,
      text,
      timestamp: new Date(),
    };

    blog.comments.push(newComment);
    await blog.save();
   res.status(201).json(
      blog.comments[blog.comments.length - 1]
    );
  } catch (err) {
    console.error("❌ POST /blogs/:id/comment error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ✅ DELETE /blogs/:id/comment/:commentId → delete comment
router.delete("/:id/comment/:commentId", async (req, res) => {
  try {
    const { userId } = req.query; 

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    const comment = blog.comments.find(
      (c) => c._id.toString() === req.params.commentId 
    );
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comment" });
    }

    blog.comments = blog.comments.filter(
      (c) => c._id.toString() !== req.params.commentId 
    );

    await blog.save();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    console.error("DELETE comment error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// ✅ PUT /blogs/:id → update blog
router.put("/:id", async (req, res) => {
  try {
    const { title, description, content } = req.body;

    const updated = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        content: JSON.parse(content),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Blog not found" });

    res.json(updated);
  } catch (err) {
    console.error("PUT /blogs/:id error:", err);
    res.status(500).json({ error: "Failed to update blog" });
  }
});

// ✅ DELETE /blogs/:id → delete blog
router.delete("/:id", async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("DELETE /blogs/:id error:", err);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});

module.exports = router;
