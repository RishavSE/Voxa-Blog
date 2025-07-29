import React, { useState } from 'react';
import './Signup.css';
import API from '../api'; // Ensure this is your configured Axios instance

const SignupPage = ({ onBackToLogin }) => {
  const [name, setName] = useState(""); // Name not saved yet
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // default role
  const [message, setMessage] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await API.post("/register", {
        name,
        email,
        password,
        role,
      });

      setMessage("✅ " + res.data.message);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || "Signup failed."));
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <button className="back-btn" onClick={onBackToLogin}>← Back to Login</button>
        <h2 className="signup-title">Sign Up</h2>

        <label className="input-label">Name</label>
        <input
          type="text"
          className="input-field"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="input-label">Email</label>
        <input
          type="email"
          className="input-field"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="input-label">Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="input-label">Confirm Password</label>
        <input
          type="password"
          className="input-field"
          placeholder="Re-enter Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <label className="input-label">Select Role</label>
        <select
          className="input-field"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button className="signup-btn" onClick={handleSignup}>SIGN UP</button>

        {message && <p className="signup-message">{message}</p>}
      </div>
    </div>
  );
};

export default SignupPage;
