import { Link } from "react-router-dom";
import { User, TrendingUp, FileText, ShieldCheck } from "lucide-react";
import handshakeImage from "../../assets/images/shakeHand.png";

export default function VendorSection() {
  return (
    <section className="vendor-hero">
            {/* Background Image */}
            <img
              src={handshakeImage}
              alt="Handshake"
              className="vendor-hero-image"
            />
    
            <div className="container vendor-hero-container">
    
              {/* LEFT CONTENT */}
              <div className="vendor-hero-content">
                <p className="vendor-eyebrow">FOR VENDORS</p>
    
                <h2>
                  Grow your business with
                  <br />
                  <span>EVENDDY.</span>
                </h2>
    
                <p className="vendor-desc">
                  Are you a photographer, decorator, caterer or venue owner? Join a
                  curated network of premium vendors and get discovered by
                  thousands of event hosts every month.
                </p>
    
                <Link to="/vendors" className="vendor-btn">
                  Become a Vendor <span>→</span>
                </Link>
    
                {/* STATS */}
                <div className="vendor-stats">
                  <div className="v-stat">
                    <strong>10k+</strong>
                    <small>Active hosts</small>
                  </div>
                  <div className="v-stat">
                    <strong>2.5k+</strong>
                    <small>Vendors onboarded</small>
                  </div>
                  <div className="v-stat">
                    <strong>4.9★</strong>
                    <small>Avg vendor rating</small>
                  </div>
                </div>
              </div>
    
              {/* RIGHT FLOATING CARDS */}
              <div className="vendor-cards">
                <div className="v-card v-card-1">
                  <div className="v-card-icon"><User size={18} /></div>
                  <h4>Reach intent-driven clients</h4>
                  <p>Connect with hosts actively planning weddings, parties and corporate events.</p>
                </div>
    
                <div className="v-card v-card-2">
                  <div className="v-card-icon"><TrendingUp size={18} /></div>
                  <h4>Grow your bookings</h4>
                  <p>Showcase your portfolio, packages and reviews on a premium discovery surface.</p>
                </div>
    
                <div className="v-card v-card-3">
                  <div className="v-card-icon"><FileText size={18} /></div>
                  <h4>Zero joining fees</h4>
                  <p>List your services for free. Pay only a small commission on confirmed bookings.</p>
                </div>
    
                <div className="v-card v-card-4">
                  <div className="v-card-icon"><ShieldCheck size={18} /></div>
                  <h4>Verified &amp; trusted</h4>
                  <p>Get a verified badge, secure payments, and dedicated vendor support.</p>
                </div>
              </div>
    
            </div>
          </section>
  );
}
