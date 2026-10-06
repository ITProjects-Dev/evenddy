import { Link, useLocation } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import "./Footer.css";
import logo from "../../assets/white_logo.svg";

/* ---- Custom Social Icons (Lucide removed brand icons) ---- */
const InstagramIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  const location = useLocation();

  const scrollToTop = () => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const handleFaqClick = (event) => {
    if (location.pathname === "/" && location.hash === "#home-faq") {
      event.preventDefault();
      document.getElementById("home-faq")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-top">
        
        {/* BRAND COLUMN */}
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logo} alt="Evenddy" />
          </div>
          <p>Curating unforgettable celebrations, one beautiful detail at a time.</p>
          
          {/* SOCIAL ICONS */}
          <div className="footer-socials">
            <a href="https://instagram.com/evenddy" target="_blank" rel="noreferrer" aria-label="Instagram" onClick={scrollToTop}>
              <InstagramIcon size={16} />
            </a>
            <a href="https://facebook.com/evenddy" target="_blank" rel="noreferrer" aria-label="Facebook" onClick={scrollToTop}>
              <FacebookIcon size={16} />
            </a>
            <a href="https://twitter.com/evenddy" target="_blank" rel="noreferrer" aria-label="Twitter" onClick={scrollToTop}>
              <TwitterIcon size={16} />
            </a>
            <a href="https://linkedin.com/company/evenddy" target="_blank" rel="noreferrer" aria-label="LinkedIn" onClick={scrollToTop}>
              <LinkedinIcon size={16} />
            </a>
          </div>
        </div>

        {/* EXPLORE COLUMN */}
        <div className="footer-column">
          <h4>Explore</h4>
          <Link to="/services" onClick={scrollToTop}>Services</Link>
          <Link to="/gallery" onClick={scrollToTop}>Gallery</Link>
          <Link to="/events" onClick={scrollToTop}>Events</Link>
          <Link to="/blog" onClick={scrollToTop}>Stories</Link>
        </div>

        {/* COMPANY COLUMN */}
        <div className="footer-column">
          <h4>Company</h4>
          <Link to="/about" onClick={scrollToTop}>About</Link>
          <Link to="/contact" onClick={scrollToTop}>Contact</Link>
          <Link to="/#home-faq" onClick={handleFaqClick}>FAQ</Link>
          <Link to="/plan-event" onClick={scrollToTop}>Plan an Event</Link>
        </div>

        {/* CONTACT COLUMN WITH ICONS */}
        <div className="footer-column">
          <h4>Contact</h4>
          
          <a href="mailto:hello@evenddy.com" className="footer-contact-item" onClick={scrollToTop}>
            <Mail size={14} className="footer-icon" />
            <span>hello@evenddy.com</span>
          </a>
          
          <a href="tel:+919999999999" className="footer-contact-item" onClick={scrollToTop}>
            <Phone size={14} className="footer-icon" />
            <span>+91 99999 99999</span>
          </a>
          
          <span className="footer-contact-item">
            <MapPin size={14} className="footer-icon" />
            <span>Hyderabad, India</span>
          </span>
        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="container footer-bottom">
        <span>© 2026 Evenddy. All rights reserved.</span>
        <span>Privacy · Terms</span>
      </div>

      {/* GIANT TEXT */}
      <div className="footer-word">Evenddy</div>
    </footer>
  );
}