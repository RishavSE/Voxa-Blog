import React, { useState, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import ToolbarPlugin from "./ToolbarPlugin";
import "./createblog.css";
import API from "../api";

const editorConfig = {
  namespace: "VoxaBlogEditor",
  theme: {
    paragraph: "editor-paragraph",
  },
  onError: (error) => console.error("Lexical error:", error),
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode],
};

const MyBlogs = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editorContent, setEditorContent] = useState(null);
  const [editorKey, setEditorKey] = useState(Date.now());

  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(null);

  const [saved, setSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const fileInputRef = useRef(null);

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

  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      setEditorContent(editorState.toJSON());
      setSaved(false);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
    setSaved(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      showToast("Please upload an image or video file.", "error");
      return;
    }

    setMediaFile(file);
    setMediaPreviewUrl(URL.createObjectURL(file));
    setSaved(false);
  };

  const handleRemoveMedia = () => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    setMediaFile(null);
    setMediaPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setSaved(false);
  };

  const handlePost = async () => {
    if (!title.trim()) {
      showToast("Please enter a title.", "error");
      return;
    }

    if (!editorContent) {
      showToast("Please write your blog content.", "error");
      return;
    }

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      showToast("Please login to post a blog.", "error");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("email", userEmail);
      formData.append("content", JSON.stringify(editorContent));

      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      await API.post("/blogs", formData);

      setTitle("");
      setDescription("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
      setEditorContent(null);
      setEditorKey(Date.now());

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSaved(true);

      showToast("Blog posted successfully!", "success");
    } catch (error) {
      console.error("Post error:", error);

      showToast("Failed to post blog. Please try again.", "error");
    }
  };

  return (
    <section
      style={{
        padding: "2rem",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      {toast.show && (
        <div className="blog-toast-container">
          <div
            className={`blog-toast ${
              toast.type === "error" ? "blog-toast-error" : "blog-toast-success"
            }`}
          >
            <span className="blog-toast-icon">
              {toast.type === "error" ? "✕" : "✓"}
            </span>

            <span className="blog-toast-message">{toast.message}</span>

            <button
              type="button"
              className="blog-toast-close"
              onClick={() =>
                setToast({
                  show: false,
                  type: "",
                  message: "",
                })
              }
            >
              ×
            </button>
          </div>
        </div>
      )}

      <h2 style={{ marginBottom: "1.5rem" }}>Write and Upload Your Blog</h2>

      <label>
        Blog Title <span style={{ color: "red" }}>*</span>
      </label>

      <input
        type="text"
        placeholder="Enter blog title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          fontSize: "1.1rem",
          borderRadius: 4,
          border: "1px solid #ccc",
          marginBottom: "1rem",
          boxSizing: "border-box",
        }}
      />

      <label className="media-upload-label">Upload Image or Video</label>

      <div
        className={`media-upload-container ${
          isDragging ? "media-upload-dragging" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="media-upload-input"
        />

        <div className="media-upload-icon">
          <i className="pi pi-cloud-upload"></i>
        </div>

        <h3>Upload your media</h3>

        <p>Drag & drop your image or video here</p>

        <span>or</span>

        <button
          type="button"
          className="media-select-button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <i className="pi pi-folder-open"></i>
          Select File
        </button>

        <small>
          Supports JPG, PNG, GIF, MP4, WebM and other common formats
        </small>
      </div>

      {mediaPreviewUrl && mediaFile && (
        <div
          style={{
            position: "relative",
            marginBottom: "1rem",
          }}
        >
          {mediaFile.type.startsWith("image/") ? (
            <img
              src={mediaPreviewUrl}
              alt="Preview"
              style={{
                maxWidth: "100%",
                display: "block",
              }}
            />
          ) : (
            <video
              controls
              src={mediaPreviewUrl}
              style={{
                maxWidth: "100%",
                display: "block",
              }}
            />
          )}

          <button
            type="button"
            onClick={handleRemoveMedia}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "#ff4444",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      <label>Description (optional)</label>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        style={{
          width: "100%",
          padding: "0.5rem",
          borderRadius: 4,
          border: "1px solid #ccc",
          marginBottom: "1rem",
          boxSizing: "border-box",
          resize: "vertical",
        }}
      />

      <label>
        Blog Content <span style={{ color: "red" }}>*</span>
      </label>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <LexicalComposer key={editorKey} initialConfig={editorConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                style={{
                  minHeight: 150,
                  outline: "none",
                }}
              />
            }
            placeholder={
              <div className="editor-placeholder">
                Start writing your blog here...
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />

          <ListPlugin />

          <OnChangePlugin onChange={handleEditorChange} />

          <ToolbarPlugin />
        </LexicalComposer>
      </div>

      <button
        type="button"
        onClick={handlePost}
        style={{
          padding: "0.75rem 2rem",
          background: "linear-gradient(45deg, #ff4d6d, #ff9a9e)",
          border: "none",
          borderRadius: 4,
          color: "#fff",
          cursor: "pointer",
          fontSize: "1.1rem",
          marginTop: "1.2rem",
        }}
      >
        Post Blog
      </button>

      {saved && (
        <p
          style={{
            color: "green",
            fontWeight: "bold",
          }}
        >
          Your blog was posted successfully!
        </p>
      )}
    </section>
  );
};

export default MyBlogs;
