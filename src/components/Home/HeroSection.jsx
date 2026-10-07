import { Link } from "react-router-dom";
import banner1 from "../../assets/images/banner1.svg";
import banner2 from "../../assets/images/banner2.svg";
import { Star } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="home-hero">
      <div className="container home-hero-grid">

        {/* LEFT CONTENT */}
        <div className="home-hero-content">

          <div className="hero-location-badge">
            <span className="hero-badge-icon"><Star size={14} /></span>
            <span>Now serving in Vizag and nearby</span>
          </div>

          <h1>
            Curating
            <br />
            <em>unforgettable</em>
            <br />
            celebrations.
          </h1>

          <p className="hero-description">
            From intimate ceremonies to grand weddings — Evenddy brings
            together India's finest caterers, decorators and vendors so you can
            celebrate every moment, effortlessly.
          </p>

          <div className="hero-actions">

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                document.getElementById("plan-event")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Plan My Event
            </button>

            <Link
              className="btn btn-outline"
              to="/vendors"
            >
              Become a Vendor
            </Link>

          </div>

          <div className="hero-stats">

            <div className="hero-stat">
              <strong>200+</strong>
              <span>EVENTS CRAFTED</span>
            </div>

            <div className="hero-stat">
              <strong>50+</strong>
              <span>VENDOR PARTNERS</span>
            </div>

            <div className="hero-stat">
              <strong>4.9★</strong>
              <span>CLIENT RATING</span>
            </div>

          </div>

        </div>


        {/* RIGHT IMAGE COLLAGE */}
        <div className="hero-collage">

          <img
            className="hero-main"
            src={banner1}
            alt="Wedding celebration"
          />

          <img
            className="hero-food"
            src={banner2}
            alt="Event catering"
          />

          <div className="hero-city-card">

            <div className="hero-city-icon">
              <Star />
            </div>

            <div>
              <strong>2+ more cities in India</strong>
              <span>We are Expanding soon</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
