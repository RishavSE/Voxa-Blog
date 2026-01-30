import React, { useState } from "react";
import "./LoginPage.css";
import API from "../api";

const LoginPage = ({ onClose, onSignupClick, onLoginSuccess }) => {
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("/login", {
        email: emailOrName,
        password,
        role,
      });

      const { token, email: returnedEmail, role: returnedRole } = res.data;
      setMessage("Login successful");

      onLoginSuccess(returnedEmail, returnedRole, token);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Login failed"));
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword.trim() !== confirmPassword.trim()) {
      setResetMessage("❌ Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/reset-password", {
        email: resetEmail.trim(),
        newPassword: newPassword.trim(),
      });

      setResetMessage("✅ Password updated successfully!");
      setResetEmail("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowForgot(false);
        setResetMessage("");
      }, 1500);
    } catch (err) {
      setResetMessage("❌ " + (err.response?.data?.message || "Reset failed"));
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Log in here</h2>
      <div className="login-box">
        <button className="close-btn" onClick={onClose}>✖</button>

        <label htmlFor="email" className="input-label">Email</label>
        <input
          type="text"
          id="email"
          placeholder="jane@gmail.com"
          className="input-field"
          value={emailOrName}
          onChange={(e) => setEmailOrName(e.target.value)}
        />

        <label htmlFor="password" className="input-label">Password</label>
        <input
          type="password"
          id="password"
          placeholder="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label htmlFor="role" className="input-label">Select Role</label>
        <select
          id="role"
          className="input-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button className="login-btn" onClick={handleLogin}>LOG IN</button>

        {message && <p className="login-message">{message}</p>}

        <p className="sign-in-here" onClick={onSignupClick}>
          Don't have an account?{" "}
          <span style={{ color: "#f25c9c", cursor: "pointer", fontWeight: "bold" }}>
            Sign Up
          </span>
        </p>

        <p
          onClick={() => setShowForgot(true)}
          style={{
            color: "#f25c9c",
            cursor: "pointer",
            fontSize: "0.9rem",
            marginTop: "5px",
            marginBottom: "10px"
          }}
        >
          Forgot Password?
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
            <div className="modal-buttons">
              <button onClick={handlePasswordReset} className="login-btn">Reset</button>
              <button onClick={() => setShowForgot(false)} className="close-btn">Cancel</button>
            </div>
            {resetMessage && <p className="login-message">{resetMessage}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
