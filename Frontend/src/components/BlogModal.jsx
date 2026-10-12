import React, { useState } from "react";
import "./BlogModal1.css";
import BlogContent from "./BlogContent";

const BlogModal = ({
  blog,
  theme,
  onClose,
  user,
  handleLike,
  handleAddComment,
  handleDeleteComment,
}) => {
  const [commentText, setCommentText] = useState("");

  const liked = user && blog.likedUsers?.includes(user.email);
  const likes = blog.likes || 0;

  const handleCommentClick = () => {
    const text = commentText.trim();
    if (!text) return;
    handleAddComment(blog._id, text);
    setCommentText("");
  };

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <button
          type="button"
          className="topCloseBtn"
          onClick={onClose}
          aria-label="Close blog"
        >
          ×
        </button>

        <h2 className="title">{blog.title}</h2>

        {blog.mediaUrl && (
          <>
            {blog.mediaUrl.endsWith(".mp4") ||
            blog.mediaUrl.includes("video") ? (
              <video src={blog.mediaUrl} controls className="media" />
            ) : (
              <img src={blog.mediaUrl} alt="Blog" className="media" />
            )}
          </>
        )}

        <BlogContent
          content={blog.content}
          className="content blog-rich-content"
          theme={theme}
        />

        {user ? (
          <>
            <div className="actions">
              <button
                onClick={() => handleLike(blog._id)}
                className={`likeBtn ${liked ? "liked" : ""}`}
              >
                <span className={`heart ${liked ? "pop" : ""}`}>
                  {liked ? "❤️" : "🤍"}
                </span>{" "}
                {likes}
              </button>

              <div className="commentSection">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="commentInput"
                />
                <button className="commentBtn" onClick={handleCommentClick}>
                  💬 Comment
                </button>
              </div>
            </div>

            <div className="commentList">
              <h3>💬 Comments</h3>

              {blog.comments?.length === 0 && <p>No comments yet</p>}

              {blog.comments?.map((c) => {
                const commentUserId = c.userId || c.user || "";
                const isOwnComment = user && user.email === commentUserId;

                return (
                  <div key={c._id} className="commentItem">
                    <div className="commentText">
                      <strong>{c.userName || c.user || "User"}:</strong>{" "}
                      {c.text}
                    </div>

                    <div className="commentActions">
                      <small>{new Date(c.timestamp).toLocaleString()}</small>

                      {isOwnComment && handleDeleteComment && (
                        <button
                          onClick={() => handleDeleteComment(blog._id, c._id)}
                          className="deleteBtn"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="loginPrompt">🔒 Please login to like or comment</p>
        )}

        <button className="cancelBottomBtn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BlogModal;
