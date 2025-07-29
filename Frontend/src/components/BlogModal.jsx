import React, { useState } from "react";
import "./BlogModal1.css";

const BlogModal = ({ blog, onClose, user }) => {
  const [likes, setLikes] = useState(blog.likes || 0);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(blog.comments || []);

  // ✅ Render Lexical JSON content
  const renderContent = (content) => {
    if (!content?.root?.children) return null;

    return content.root.children.map((block, idx) => {
      if (block.type === "list") {
        return (
          <ul key={idx} className="list">
            {block.children.map((item, i) => (
              <li key={i}>{item.children?.map((c) => c.text).join("")}</li>
            ))}
          </ul>
        );
      }

      const text = block.children?.map((child) => child.text).join("") || "";
      return <p key={idx} className="paragraph">{text}</p>;
    });
  };

  const handleLike = () => {
    if (!liked) {
      setLikes((prev) => prev + 1);
      setLiked(true);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim() !== "") {
      setComments((prev) => [
        ...prev,
        {
          text: commentText,
          user: user?.email?.split("@")[0] || "Guest",
          timestamp: new Date().toISOString(),
        },
      ]);
      setCommentText("");
    }
  };

  return (
    <div className="modalOverlay">
      <div className="modalContainer">
        <button className="topCloseBtn" onClick={onClose}>✖</button>

        <h2 className="title">{blog.title}</h2>

        {/* ✅ Handle both video and image */}
        {blog.mediaUrl && (
          blog.mediaUrl.endsWith(".mp4") || blog.mediaUrl.includes("video") ? (
            <video
              src={blog.mediaUrl}
              controls
              className="media"
              style={{ width: "100%", borderRadius: "8px", margin: "1rem 0" }}
            />
          ) : (
            <img
              src={blog.mediaUrl}
              alt="Blog"
              className="image"
              style={{ width: "100%", borderRadius: "8px", margin: "1rem 0" }}
            />
          )
        )}

        <div className="content">{renderContent(blog.content)}</div>

        {user ? (
          <div className="actions">
            <button className="likeBtn" onClick={handleLike}>
              ❤️ Like {likes > 0 && `(${likes})`}
            </button>

            <div className="commentSection">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="commentInput"
              />
              <button className="commentBtn" onClick={handleAddComment}>💬 Comment</button>
            </div>

            <div className="commentList">
              {comments.map((c, index) => (
                <p key={index} className="commentItem">
                  <strong>{c.user}:</strong> {c.text}{" "}
                  <small style={{ color: "#888", fontSize: "0.8rem" }}>
                    ({new Date(c.timestamp).toLocaleString()})
                  </small>
                </p>
              ))}
            </div>
          </div>
        ) : (
          <p className="loginPrompt">🔒 Please login to like or comment</p>
        )}

        <button className="cancelBottomBtn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default BlogModal;
