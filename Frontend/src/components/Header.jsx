import React from "react";
import styles from "./Header.module.css";

function Header({ user, onLoginClick, onMyBlogsClick, onLogout, onHomeClick, onWriteBlogClick }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>VoxaBlog</div>

      <nav className={styles.nav}>
        <span className={styles.navLink} onClick={onHomeClick}>
          Home
        </span>
        <span className={styles.navLink} onClick={onWriteBlogClick}>
          Create Blogs
        </span>
        <span className={styles.navLink} onClick={onMyBlogsClick}>
          My Blogs
        </span>
      </nav>

      <div className={styles.userSection}>
        {user ? (
          <>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.name}</span>{" "}
              <span className={styles.userRole}>(Role: {user.role})</span>
            </div>
            <button onClick={onLogout} className={styles.loginBtn}>
              Logout
            </button>
          </>
        ) : (
          <button onClick={onLoginClick} className={styles.loginBtn}>
            Log in / Sign up
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
