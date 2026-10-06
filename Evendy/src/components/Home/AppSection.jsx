import { Apple, Play } from "lucide-react";
import phone from "../../assets/images/phone.png";

export default function AppSection() {
  return (
    <section className="section app-section-custom">
            <div className="container app-layout">
    
              {/* LEFT COLUMN: TEXT & FORM */}
              <div className="app-content">
                <p className="app-eyebrow">COMING SOON</p>
    
                <h2>
                  Plan your event
                  <br />
                  from your <em>pocket.</em>
                </h2>
    
                <p className="app-desc">
                  The Evenddy app for iOS and Android lets you discover vendors,
                  manage bookings, track your budget and chat with our planners —
                  all in one place.
                </p>
    
                <form className="app-notify-form" onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="Notify me on launch" />
                  <button type="submit">Notify me</button>
                </form>
    
                <div className="app-store-buttons">
                  <button className="store-btn">
                    <Apple size={20} />
                    <div className="store-text">
                      <small>COMING SOON</small>
                      <strong>App Store</strong>
                    </div>
                  </button>
                  <button className="store-btn">
                    <Play size={20} />
                    <div className="store-text">
                      <small>COMING SOON</small>
                      <strong>Google Play</strong>
                    </div>
                  </button>
                </div>
              </div>
    
              {/* RIGHT COLUMN: PHONE MOCKUP */}
              <div className="app-visual">
                <div className="phone-mockup">
                  <img src={phone} alt="" />
                </div>
              </div>
    
            </div>
          </section>
  );
}
