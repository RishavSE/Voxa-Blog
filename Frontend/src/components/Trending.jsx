import React, { useEffect, useState } from 'react';
import styles from './Trending.module.css';
import API from '../api';

const Trending = ({ setActiveBlog, user }) => {
  const [blogs, setBlogs] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [commentText, setCommentText] = useState({});

  // Fetch blogs
  useEffect(() => {
    API.get('/blogs')
      .then((res) => {
        const sorted = res.data
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        setBlogs(sorted);

        const likeMap = {};
        const commentMap = {};
        sorted.forEach(blog => {
          likeMap[blog._id] = blog.likes || 0;
          commentMap[blog._id] = blog.comments || [];
        });

        setLikes(likeMap);
        setComments(commentMap);
      })
      .catch((err) => console.error("Failed to fetch blogs:", err));
  }, []);

  // Like Handler
  const handleLike = async (id) => {
    if (!user) {
      alert("Please login to like the blog.");
      return;
    }

    try {
      const res = await API.post(`/blogs/${id}/like`, {
        userId: user.email,
      });
      setLikes((prev) => ({ ...prev, [id]: res.data.likes }));
    } catch (err) {
      alert(err.response?.data?.error || "Already liked or failed to like.");
    }
  };

  // Add Comment Handler
  const handleAddComment = async (id) => {
    if (!user) {
      alert("Please login to comment.");
      return;
    }

    const text = commentText[id]?.trim();
    if (!text) return;

    try {
      const res = await API.post(`/blogs/${id}/comment`, {
        userId: user.email,
        userName: user.name,
        text: text,
      });

      setComments(prev => ({
        ...prev,
        [id]: [...(prev[id] || []), res.data],
      }));
      setCommentText(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to add comment.");
    }
  };

  // Delete Comment Handler
  const handleDeleteComment = async (blogId, commentId) => {
    if (!user) return;

    try {
      await API.delete(
  `/blogs/${blogId}/comment/${commentId}?userId=${user.email}`
);

      setComments(prev => ({
        ...prev,
        [blogId]: prev[blogId].filter(c => c._id !== commentId),
      }));
    } catch (err) {
      alert("Failed to delete comment: " + (err.response?.data?.error || ""));
    }
  };

  // Content Renderer
  const renderContent = (content) => {
    if (!content?.root?.children) return "No content available.";
    const firstBlock = content.root.children[0];
    if (!firstBlock || !firstBlock.children) return "No content";

    return firstBlock.children.map((child) => child.text).join("").slice(0, 100) + "...";
  };

  return (
    <section className={`animate__animated animate__fadeInUp ${styles.trending}`}>
      <h2>🔥 Trending Blogs</h2>
      <div className={styles.cards}>
        {blogs.map((blog) => (
          <div key={blog._id} className={styles.card}>
            {blog.mediaUrl ? (
              blog.mediaUrl.endsWith(".mp4") || blog.mediaUrl.includes("video") ? (
                <video
                  src={blog.mediaUrl}
                  controls
                  style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
                />
              ) : (
                <img
                  src={blog.mediaUrl}
                  alt="Blog"
                  style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
                />
              )
            ) : (
              <img
                src="https://via.placeholder.com/600x400?text=No+Image"
                alt="No Media"
                style={{ width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
              />
            )}

            <h3>{blog.title}</h3>
            <p><strong>Description:</strong> {blog.description || "No description available."}</p>

            <div className={styles.buttons}>
              <button onClick={() => handleLike(blog._id)}>
                👍 Like ({likes[blog._id] || 0})
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    alert("Please login to comment.");
                    return;
                  }
                  setExpandedBlogId(blog._id);
                }}
              >
                💬 Comment
              </button>
              <button onClick={() => setActiveBlog(blog)}>👁️ View More</button>
            </div>

            {expandedBlogId === blog._id && (
              <div style={{ marginTop: "1rem" }}>
                <h4>💬 Comments</h4>
                <ul>
                  {(comments[blog._id] || []).map((c, i) => (
                    <li key={c._id || i}>
                      <strong>{c.userName || c.user}:</strong> {c.text}
                      <small style={{ color: "#999" }}>
                        {" "}({new Date(c.timestamp).toLocaleString()})
                      </small>
                      {user?.email === c.userId && (
                        <button
                          onClick={() => handleDeleteComment(blog._id, c._id)}
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
                  onChange={(e) => setCommentText(prev => ({
                    ...prev,
                    [blog._id]: e.target.value,
                  }))}
                  style={{ padding: "0.5rem", width: "70%", marginRight: "0.5rem" }}
                />
                <button onClick={() => handleAddComment(blog._id)}>Post</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Trending;
