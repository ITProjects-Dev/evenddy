import { Link } from "react-router-dom";
import ctaBackground from "../../assets/images/bg_purple.svg";

export default function FinalCTASection() {
  return (
    <section className="final-cta">
            {/* Background Image */}
            <img
              src={ctaBackground}
              alt=""
              className="final-cta-bg"
            />
    
            <div className="container final-content">
              <h2>Let's plan your perfect day.</h2>
    
              <p>
                Tell us a little about your celebration — we'll bring the rest.
              </p>
    
              <Link className="cta-btn" to="/plan-event">
                Get a free quote
              </Link>
            </div>
          </section>
  );
}
