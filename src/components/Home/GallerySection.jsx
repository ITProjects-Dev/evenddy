import { Link } from "react-router-dom";
import { images } from "../../data/siteData";

export default function GallerySection() {
  return (
    <section className="section gallery-preview">
            <div className="container">
    
              {/* HEADER */}
              <div className="gallery-top">
    
                <div className="gallery-heading">
    
                  <p className="gallery-eyebrow">
                    PORTFOLIO
                  </p>
    
                  <h2>
                    Moments we've helped
                    <br />
                    <em>Create.</em>
                  </h2>
    
                  <p className="gallery-description">
                    A glimpse into the celebrations we've crafted with our partners
                    across India — from intimate ceremonies to grand receptions.
                  </p>
    
                </div>
    
    
                <Link
                  to="/gallery"
                  className="gallery-plan-button"
                >
                  <span>Plan a moment like this</span>
                  <strong>→</strong>
                </Link>
    
              </div>
    
    
              {/* GALLERY */}
              <div className="gallery-strip">
    
                {/* ROW 1 - PARTIAL LEFT */}
                <div className="gallery-card gallery-card-small">
                  <img
                    src={images.food}
                    alt="Fine dining"
                  />
    
                  <div className="gallery-overlay"></div>
                </div>
    
    
                {/* RECEPTION */}
                <div className="gallery-card gallery-reception">
                  <img
                    src={images.event}
                    alt="Reception setup"
                  />
    
                  <span className="gallery-tag">
                    ♧ Decor
                  </span>
    
                  <span className="gallery-title">
                    Reception setup
                  </span>
                </div>
    
    
                {/* BALLOONS */}
                <div className="gallery-card gallery-balloons">
                  <img
                    src={images.party}
                    alt="Birthday party"
                  />
    
                  <span className="gallery-tag">
                    ♧ Decor
                  </span>
    
                  <span className="gallery-title">
                    Birthday party
                  </span>
                </div>
    
    
                {/* FINE DINING */}
                <div className="gallery-card gallery-food">
                  <img
                    src={images.food}
                    alt="Fine dining"
                  />
    
                  <span className="gallery-tag">
                    ♧ Catering
                  </span>
    
                  <span className="gallery-title">
                    Fine dining
                  </span>
                </div>
    
    
                {/* BRIDAL */}
                <div className="gallery-card gallery-bridal">
                  <img
                    src={images.party}
                    alt="Bridal moments"
                  />
    
                  <span className="gallery-tag">
                    ♧ Makeup Artist
                  </span>
    
                  <span className="gallery-title">
                    Bridal moments
                  </span>
                </div>
    
    
                {/* PARTIAL RIGHT */}
                <div className="gallery-card gallery-card-small">
                  <img
                    src={images.food}
                    alt="Fine dining"
                  />
    
                  <div className="gallery-overlay"></div>
                </div>
    
    
                {/* ROW 2 - COUPLE */}
                <div className="gallery-card gallery-couple">
                  <img
                    src={images.wedding}
                    alt="Wedding couple"
                  />
    
                  <span className="gallery-title">
                    Wedding moments
                  </span>
                </div>
    
    
                {/* ROW 2 - LARGE CANDLELIGHT */}
                <div className="gallery-card gallery-candlelight">
                  <img
                    src={images.event}
                    alt="Candlelit dinner"
                  />
    
                  <span className="gallery-tag">
                    ♧ Decor
                  </span>
    
                  <span className="gallery-title">
                    Candlelit dinner
                  </span>
                </div>
    
    
                {/* ROW 2 - WOMAN */}
                <div className="gallery-card gallery-outdoor">
                  <img
                    src={images.wedding}
                    alt="Outdoor celebration"
                  />
    
                  <span className="gallery-tag">
                    ♧ Catering
                  </span>
    
                  <span className="gallery-title">
                    Candlelit dinner
                  </span>
                </div>
    
    
                {/* ROW 3 - PARTIAL LEFT */}
                <div className="gallery-card gallery-card-small">
                  <img
                    src={images.food}
                    alt="Reception"
                  />
    
                  <div className="gallery-overlay"></div>
                </div>
    
    
                {/* ROW 3 RECEPTION */}
                <div className="gallery-card gallery-reception-bottom">
                  <img
                    src={images.event}
                    alt="Reception setup"
                  />
    
                  <span className="gallery-tag">
                    ♧ Decor
                  </span>
    
                  <span className="gallery-title">
                    Reception setup
                  </span>
                </div>
    
    
                {/* SANGET */}
                <div className="gallery-card gallery-sangeet">
                  <img
                    src={images.flowers}
                    alt="Sangeet night"
                  />
    
                  <span className="gallery-tag">
                    ♧ Entertainment
                  </span>
    
                  <span className="gallery-title">
                    Sangeet night
                  </span>
                </div>
    
    
                {/* FOOD */}
                <div className="gallery-card gallery-food-bottom">
                  <img
                    src={images.food}
                    alt="Fine dining"
                  />
    
                  <span className="gallery-tag">
                    ♧ Catering
                  </span>
    
                  <span className="gallery-title">
                    Fine dining
                  </span>
                </div>
    
    
                {/* SUNSET */}
                <div className="gallery-card gallery-sunset">
                  <img
                    src={images.party}
                    alt="Outdoor photo shoot"
                  />
    
                  <span className="gallery-tag">
                    ♧ Photography
                  </span>
    
                  <span className="gallery-title">
                    Outdoor photo shoots
                  </span>
                </div>
    
    
                {/* RIGHT PARTIAL */}
                <div className="gallery-card gallery-card-small">
                  <img
                    src={images.food}
                    alt="Fine dining"
                  />
    
                  <div className="gallery-overlay"></div>
                </div>
    
              </div>
    
            </div>
          </section>
  );
}
