import React, { useState } from "react";
import styles from "./Header.module.css";
import { FaBars } from "react-icons/fa";

function Header({
  user,
  onLoginClick,
  onMyBlogsClick,
  onLogout,
  onHomeClick,
  onWriteBlogClick,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>VoxaBlog</div>

      {/* Hamburger */}
      <div
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FaBars />
      </div>

      {/* Nav */}
      <nav
        className={`${styles.nav} ${menuOpen ? styles.menuOpen : ""}`}
      >
        <span
          className={styles.navLink}
          onClick={() => {
            onHomeClick();
            setMenuOpen(false);
          }}
        >
          Home
        </span>

        <span
          className={styles.navLink}
          onClick={() => {
            onWriteBlogClick();
            setMenuOpen(false);
          }}
        >
          Create Blogs
        </span>

        <span
          className={styles.navLink}
          onClick={() => {
            onMyBlogsClick();
            setMenuOpen(false);
          }}
        >
          My Blogs
        </span>
      </nav>

      {/* User Section */}
      <div
        className={`${styles.userSection} ${
          menuOpen ? styles.menuOpen : ""
        }`}
      >
        {user ? (
          <>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>
                (Role: {user.role})
              </span>
            </div>
            <button
              onClick={() => {
                onLogout();
                setMenuOpen(false);
              }}
              className={styles.loginBtn}
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              onLoginClick();
              setMenuOpen(false);
            }}
            className={styles.loginBtn}
          >
            Log in / Sign up
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
