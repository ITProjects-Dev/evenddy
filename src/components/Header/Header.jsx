import { useState } from "react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import logoImage from "../../assets/evenddy-logo.svg";


export default function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const close = () => setOpen(false);


  useEffect(() => {
    const sectionId = location.hash.slice(1);

    if (location.pathname !== "/" || !sectionId) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const handleFaqClick = (event) => {
    close();

    if (location.pathname === "/" && location.hash === "#home-faq") {
      event.preventDefault();
      document.getElementById("home-faq")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" to="/" onClick={close}>
          <img src={logoImage} alt="EVENDDY" />
        </Link>

        <nav className={open ? "nav-links open" : "nav-links"}>
          <Link to="/services" onClick={close}>Services</Link>
          <Link to="/gallery" onClick={close}>Gallery</Link>
          <Link to="/vendors" onClick={close}>Vendors</Link>
          <Link to="/events" onClick={close}>Events</Link>
          <Link to="/blog" onClick={close}>Blog</Link>
          <Link to="/#home-faq" onClick={handleFaqClick}>FAQ</Link>
        </nav>


        <Link
          to="/#plan-event"
          className="btn btn-dark nav-cta"
          onClick={close}
        >
          Get in touch
        </Link>



        <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}