import React, { useState, useEffect } from "react";

import Header from "./components/Header";
import Trending from "./components/Trending";
import LatestBlogs from "./components/LatestBlogs";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/Signup";
import MyBlogs from "./components/createblog";
import MyBlogs1 from "./components/Myblogs1";
import BlogModal from "./components/BlogModal";
import API from "./api";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showWriteBlog, setShowWriteBlog] = useState(false);
  const [showMyBlogs, setShowMyBlogs] = useState(false);
  const [activeBlog, setActiveBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);

  const [toast, setToast] = useState({
    show: false,
    type: "",
    message: "",
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  useEffect(() => {
    scrollToTop();
  }, [showLogin, showSignup, showWriteBlog, showMyBlogs, activeBlog]);

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

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get("/blogs");
        setBlogs(res.data);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        showToast("Failed to load blogs. Please try again.", "error");
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    if (token && email && role) {
      const name = email.split("@")[0];

      setUser({
        name,
        email,
        role,
      });
    }
  }, []);

  const handleLoginSuccess = (email, role, token) => {
    const name = email.split("@")[0];

    setUser({
      name,
      email,
      role,
    });

    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);

    setShowLogin(false);
    setShowSignup(false);
    setShowWriteBlog(false);
    setShowMyBlogs(true);

    scrollToTop();

    showToast("Login successful!", "success");
  };

  const handleLogout = () => {
    localStorage.clear();

    setUser(null);

    setShowWriteBlog(false);
    setShowMyBlogs(false);
    setShowLogin(false);
    setShowSignup(false);
    setActiveBlog(null);

    scrollToTop();

    showToast("Logged out successfully.", "success");
  };

  const handleLike = async (blogId) => {
    if (!user) {
      showToast("Please login to like this blog.", "error");

      setShowLogin(true);
      setShowSignup(false);

      scrollToTop();

      return;
    }

    setBlogs((prev) =>
      prev.map((blog) => {
        if (blog._id !== blogId) {
          return blog;
        }

        const liked = blog.likedUsers?.includes(user.email);

        const updatedLikedUsers = liked
          ? blog.likedUsers.filter((email) => email !== user.email)
          : [...(blog.likedUsers || []), user.email];

        const updatedLikes = liked
          ? Math.max((blog.likes || 0) - 1, 0)
          : (blog.likes || 0) + 1;

        return {
          ...blog,
          likedUsers: updatedLikedUsers,
          likes: updatedLikes,
        };
      }),
    );

    if (activeBlog && activeBlog._id === blogId) {
      const liked = activeBlog.likedUsers?.includes(user.email);

      const updatedLikedUsers = liked
        ? activeBlog.likedUsers.filter((email) => email !== user.email)
        : [...(activeBlog.likedUsers || []), user.email];

      const updatedLikes = liked
        ? Math.max((activeBlog.likes || 0) - 1, 0)
        : (activeBlog.likes || 0) + 1;

      setActiveBlog({
        ...activeBlog,
        likedUsers: updatedLikedUsers,
        likes: updatedLikes,
      });
    }

    try {
      await API.post(`/blogs/${blogId}/like`, {
        userId: user.email,
      });
    } catch (err) {
      console.error("Like failed:", err);

      showToast("Failed to update like. Please try again.", "error");

      try {
        const res = await API.get("/blogs");
        setBlogs(res.data);

        if (activeBlog && activeBlog._id === blogId) {
          const updatedActive = res.data.find((blog) => blog._id === blogId);

          if (updatedActive) {
            setActiveBlog(updatedActive);
          }
        }
      } catch (refreshError) {
        console.error("Failed to refresh blogs:", refreshError);
      }
    }
  };

  const handleAddComment = async (blogId, text) => {
    if (!user) {
      showToast("Please login to comment.", "error");

      setShowLogin(true);
      setShowSignup(false);

      scrollToTop();

      return;
    }

    const cleanText = text?.trim();

    if (!cleanText) {
      showToast("Please write a comment first.", "error");
      return;
    }

    try {
      const res = await API.post(`/blogs/${blogId}/comment`, {
        userId: user.email,
        userName: user.name,
        text: cleanText,
      });

      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                comments: [...(blog.comments || []), res.data],
              }
            : blog,
        ),
      );

      if (activeBlog && activeBlog._id === blogId) {
        setActiveBlog((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
        }));
      }

      showToast("Comment added successfully!", "success");
    } catch (err) {
      console.error("Comment failed:", err);

      showToast("Failed to add comment. Please try again.", "error");
    }
  };

  const handleDeleteComment = async (blogId, commentId) => {
    if (!user) {
      showToast("Please login to delete your comment.", "error");

      setShowLogin(true);
      setShowSignup(false);

      scrollToTop();

      return;
    }

    try {
      await API.delete(`/blogs/${blogId}/comment/${commentId}`, {
        params: {
          userId: user.email,
        },
      });

      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                comments: (blog.comments || []).filter(
                  (comment) => comment._id !== commentId,
                ),
              }
            : blog,
        ),
      );

      if (activeBlog && activeBlog._id === blogId) {
        setActiveBlog((prev) => ({
          ...prev,
          comments: (prev.comments || []).filter(
            (comment) => comment._id !== commentId,
          ),
        }));
      }

      showToast("Comment deleted successfully.", "success");
    } catch (err) {
      console.error("Delete comment failed:", err);

      showToast("Failed to delete comment. Please try again.", "error");
    }
  };

  const handleHomeClick = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowWriteBlog(false);
    setShowMyBlogs(false);
    setActiveBlog(null);

    scrollToTop();
  };

  const handleMyBlogsClick = () => {
    if (user && user.role === "user") {
      setShowMyBlogs(true);
      setShowWriteBlog(false);
      setShowLogin(false);
      setShowSignup(false);
      setActiveBlog(null);

      scrollToTop();

      return;
    }

    showToast("Please login first to view your blogs.", "error");

    setShowLogin(true);
    setShowSignup(false);

    scrollToTop();
  };

  const handleWriteBlogClick = () => {
    if (user && user.role === "user") {
      setShowWriteBlog(true);
      setShowMyBlogs(false);
      setShowLogin(false);
      setShowSignup(false);
      setActiveBlog(null);

      scrollToTop();

      return;
    }

    showToast("Please login first to write a blog.", "error");

    setShowLogin(true);
    setShowSignup(false);

    scrollToTop();
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    setShowSignup(false);

    scrollToTop();
  };

  const handleLoginClose = () => {
    setShowLogin(false);

    scrollToTop();
  };

  const handleSignupClick = () => {
    setShowSignup(true);
    setShowLogin(false);

    scrollToTop();
  };

  const handleCloseBlog = () => {
    setActiveBlog(null);

    scrollToTop();
  };

  return (
    <div className={`App ${activeBlog ? "blurred" : ""}`}>
      {toast.show && (
        <div
          className={`blog-toast ${
            toast.type === "error" ? "blog-toast-error" : "blog-toast-success"
          }`}
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2147483647,
            visibility: "visible",
            opacity: 1,
          }}
        >
          {toast.type === "error" ? "✕" : "✓"}

          <span className="blog-toast-message">{toast.message}</span>
        </div>
      )}

      <Header
        user={user}
        onLoginClick={handleLoginClick}
        onLogout={handleLogout}
        onMyBlogsClick={handleMyBlogsClick}
        onWriteBlogClick={handleWriteBlogClick}
        onHomeClick={handleHomeClick}
      />

      {showLogin && (
        <LoginPage
          onClose={handleLoginClose}
          onSignupClick={handleSignupClick}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showSignup && (
        <SignupPage
          onBackToLogin={() => {
            setShowLogin(true);
            setShowSignup(false);

            scrollToTop();
          }}
          onSignupSuccess={() => {
            setShowSignup(false);
            setShowLogin(true);

            scrollToTop();

            showToast("User registered successfully!", "success");
          }}
        />
      )}

      {showWriteBlog && user && <MyBlogs user={user} />}

      {showMyBlogs && user && <MyBlogs1 user={user} />}

      {!showLogin && !showSignup && !showMyBlogs && !showWriteBlog && (
        <>
          <Trending
            blogs={blogs}
            setActiveBlog={setActiveBlog}
            user={user}
            handleLike={handleLike}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
            showToast={showToast}
          />

          <LatestBlogs
            blogs={blogs}
            setActiveBlog={setActiveBlog}
            user={user}
            handleLike={handleLike}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
            showToast={showToast}
          />
        </>
      )}

      {activeBlog && (
        <BlogModal
          blog={activeBlog}
          onClose={handleCloseBlog}
          user={user}
          handleLike={handleLike}
          handleAddComment={handleAddComment}
          handleDeleteComment={handleDeleteComment}
          showToast={showToast}
        />
      )}

      {!activeBlog && <Footer />}
    </div>
  );
}

export default App;
