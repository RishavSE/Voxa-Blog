import React, { useEffect, useState } from "react";
import styles from "./LatestBlogs.module.css";
import axios from "../api";

const LatestBlogs = ({ setActiveBlog, user }) => {
  const [blogs, setBlogs] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [expandedBlogId, setExpandedBlogId] = useState(null);

  
  const truncateText = (text = "", limit = 100) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await axios.get("/blogs");
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setBlogs(sorted);

        const likeMap = {};
        const commentMap = {};
        sorted.forEach((blog) => {
          likeMap[blog._id] = blog.likes || 0;
          commentMap[blog._id] = blog.comments || [];
        });

        setLikes(likeMap);
        setComments(commentMap);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  
  const handleLike = async (id) => {
    if (!user) return alert("Please login to like the blog.");

    try {
      const res = await axios.post(`/blogs/${id}/like`, {
        userId: user.email,
      });

      setLikes((prev) => ({ ...prev, [id]: res.data.likes }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to like blog.");
    }
  };

  
  const handleAddComment = async (id) => {
    if (!user) return alert("Please login to comment.");

    const text = commentText[id]?.trim();
    if (!text) return;

    try {
      const res = await axios.post(`/blogs/${id}/comment`, {
        userId: user.email,
        userName: user.name,
        text,
      });

      setComments((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), res.data],
      }));

      setCommentText((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  
  const handleDeleteComment = async (blogId, commentId) => {
    if (!user) return;

    try {
      await axios.delete(
        `/blogs/${blogId}/comment/${commentId}?userId=${user.email}`
      );

      setComments((prev) => ({
        ...prev,
        [blogId]: prev[blogId].filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      alert(
        "Failed to delete comment: " +
          (err.response?.data?.error || "")
      );
    }
  };

 
  const renderMedia = (mediaUrl = "") => {
    if (!mediaUrl) return null;
    const isVideo =
      mediaUrl.endsWith(".mp4") || mediaUrl.includes("video");

    return isVideo ? (
      <video
        src={mediaUrl}
        controls
        style={{ width: "100%", borderRadius: 8, margin: "1rem 0" }}
      />
    ) : (
      <img
        src={mediaUrl}
        alt="Blog"
        style={{ width: "100%", borderRadius: 8, margin: "1rem 0" }}
      />
    );
  };

  return (
    <div className={styles.latest}>
      <h2>📚 Latest Blogs</h2>

      <div className={styles.cards}>
        {blogs.map((blog) => (
          <div key={blog._id} className={styles.cardWrapper}>
            <div className={styles.card}>
              {renderMedia(blog.mediaUrl)}

              {/* Title */}
              <h3>
                {truncateText(blog.title, 50)}
                {blog.title.length > 50 && (
                  <span
                    onClick={() => setActiveBlog(blog)}
                    style={{
                      color: "#007bff",
                      cursor: "pointer",
                      marginLeft: "6px",
                    }}
                  >
                    View more
                  </span>
                )}
              </h3>

              {/* Description  */}
              <p>
                <strong>Description:</strong>{" "}
                {truncateText(
                  blog.description || "No description available.",
                  60
                )}
                {(blog.description?.length || 0) > 120 && (
                  <span
                    onClick={() => setActiveBlog(blog)}
                    style={{
                      color: "#007bff",
                      cursor: "pointer",
                      marginLeft: "6px",
                    }}
                  >
                    View more
                  </span>
                )}
              </p>

              {/* Buttons  */}
              <div className={styles.buttons}>
                <button onClick={() => handleLike(blog._id)}>
                  👍 Like ({likes[blog._id] || 0})
                </button>

                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => {
                    if (!user) return alert("Login to comment.");
                    setExpandedBlogId(blog._id);
                  }}
                >
                  💬 Comment
                </button>

                <button
                  style={{ marginLeft: "10px" }}
                  onClick={() => setActiveBlog(blog)}
                >
                  👁️ View More
                </button>
              </div>

              {/* Comments  */}
              {expandedBlogId === blog._id && (
                <div style={{ marginTop: "1rem" }}>
                  <h4>💬 Comments</h4>

                  <ul>
                    {(comments[blog._id] || []).map((c) => (
                      <li
                        key={c._id}
                        style={{ marginBottom: "0.5rem" }}
                      >
                        <strong>{c.userName}:</strong> {c.text}

                        {c.timestamp && (
                          <small style={{ color: "#999" }}>
                            {" "}
                            ({new Date(c.timestamp).toLocaleString()})
                          </small>
                        )}

                        {user?.email === c.userId && (
                          <button
                            onClick={() =>
                              handleDeleteComment(
                                blog._id,
                                c._id
                              )
                            }
                            style={{
                              marginLeft: "10px",
                              color: "red",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[blog._id] || ""}
                    onChange={(e) =>
                      setCommentText((prev) => ({
                        ...prev,
                        [blog._id]: e.target.value,
                      }))
                    }
                    style={{
                      padding: "0.5rem",
                      width: "70%",
                      marginRight: "0.5rem",
                    }}
                  />
                  <button onClick={() => handleAddComment(blog._id)}>
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestBlogs;
