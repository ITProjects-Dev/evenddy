import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";
import logoImage from "../../assets/evenddy-logo.svg";


export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const close = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" to="/" onClick={close}>
    <img src={logoImage} alt="EVENDDY" />
        </Link>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <Link to="/services" onClick={close}>Services</Link>
          <Link to="/gallery" onClick={close}>Gallery</Link>
          <Link to="/events" onClick={close}>Vendors</Link>
          <Link to="/blog" onClick={close}>Blog</Link>
          <Link to="/faq" onClick={close}>FAQ</Link>
        </nav>

        <button className="btn btn-dark nav-cta" onClick={() => { close(); navigate("/plan-event"); }}>
          Get Quote
        </button>

        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          <span/><span/><span/>
        </button>
      </div>
    </header>
  );
}