import React, { useEffect, useState } from "react";
import API from "../api";

const MyBlogs1 = () => {
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [likedBlogs, setLikedBlogs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [editingBlog, setEditingBlog] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    content: "",
  });

  const userEmail = localStorage.getItem("userEmail");

  const fetchBlogs = async () => {
    if (!userEmail) return;

    try {
      const res = await API.get(`/blogs?email=${userEmail}`);
      setBlogs(res.data);

      const likeMap = {};
      const commentMap = {};
      const likedMap = {};

      res.data.forEach((blog) => {
        likeMap[blog._id] = blog.likes || 0;
        commentMap[blog._id] = blog.comments || [];
        likedMap[blog._id] = blog.likedUsers?.includes(userEmail);
      });

      setLikes(likeMap);
      setComments(commentMap);
      setLikedBlogs(likedMap);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [userEmail]);

  const handleLike = async (id) => {
    try {
      const res = await API.post(`/blogs/${id}/like`, {
        userId: userEmail,
      });

      setLikes((prev) => ({
        ...prev,
        [id]: res.data.likes,
      }));

      setLikedBlogs((prev) => ({
        ...prev,
        [id]: !prev[id],
      }));
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const handleComment = async (id) => {
    const text = (commentText[id] || "").trim();
    if (!text) return;

    try {
      const res = await API.post(`/blogs/${id}/comment`, {
        text,
        userId: userEmail,
        userName: userEmail?.split("@")[0],
      });

      setComments((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), res.data],
      }));

      setCommentText((prev) => ({
        ...prev,
        [id]: "",
      }));
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await API.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const renderContent = (content) => {
    if (!content?.root?.children) return null;

    return content.root.children.map((node, idx) => {
      if (node.type === "list") {
        return (
          <ul key={idx} style={{ paddingLeft: "20px" }}>
            {node.children.map((li, i) => (
              <li key={i}>
                {li.children.map((c) => c.text).join("")}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx}>
          {node.children.map((c) => c.text).join("")}
        </p>
      );
    });
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>📝 My Blogs</h2>

      {blogs.length === 0 ? (
        <p>No blogs found</p>
      ) : (
        blogs.map((blog) => {
          const liked = likedBlogs[blog._id];

          return (
            <div
              key={blog._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "16px",
                padding: "1.5rem",
                marginBottom: "1.5rem",
                background: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h3>{blog.title}</h3>

              {blog.mediaUrl &&
                (blog.mediaUrl.includes("video") ? (
                  <video
                    src={blog.mediaUrl}
                    controls
                    style={{ width: "100%", borderRadius: "12px" }}
                  />
                ) : (
                  <img
                    src={blog.mediaUrl}
                    alt=""
                    style={{ width: "100%", borderRadius: "12px" }}
                  />
                ))}

              {blog.description && <p>{blog.description}</p>}
              {renderContent(blog.content)}

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => handleLike(blog._id)}
                  style={{
                    borderRadius: "25px",
                    padding: "6px 14px",
                    border: "none",
                    background: "#f1f1f1",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      color: liked ? "red" : "black",
                    }}
                  >
                    {liked ? "❤️" : "🤍"}
                  </span>{" "}
                  {likes[blog._id] || 0}
                </button>

                <button
                  onClick={() =>
                    setShowComments((prev) => ({
                      ...prev,
                      [blog._id]: !prev[blog._id],
                    }))
                  }
                  style={{
                    borderRadius: "25px",
                    padding: "6px 14px",
                    border: "none",
                    background: "#f1f1f1",
                    cursor: "pointer",
                  }}
                >
                  💬 Comment
                </button>

                <button
                  onClick={() => {
                    setEditingBlog(blog);

                    const plainText =
                      blog.content?.root?.children
                        ?.map((node) =>
                          node.children?.map((c) => c.text).join("")
                        )
                        .join("\n") || "";

                    setEditForm({
                      title: blog.title,
                      description: blog.description,
                      content: plainText,
                    });
                  }}
                  style={{
                    borderRadius: "25px",
                    padding: "6px 14px",
                    border: "none",
                    background: "#e3f2fd",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => handleDelete(blog._id)}
                  style={{
                    borderRadius: "25px",
                    padding: "6px 14px",
                    border: "none",
                    background: "#fdecea",
                    color: "red",
                    cursor: "pointer",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              {showComments[blog._id] && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "1rem",
                    borderRadius: "16px",
                    background: "#f9f9f9",
                  }}
                >
                  <h4>💬 Comments</h4>

                  {(comments[blog._id] || []).map((c, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        padding: "8px",
                        borderRadius: "12px",
                        marginBottom: "8px",
                      }}
                    >
                      <strong>{c.userName || c.user}:</strong> {c.text}
                      <br />
                      <small>
                        {new Date(c.timestamp).toLocaleString()}
                      </small>
                    </div>
                  ))}

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "10px",
                    }}
                  >
                    <input
                      value={commentText[blog._id] || ""}
                      onChange={(e) =>
                        setCommentText((prev) => ({
                          ...prev,
                          [blog._id]: e.target.value,
                        }))
                      }
                      placeholder="Write comment..."
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "20px",
                        border: "1px solid #ccc",
                      }}
                    />

                    <button
                      onClick={() => handleComment(blog._id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "20px",
                        background: "#007bff",
                        color: "#fff",
                        border: "none",
                      }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {editingBlog && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "90%",
              maxWidth: "600px",
            }}
          >
            <h3>Edit Blog</h3>

            <input
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              style={{
                width: "100%",
                marginBottom: "1rem",
                borderRadius: "10px",
                padding: "8px",
              }}
            />

            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  description: e.target.value,
                })
              }
              style={{
                width: "100%",
                marginBottom: "1rem",
                borderRadius: "10px",
                padding: "8px",
              }}
            />

            <textarea
              value={editForm.content}
              onChange={(e) =>
                setEditForm({ ...editForm, content: e.target.value })
              }
              rows={6}
              style={{
                width: "100%",
                marginBottom: "1rem",
                borderRadius: "10px",
                padding: "8px",
              }}
            />

            <button onClick={() => setEditingBlog(null)}>
              Cancel
            </button>

            <button
              onClick={async () => {
                await API.put(`/blogs/${editingBlog._id}`, {
                  title: editForm.title,
                  description: editForm.description,
                  content: JSON.stringify({
                    root: {
                      children: [
                        {
                          type: "paragraph",
                          children: [{ text: editForm.content }],
                        },
                      ],
                    },
                  }),
                });

                fetchBlogs();
                setEditingBlog(null);
              }}
              style={{
                marginLeft: "10px",
                borderRadius: "10px",
                padding: "6px 12px",
                background: "#007bff",
                color: "#fff",
                border: "none",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBlogs1;
