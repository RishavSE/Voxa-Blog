import React from 'react';
import styles from './Footer.module.css';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';

//  Accept className as a prop
function Footer({ className = "" }) {
  return (
    <footer className={`animate__animated animate__fadeInUp ${styles.footer} ${className}`}>
      <div className={styles.footerLeft}>
        <div className={styles.logo}>VoxaBlog</div>
        <p>Follow Us</p>
        <div className={styles.socialIcons}>
          <a href="#"><FaFacebookF /></a>
          <a href="#"><FaLinkedinIn /></a>
          <a href="#"><FaYoutube /></a>
          <a href="#"><FaInstagram /></a>
        </div>
      </div>

      <div className={styles.footerLinks}>
        <h4>Quick Links</h4>
        <a href="#">Home</a><br />
        <a href="MyBlogs">Create Blogs</a><br />
        <a href="#">My Blogs</a>
      </div>

      <div className={styles.footerInfo}>
        <a href="#">ABOUT US</a>
        <a href="#">CONTACT US</a>
        <p>VoxaBlog © 2025, All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
