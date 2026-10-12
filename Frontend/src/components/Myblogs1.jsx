import React, { useEffect, useState } from "react";
import API from "../api";
import BlogContent from "./BlogContent";

const MyBlogs1 = ({ theme }) => {
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

  const [deleteBlog, setDeleteBlog] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const userEmail = localStorage.getItem("userEmail");

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setToast({
        show: false,
        type: "",
        message: "",
      });
    }, 3000);
  };

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
        likedMap[blog._id] = blog.likedUsers?.includes(userEmail) || false;
      });

      setLikes(likeMap);
      setComments(commentMap);
      setLikedBlogs(likedMap);
    } catch (err) {
      console.error("Fetch error:", err);
      showToast("Failed to load your blogs.", "error");
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
      showToast("Unable to like this blog.", "error");
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

      showToast("Comment added successfully.", "success");
    } catch (err) {
      console.error("Comment failed:", err);
      showToast("Failed to add comment.", "error");
    }
  };

  const handleDelete = async () => {
    if (!deleteBlog) return;

    try {
      await API.delete(`/blogs/${deleteBlog._id}`);

      setBlogs((prev) => prev.filter((blog) => blog._id !== deleteBlog._id));

      setDeleteBlog(null);

      showToast("Blog deleted successfully.", "success");
    } catch (err) {
      console.error("Delete failed:", err);

      setDeleteBlog(null);

      showToast("Failed to delete blog. Please try again.", "error");
    }
  };

  return (
    <div
      className="my-blogs-page"
      style={{
        padding: "2rem",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      {toast.show && (
        <div
          className={`blog-toast ${
            toast.type === "error" ? "blog-toast-error" : "blog-toast-success"
          }`}
        >
          <span className="blog-toast-icon">
            {toast.type === "error" ? "✕" : "✓"}
          </span>

          <span>{toast.message}</span>
        </div>
      )}

      <h2 className="my-blogs-heading">
        <img src="/my-blogs-icon.png" alt="" aria-hidden="true" />
        My Blogs
      </h2>

      {blogs.length === 0 ? (
        <p>No blogs found</p>
      ) : (
        blogs.map((blog) => {
          const liked = likedBlogs[blog._id];

          return (
            <div
              key={blog._id}
              className="my-blog-card"
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
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                    }}
                  />
                ) : (
                  <img
                    src={blog.mediaUrl}
                    alt=""
                    style={{
                      width: "100%",
                      borderRadius: "12px",
                    }}
                  />
                ))}

              {blog.description && <p>{blog.description}</p>}

              <BlogContent
                content={blog.content}
                className="blog-rich-content"
                theme={theme}
              />

              <div
                className="my-blog-actions"
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "10px",
                  flexWrap: "wrap",
                }}
              >
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
                          node.children?.map((c) => c.text || "").join(""),
                        )
                        .join("\n") || "";

                    setEditForm({
                      title: blog.title || "",
                      description: blog.description || "",
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
                  onClick={() => setDeleteBlog(blog)}
                  style={{
                    borderRadius: "25px",
                    padding: "6px 14px",
                    border: "none",
                    background: "#fdecea",
                    color: "#dc2626",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              {showComments[blog._id] && (
                <div
                  className="my-blog-comment-list"
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
                      className="my-blog-comment"
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
                        {c.timestamp
                          ? new Date(c.timestamp).toLocaleString()
                          : ""}
                      </small>
                    </div>
                  ))}

                  <div
                    className="my-blog-comment-form"
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
                        cursor: "pointer",
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
          className="edit-blog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="edit-blog-modal"
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Edit Blog</h3>

            <input
              value={editForm.title}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  title: e.target.value,
                })
              }
              style={{
                width: "100%",
                marginBottom: "1rem",
                borderRadius: "10px",
                padding: "8px",
                boxSizing: "border-box",
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
                boxSizing: "border-box",
              }}
            />

            <textarea
              value={editForm.content}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  content: e.target.value,
                })
              }
              rows={6}
              style={{
                width: "100%",
                marginBottom: "1rem",
                borderRadius: "10px",
                padding: "8px",
                boxSizing: "border-box",
              }}
            />

            <button
              onClick={() => setEditingBlog(null)}
              className="edit-blog-cancel"
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                try {
                  await API.put(`/blogs/${editingBlog._id}`, {
                    title: editForm.title,
                    description: editForm.description,
                    content: JSON.stringify({
                      root: {
                        children: [
                          {
                            type: "paragraph",
                            children: [
                              {
                                text: editForm.content,
                              },
                            ],
                          },
                        ],
                      },
                    }),
                  });

                  await fetchBlogs();

                  setEditingBlog(null);

                  showToast("Blog updated successfully.", "success");
                } catch (error) {
                  console.error("Update failed:", error);

                  showToast("Failed to update blog.", "error");
                }
              }}
              className="edit-blog-save"
              style={{
                marginLeft: "10px",
                borderRadius: "10px",
                padding: "8px 16px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {deleteBlog && (
        <div
          className="delete-blog-overlay"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setDeleteBlog(null)}
        >
          <div
            className="delete-blog-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 18px",
                borderRadius: "50%",
                background: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🗑️
            </div>

            <h3
              style={{
                margin: "0 0 10px",
                fontSize: "22px",
                color: "#111827",
              }}
            >
              Delete this blog?
            </h3>

            <p
              style={{
                margin: "0 0 24px",
                color: "#6b7280",
                lineHeight: "1.5",
                fontSize: "14px",
              }}
            >
              Are you sure you want to delete{" "}
              <strong>"{deleteBlog.title}"</strong>? This action cannot be
              undone.
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setDeleteBlog(null)}
                className="delete-blog-cancel"
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  color: "#374151",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  borderRadius: "10px",
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Delete Blog
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          .blog-toast {
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            min-width: 280px;
            max-width: calc(100vw - 32px);
            padding: 14px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 10px 35px rgba(0,0,0,0.15);
            animation: blogToastIn 0.3s ease;
          }

          .blog-toast-success {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
          }

          .blog-toast-error {
            background: #fef2f2;
            color: #b91c1c;
            border: 1px solid #fecaca;
          }

          .blog-toast-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            flex-shrink: 0;
          }

          .blog-toast-success .blog-toast-icon {
            background: #10b981;
            color: white;
          }

          .blog-toast-error .blog-toast-icon {
            background: #ef4444;
            color: white;
          }

          @keyframes blogToastIn {
            from {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }

          @media (max-width: 500px) {
            .blog-toast {
              top: 14px;
              min-width: 0;
              width: calc(100vw - 28px);
              box-sizing: border-box;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MyBlogs1;
