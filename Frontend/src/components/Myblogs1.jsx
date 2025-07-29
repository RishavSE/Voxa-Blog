import React, { useEffect, useState } from "react";
import API from "../api";

const MyBlogs1 = () => {
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [showComments, setShowComments] = useState({});
  const [editingBlog, setEditingBlog] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", content: "" });

  const userEmail = localStorage.getItem("userEmail");

  const fetchBlogs = async () => {
    if (!userEmail) return;
    try {
      const res = await API.get(`/blogs?email=${userEmail}`);
      setBlogs(res.data);
      const initialLikes = {};
      const initialComments = {};
      res.data.forEach((blog) => {
        initialLikes[blog._id] = blog.likes || 0;
        initialComments[blog._id] = blog.comments || [];
      });
      setLikes(initialLikes);
      setComments(initialComments);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [userEmail]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await API.delete(`/blogs/${id}`);
        fetchBlogs();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const handleLike = async (id) => {
    try {
      const res = await API.post(`/blogs/${id}/like`, { userId: userEmail });
      setLikes((prev) => ({ ...prev, [id]: res.data.likes }));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleComment = async (id, text) => {
    if (!text.trim()) return;
    const newComment = {
      text,
      userId: userEmail,
      userName: userEmail?.split("@")[0],
    };
    try {
      const res = await API.post(`/blogs/${id}/comment`, newComment);
      setComments((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), res.data],
      }));
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const renderContent = (content) => {
    if (!content || typeof content !== "object") return null;
    try {
      const nodes = content?.root?.children || [];
      return (
        <div style={{ marginTop: "0.5rem", color: "#444" }}>
          {nodes.map((node, idx) => {
            const text = node.children?.map((child) => child.text || "").join("") || "";
            if (node.type === "list") {
              return (
                <ul key={idx} style={{ marginLeft: "1.5rem", marginBottom: "1rem" }}>
                  {node.children?.map((li, i) => (
                    <li key={i}>{li.children?.map((span) => span.text).join("")}</li>
                  ))}
                </ul>
              );
            }
            return <p key={idx}>{text}</p>;
          })}
        </div>
      );
    } catch (err) {
      console.error("Render error:", err);
      return <p style={{ color: "red" }}>⚠️ Failed to load content</p>;
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>📝 My Blogs</h2>

      {blogs.length === 0 ? (
        <p>No blogs found for your account.</p>
      ) : (
        blogs.map((blog) => (
          <div
            key={blog._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: 8,
              padding: "1rem",
              marginBottom: "1.5rem",
              background: "#fafafa",
            }}
          >
            <h3>{blog.title}</h3>

            {blog.mediaUrl && (
              blog.mediaUrl.includes(".mp4") || blog.mediaUrl.includes("video") ? (
                <video src={blog.mediaUrl} controls style={{ maxWidth: "100%" }} />
              ) : (
                <img src={blog.mediaUrl} alt="media" style={{ display: "block", maxWidth: "100%", objectFit: "contain" }} />
              )
            )}

            {blog.description && (
              <p>
                <strong>Description:</strong> {blog.description}
              </p>
            )}

            {blog.content && renderContent(blog.content)}

            <div style={{ marginTop: "1rem" }}>
              <button onClick={() => handleLike(blog._id)}>
                👍 Like ({likes[blog._id] || 0})
              </button>
              <button
                style={{ marginLeft: "10px" }}
                onClick={() =>
                  setShowComments((prev) => ({
                    ...prev,
                    [blog._id]: !prev[blog._id],
                  }))
                }
              >
                💬 Comment
              </button>
              <button
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  setEditingBlog(blog);
                  const plainText = blog.content?.root?.children?.map((node) =>
                    node.children?.map((c) => c.text).join("")
                  ).join("\n") || "";
                  setEditForm({
                    title: blog.title,
                    description: blog.description,
                    content: plainText,
                  });
                }}
              >
                ✏️ Edit
              </button>
              <button
                style={{ marginLeft: "10px", color: "red" }}
                onClick={() => handleDelete(blog._id)}
              >
                🗑️ Delete
              </button>
            </div>

            {showComments[blog._id] && (
              <div style={{ marginTop: "1rem" }}>
                <h4>Comments</h4>
                <ul>
                  {(comments[blog._id] || []).map((c, i) => (
                    <li key={i}>
                      <strong>{c.userName || c.user}:</strong> {c.text} {" "}
                      <small>({new Date(c.timestamp).toLocaleString()})</small>
                    </li>
                  ))}
                </ul>
                <CommentInput onSubmit={(text) => handleComment(blog._id, text)} />
              </div>
            )}
          </div>
        ))
      )}

      {editingBlog && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "10px", width: "90%", maxWidth: "600px" }}>
            <h3>Edit Blog</h3>
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Title"
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
            />
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Description"
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
            />
            <textarea
              value={editForm.content}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              placeholder="Content"
              rows={6}
              style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
            />
            <div>
              <button onClick={() => setEditingBlog(null)}>Cancel</button>
              <button
                onClick={async () => {
                  try {
                    await API.put(`/blogs/${editingBlog._id}`, {
                      title: editForm.title,
                      description: editForm.description,
                      content: JSON.stringify({ root: { children: [{ type: "paragraph", children: [{ text: editForm.content }] }] } }),
                    });
                    await fetchBlogs();
                    setEditingBlog(null);
                  } catch (err) {
                    console.error("Edit failed:", err);
                    alert("Update failed");
                  }
                }}
                style={{ marginLeft: "1rem", background: "#007bff", color: "#fff", padding: "0.5rem 1rem" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentInput = ({ onSubmit }) => {
  const [text, setText] = useState("");
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ padding: "0.5rem", width: "70%", marginRight: "0.5rem" }}
      />
      <button
        onClick={() => {
          onSubmit(text);
          setText("");
        }}
      >
        Post
      </button>
    </div>
  );
};

export default MyBlogs1;
