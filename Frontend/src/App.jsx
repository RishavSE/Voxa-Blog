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

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showWriteBlog, setShowWriteBlog] = useState(false);
  const [showMyBlogs, setShowMyBlogs] = useState(false);
  const [activeBlog, setActiveBlog] = useState(null);
  const [user, setUser] = useState(null);

  // ✅ Restore user from localStorage if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    const role = localStorage.getItem("userRole");

    if (token && email && role) {
      const name = email.split("@")[0];
      setUser({ name, email, role });
    }
  }, []);

  // ✅ On successful login
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

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowWriteBlog(false);
    setShowMyBlogs(false);
    setShowLogin(false);
    setShowSignup(false);
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

      {/* ✅ Auth Screens */}
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
     {showSignup && <SignupPage onBackToLogin={() => {
  setShowLogin(true);
  setShowSignup(false);  // 👈 THIS is important
}} />}


      {/* ✅ Dashboard Screens */}
      {showWriteBlog && user && <MyBlogs user={user} />}
      {showMyBlogs && user && <MyBlogs1 user={user} />}

      {/* ✅ Homepage */}
      {!showLogin && !showSignup && !showMyBlogs && !showWriteBlog && (
        <>
          <Trending setActiveBlog={setActiveBlog} user={user} />
          <LatestBlogs setActiveBlog={setActiveBlog} user={user} />
        </>
      )}

      {/* ✅ Modal for View More */}
      {activeBlog && (
        <BlogModal blog={activeBlog} onClose={() => setActiveBlog(null)} user={user} />
      )}

      {/* ✅ Hide footer when modal is active */}
      {!activeBlog && <Footer />}
    </div>
  );
}

export default App;
