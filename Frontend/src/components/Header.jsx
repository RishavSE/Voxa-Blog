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

     
      <div
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FaBars />
      </div>

    
      <nav className={styles.desktopNav}>
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

      
    <div className={styles.desktopUser}>
  {user ? (
    <>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{user.name}</span>
        <span className={styles.userRole}>
          (Role: {user.role})
        </span>
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


      
      <div
        className={`${styles.mobileMenu} ${
          menuOpen ? styles.menuOpen : ""
        }`}
      >
        <span onClick={() => { onHomeClick(); setMenuOpen(false); }}>
          Home
        </span>
        <span onClick={() => { onWriteBlogClick(); setMenuOpen(false); }}>
          Create Blogs
        </span>
        <span onClick={() => { onMyBlogsClick(); setMenuOpen(false); }}>
          My Blogs
        </span>

        <hr className={styles.divider} />

        {user ? (
          <>
            <div className={styles.userInfo}>
              {user.name} <span>(Role: {user.role})</span>
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
