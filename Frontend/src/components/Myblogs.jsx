//****************************create blogs code ********************************************************************************************/
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
import API from "../api";

const editorConfig = {
  namespace: "VoxaBlogEditor",
  theme: { paragraph: "editor-paragraph" },
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
  const fileInputRef = useRef(null);

  const handleEditorChange = (editorState) => {
    editorState.read(() => {
      setEditorContent(editorState.toJSON());
      setSaved(false);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreviewUrl(URL.createObjectURL(file));
      setSaved(false);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    setSaved(false);
  };

  const handlePost = async () => {
    if (!title.trim()) return alert("Please enter a title.");
    if (!editorContent) return alert("Please write your blog content.");

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      alert("Please login to post a blog.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("email", userEmail);
      formData.append("content", JSON.stringify(editorContent));
      if (mediaFile) formData.append("media", mediaFile);

      await API.post("/blogs", formData);

      //  Reset states
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setMediaPreviewUrl(null);
      setEditorContent(null);
      setEditorKey(Date.now()); //  Reset Lexical Editor
      if (fileInputRef.current) fileInputRef.current.value = null;

      setSaved(true);
      alert(" Blog posted successfully!");
    } catch (error) {
      console.error("Post error:", error);
      alert("❌ Failed to post blog. Check console.");
    }
  };

  return (
    <section style={{ padding: "2rem", maxWidth: 700, margin: "0 auto" }}>
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
        }}
      />

      <label>Upload Image or Video (optional)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        style={{ marginBottom: "1rem" }}
      />

      {mediaPreviewUrl && (
        <div style={{ position: "relative", marginBottom: "1rem" }}>
          {mediaFile.type.startsWith("image") ? (
            <img src={mediaPreviewUrl} alt="Preview" style={{ maxWidth: "100%" }} />
          ) : (
            <video controls src={mediaPreviewUrl} style={{ maxWidth: "100%" }} />
          )}
          <button
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
        }}
      />

      <label>
        Blog Content <span style={{ color: "red" }}>*</span>
      </label>
      <div style={{ border: "1px solid #ccc", borderRadius: 6, padding: "1rem" }}>
        <LexicalComposer key={editorKey} initialConfig={editorConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                style={{ minHeight: 150, outline: "none" }}
              />
            }
            placeholder={<div style={{ color: "#999" }}>Start writing your blog here...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <OnChangePlugin onChange={handleEditorChange} />
          <ToolbarPlugin />
        </LexicalComposer>
      </div>

      <button
        onClick={handlePost}
        style={{
          padding: "0.75rem 2rem",
          background: "#007bff",
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
        <p style={{ color: "green", fontWeight: "bold" }}>
          Your blog was posted successfully!
        </p>
      )}
    </section>
  );
};

export default MyBlogs;
