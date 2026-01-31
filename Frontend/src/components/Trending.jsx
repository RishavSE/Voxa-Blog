import React, { useEffect, useState } from 'react';
import styles from './Trending.module.css';
import API from '../api';

const Trending = ({ setActiveBlog, user }) => {
  const [blogs, setBlogs] = useState([]);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [commentText, setCommentText] = useState({});

  
  const truncateText = (text = "", limit = 100) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  
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
      .catch(err => console.error("Failed to fetch blogs:", err));
  }, []);

  
  const handleLike = async (id) => {
    if (!user) {
      alert("Please login to like the blog.");
      return;
    }

    try {
      const res = await API.post(`/blogs/${id}/like`, {
        userId: user.email,
      });
      setLikes(prev => ({ ...prev, [id]: res.data.likes }));
    } catch (err) {
      alert(err.response?.data?.error || "Already liked.");
    }
  };

 
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
        text,
      });

      setComments(prev => ({
        ...prev,
        [id]: [...(prev[id] || []), res.data],
      }));

      setCommentText(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert("Failed to add comment.");
    }
  };

  
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
      alert("Failed to delete comment.");
    }
  };

  return (
    <section className={`animate__animated animate__fadeInUp ${styles.trending}`}>
      <h2>🔥 Trending Blogs</h2>

      <div className={styles.cards}>
        {blogs.map(blog => (
          <div key={blog._id} className={styles.card}>
            {/* Media */}
            {blog.mediaUrl ? (
              blog.mediaUrl.endsWith(".mp4") ? (
                <video src={blog.mediaUrl} controls />
              ) : (
                <img src={blog.mediaUrl} alt="Blog" />
              )
            ) : (
              <img
                src="https://via.placeholder.com/600x400?text=No+Image"
                alt="No Media"
              />
            )}

            {/* Title */}
            <h3>
              {truncateText(blog.title, 50)}
              {blog.title.length > 50 && (
                <span
                  onClick={() => setActiveBlog(blog)}
                  className={styles.viewMore}
                >
                  {" "}View more
                </span>
              )}
            </h3>

            {/* Description */}
            <p>
              <strong>Description:</strong>{" "}
              {truncateText(
                blog.description || "No description available.",
                60
              )}
              {(blog.description?.length || 0) > 120 && (
                <span
                  onClick={() => setActiveBlog(blog)}
                  className={styles.viewMore}
                >
                  {" "}View more
                </span>
              )}
            </p>

            {/* Buttons */}
            <div className={styles.buttons}>
              <button onClick={() => handleLike(blog._id)}>
                👍 Like ({likes[blog._id] || 0})
              </button>

              <button
                onClick={() => {
                  if (!user) return alert("Please login to comment.");
                  setExpandedBlogId(blog._id);
                }}
              >
                💬 Comment
              </button>

              <button onClick={() => setActiveBlog(blog)}>
                👁️ View More
              </button>
            </div>

            {/* Comments */}
            {expandedBlogId === blog._id && (
              <div className={styles.commentBox}>
                <h4>💬 Comments</h4>

                <ul>
                  {(comments[blog._id] || []).map(c => (
                    <li key={c._id}>
                      <strong>{c.userName || c.user}:</strong> {c.text}
                      <small>
                        {" "}({new Date(c.timestamp).toLocaleString()})
                      </small>

                      {user?.email === c.userId && (
                        <button
                          onClick={() =>
                            handleDeleteComment(blog._id, c._id)
                          }
                          className={styles.deleteBtn}
                        >
                          🗑️
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
                    setCommentText(prev => ({
                      ...prev,
                      [blog._id]: e.target.value,
                    }))
                  }
                />
                <button onClick={() => handleAddComment(blog._id)}>
                  Post
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Trending;
