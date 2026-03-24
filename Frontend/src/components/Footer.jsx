import React from "react";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa";

function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        background: "linear-gradient(to right, #ffffff, #f8fafc)",
        color: "#111",
        padding: "30px 15px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "25px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontWeight: "700",
              background: "linear-gradient(45deg, #ff4d6d, #ff9a9e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            VoxaBlog
          </h2>

          <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>
            Follow Us
          </p>

          <div style={{ display: "flex", gap: "15px" }}>
            {[FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram].map(
              (Icon, index) => (
                <div
                  key={index}
                  style={{
                    height: "38px",
                    width: "38px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.background = "#ff4d6d";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.color = "#000";
                  }}
                >
                  <Icon />
                </div>
              )
            )}
          </div>
        </div>

     
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <a href="#" style={linkStyle}>
            ABOUT US
          </a>
          <a href="#" style={linkStyle}>
            CONTACT US
          </a>
        </div>
      </div>

      <div
        style={{
          marginTop: "25px",
          borderTop: "1px solid #e5e7eb",
          width: "100%",
          textAlign: "center",
          paddingTop: "12px",
          fontSize: "13px",
          color: "#777",
        }}
      >
        VoxaBlog © 2025, All rights reserved.
      </div>
    </footer>
  );
}

const linkStyle = {
  textDecoration: "none",
  color: "#111",
  fontSize: "14px",
  fontWeight: "500",
  transition: "0.3s",
  letterSpacing: "0.5px",
};

export default Footer;
