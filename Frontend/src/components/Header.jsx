import React, { useState } from "react";
import styles from "./Header.module.css";
import { FaBars, FaMoon, FaSun } from "react-icons/fa";

function Header({
  user,
  onLoginClick,
  onMyBlogsClick,
  onLogout,
  onHomeClick,
  onWriteBlogClick,
  theme,
  onToggleTheme,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setMenuOpen(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={onHomeClick}>
          VoxaBlog
        </div>

        <button
          type="button"
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          <FaBars />
        </button>

        <nav className={styles.desktopNav}>
          <span
            className={styles.navLink}
            onClick={onHomeClick}
          >
            Home
          </span>

          <span
            className={styles.navLink}
            onClick={onWriteBlogClick}
          >
            Create Blogs
          </span>

          <span
            className={styles.navLink}
            onClick={onMyBlogsClick}
          >
            My Blogs
          </span>
        </nav>

        <div className={styles.headerActions}>
          <div className={styles.desktopUser}>
            {user ? (
              <>
                <div className={styles.userInfo}>
                  {user.name}
                  <span>(Role: {user.role})</span>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className={styles.loginBtn}
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className={styles.loginBtn}
              >
                Log in / Sign up
              </button>
            )}
          </div>

          <button
            type="button"
            className={styles.themeToggle}
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <FaMoon aria-hidden="true" />
            ) : (
              <FaSun aria-hidden="true" />
            )}
          </button>
        </div>

        <div
          className={`${styles.mobileMenu} ${
            menuOpen ? styles.menuOpen : ""
          }`}
        >
          <span
            onClick={() => {
              onHomeClick();
              setMenuOpen(false);
            }}
          >
            Home
          </span>

          <span
            onClick={() => {
              onWriteBlogClick();
              setMenuOpen(false);
            }}
          >
            Create Blogs
          </span>

          <span
            onClick={() => {
              onMyBlogsClick();
              setMenuOpen(false);
            }}
          >
            My Blogs
          </span>

          <hr className={styles.divider} />

          {user ? (
            <>
              <div className={styles.userInfo}>
                {user.name}
                <span>(Role: {user.role})</span>
              </div>

              <button
                onClick={handleLogoutClick}
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

      {showLogoutModal && (
        <div
          className={styles.logoutOverlay}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className={styles.logoutModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.logoutIcon}>
              ↪
            </div>

            <h3>Logout from VoxaBlog?</h3>

            <p>
              Are you sure you want to logout from your
              account?
            </p>

            <div className={styles.logoutActions}>
              <button
                type="button"
                className={styles.cancelLogout}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={styles.confirmLogout}
                onClick={handleConfirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;