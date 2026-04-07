import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Trending from "./components/Trending";
import LatestBlogs from "./components/LatestBlogs";
import Footer from "./components/Footer";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/Signup";
import MyBlogs from "./components/Myblogs";
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

  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await API.get("/blogs");
        setBlogs(res.data);
      } catch (err) {
        console.log("Failed to fetch blogs", err);
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
      setUser({ name, email, role });
    }
  }, []);

  const handleLoginSuccess = (email, role, token) => {
    const name = email.split("@")[0];
    setUser({ name, email, role });
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userRole", role);
    setShowLogin(false);
    setShowSignup(false);
    setShowWriteBlog(false);
    setShowMyBlogs(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowWriteBlog(false);
    setShowMyBlogs(false);
    setShowLogin(false);
    setShowSignup(false);
  };


  const handleLike = async (blogId) => {
    if (!user) return alert("Please login to like");

    setBlogs((prev) =>
      prev.map((b) => {
        if (b._id === blogId) {
          const liked = b.likedUsers?.includes(user.email);
          const updatedLikedUsers = liked
            ? b.likedUsers.filter((u) => u !== user.email)
            : [...(b.likedUsers || []), user.email];
          const updatedLikes = liked ? b.likes - 1 : (b.likes || 0) + 1;
          return { ...b, likedUsers: updatedLikedUsers, likes: updatedLikes };
        }
        return b;
      })
    );

    if (activeBlog && activeBlog._id === blogId) {
      const liked = activeBlog.likedUsers?.includes(user.email);
      const updatedLikedUsers = liked
        ? activeBlog.likedUsers.filter((u) => u !== user.email)
        : [...(activeBlog.likedUsers || []), user.email];
      const updatedLikes = liked ? activeBlog.likes - 1 : (activeBlog.likes || 0) + 1;
      setActiveBlog({ ...activeBlog, likedUsers: updatedLikedUsers, likes: updatedLikes });
    }

    try {
      await API.post(`/blogs/${blogId}/like`, { userId: user.email });
    } catch (err) {
      alert("Failed to update like on server");
    }
  };

 
  const handleAddComment = async (blogId, text) => {
    if (!user) return alert("Please login to comment");
    try {
      const res = await API.post(`/blogs/${blogId}/comment`, {
        userId: user.email,
        userName: user.name,
        text,
      });

      setBlogs((prev) =>
        prev.map((b) =>
          b._id === blogId ? { ...b, comments: [...b.comments, res.data] } : b
        )
      );

      if (activeBlog && activeBlog._id === blogId) {
        setActiveBlog((prev) => ({ ...prev, comments: [...prev.comments, res.data] }));
      }
    } catch (err) {
      alert("Failed to add comment");
    }
  };

 
  const handleDeleteComment = async (blogId, commentId) => {
    if (!user) return alert("Please login to delete comment");
    try {
      await API.delete(`/blogs/${blogId}/comment/${commentId}`, {
        params: { userId: user.email },
      });

      setBlogs((prev) =>
        prev.map((b) =>
          b._id === blogId
            ? { ...b, comments: b.comments.filter((c) => c._id !== commentId) }
            : b
        )
      );

      if (activeBlog && activeBlog._id === blogId) {
        setActiveBlog((prev) => ({
          ...prev,
          comments: prev.comments.filter((c) => c._id !== commentId),
        }));
      }
    } catch (err) {
      alert("Failed to delete comment");
    }
  };

  return (
    <div className={`App ${activeBlog ? "blurred" : ""}`}>
      <Header
        user={user}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
        onMyBlogsClick={() => {
          if (user && user.role === "user") {
            setShowMyBlogs(true);
            setShowWriteBlog(false);
            setShowLogin(false);
            setShowSignup(false);
          } else {
            alert("Login first to view your blogs");
            setShowLogin(true);
          }
        }}
        onWriteBlogClick={() => {
          if (user && user.role === "user") {
            setShowWriteBlog(true);
            setShowMyBlogs(false);
            setShowLogin(false);
            setShowSignup(false);
          } else {
            alert("Login first to write");
            setShowLogin(true);
          }
        }}
        onHomeClick={() => {
          setShowLogin(false);
          setShowSignup(false);
          setShowWriteBlog(false);
          setShowMyBlogs(false);
        }}
      />

      {showLogin && (
        <LoginPage
          onClose={() => setShowLogin(false)}
          onSignupClick={() => {
            setShowSignup(true);
            setShowLogin(false);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {showSignup && (
        <SignupPage
          onBackToLogin={() => {
            setShowLogin(true);
            setShowSignup(false);
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
          />
          <LatestBlogs
            blogs={blogs}
            setActiveBlog={setActiveBlog}
            user={user}
            handleLike={handleLike}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
          />
        </>
      )}

      {activeBlog && (
        <BlogModal
          blog={activeBlog}
          onClose={() => setActiveBlog(null)}
          user={user}
          handleLike={handleLike}
          handleAddComment={handleAddComment}
          handleDeleteComment={handleDeleteComment}
        />
      )}

      {!activeBlog && <Footer />}
    </div>
  );
}

export default App;
