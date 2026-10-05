import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <div className="footer-logo"><span className="brand-mark">E</span> EVENDDY</div>
          <p>Curating unforgettable celebrations, one beautiful detail at a time.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/services">Services</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/events">Events</Link>
          <Link to="/blog">Stories</Link>
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/plan-event">Plan an Event</Link>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="mailto:hello@evenddy.com">hello@evenddy.com</a>
          <a href="tel:+919999999999">+91 99999 99999</a>
          <span>Hyderabad, India</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Evenddy. All rights reserved.</span>
        <span>Privacy · Terms</span>
      </div>
      <div className="footer-word">Evenddy</div>
    </footer>
  );
}