import React, { useState } from "react";
import styles from "./LatestBlogs.module.css";

const TrendingBlogs = ({
  blogs,
  setActiveBlog,
  user,
  handleLike,
  handleAddComment,
  handleDeleteComment,
}) => {
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [commentText, setCommentText] = useState({});

  const truncateText = (text = "", limit = 100) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  const renderMedia = (mediaUrl = "") => {
    if (!mediaUrl) return null;
    const isVideo = mediaUrl.endsWith(".mp4") || mediaUrl.includes("video");
    return isVideo ? (
      <video
        src={mediaUrl}
        controls
        className={styles.media}
        style={{ borderRadius: "8px", margin: "1rem 0", width: "100%" }}
      />
    ) : (
      <img
        src={mediaUrl}
        alt="Blog"
        className={styles.media}
        style={{ borderRadius: "8px", margin: "1rem 0", width: "100%" }}
      />
    );
  };

  const latestBlogs = [...blogs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  return (
    <div className={styles.latest}>
      <h2>🔥 Trending Blogs</h2>

      <div className={styles.cards}>
        {latestBlogs.map((blog) => {
          const liked = user && blog.likedUsers?.includes(user.email);
          const likes = blog.likes || 0;

          return (
            <div key={blog._id} className={styles.cardWrapper}>
              <div className={styles.card}>
                {renderMedia(blog.mediaUrl)}

                <h3>
                  {truncateText(blog.title, 50)}
                  {blog.title.length > 50 && (
                    <span
                      onClick={() => setActiveBlog(blog)}
                      className={styles.viewMore}
                    >
                      View more
                    </span>
                  )}
                </h3>

                <p>
                  <strong>Description:</strong>{" "}
                  {truncateText(blog.description || "No description", 60)}
                </p>

                <div className={styles.buttons}>
                  <button
                    onClick={() => handleLike(blog._id)}
                    className={`${styles.likeBtn} ${liked ? styles.liked : ""}`}
                  >
                    <span
                      className={`${styles.heart} ${liked ? styles.pop : ""}`}
                    >
                      {liked ? "❤️" : "🤍"}
                    </span>{" "}
                    {likes}
                  </button>

                  <button
                    onClick={() => {
                      if (!user) return alert("Login to comment");
                      setExpandedBlogId(
                        expandedBlogId === blog._id ? null : blog._id,
                      );
                    }}
                  >
                    💬 Comment
                  </button>

                  <button onClick={() => setActiveBlog(blog)}>👁️ View</button>
                </div>

                {expandedBlogId === blog._id && (
                  <div className={styles.commentBox}>
                    <h4>💬 Comments</h4>

                    <ul>
                      {(blog.comments || []).map((c) => (
                        <li key={c._id} className={styles.commentItem}>
                          <strong>{c.userName || c.user}:</strong> {c.text}
                          {user?.email === c.userId && handleDeleteComment && (
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

                    <div className={styles.commentInputWrapper}>
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
                        className={styles.commentInput}
                      />
                      <button
                        onClick={() => {
                          const text = (commentText[blog._id] || "").trim();
                          if (!text) return;
                          handleAddComment(blog._id, text);
                          setCommentText((prev) => ({
                            ...prev,
                            [blog._id]: "",
                          }));
                        }}
                        className={styles.commentBtn}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingBlogs;
