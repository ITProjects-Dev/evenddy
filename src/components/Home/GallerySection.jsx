import { Link } from "react-router-dom";
import { images } from "../../data/siteData";
import { ArrowRight } from "lucide-react";

export default function GallerySection() {
  // Row 1 — mixed size cards
  const row1 = [
    { img: "food",    tag: "♧ Catering",     title: "Fine dining",       size: "small" },
    { img: "event",   tag: "♧ Decor",        title: "Reception setup",   size: "medium" },
    { img: "party",   tag: "♧ Decor",        title: "Birthday party",    size: "medium" },
    { img: "food",    tag: "♧ Catering",     title: "Fine dining",       size: "medium" },
    { img: "party",   tag: "♧ Makeup Artist",title: "Bridal moments",    size: "medium" },
    { img: "event",   tag: "♧ Decor",        title: "Candlelit dinner",  size: "medium" },
    { img: "wedding", tag: "♧ Wedding",             title: "Wedding moments",   size: "medium" },
    { img: "food",    tag: "♧ Catering",     title: "Fine dining",       size: "small" },
  ];

  // Row 2 — bigger cards
  const row2 = [
    { img: "wedding", tag: "♧ Wedding",             title: "Wedding moments",   size: "large" },
    { img: "event",   tag: "♧ Decor",        title: "Candlelit dinner",  size: "large" },
    { img: "wedding", tag: "♧ Catering",     title: "Candlelit dinner",  size: "large" },
    { img: "event",   tag: "♧ Decor",        title: "Reception setup",   size: "small" },
    { img: "flowers", tag: "♧ Entertainment",title: "Sangeet night",     size: "medium" },
    { img: "food",    tag: "♧ Catering",     title: "Fine dining",       size: "medium" },
    { img: "party",   tag: "♧ Photography",  title: "Outdoor photo shoots", size: "small" },
    { img: "food",    tag: "♧ Catering",     title: "Fine dining",       size: "medium" },
  ];

  const renderCard = (item, key) => (
    <div className={`gallery-big-card size-${item.size}`} key={key}>
      <img src={images[item.img]} alt={item.title} />
      {item.tag && <span className="gallery-tag">{item.tag}</span>}
      {item.title && <span className="gallery-title">{item.title}</span>}
    </div>
  );

  return (
    <section className="section gallery-preview">
      <div className="container">
        {/* HEADER */}
        <div className="gallery-top">
          <div className="gallery-heading">
            <p className="gallery-eyebrow">PORTFOLIO</p>
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

          <Link to="/gallery" className="gallery-plan-button">
            <span>Plan a moment like this</span>
            <strong><ArrowRight size={16} /></strong>
          </Link>
        </div>
      </div>

      {/* ROW 1 — sliding left (default) */}
      {/* <div className="gallery-big-marquee">
        <div className="gallery-big-track">
          {row1.map((item, i) => renderCard(item, `r1a-${i}`))}
          {row1.map((item, i) => renderCard(item, `r1b-${i}`))}
        </div>
      </div> */}

      {/* ROW 2 — sliding right (reverse) */}
      <div className="gallery-big-marquee gallery-big-marquee-reverse">
        <div className="gallery-big-track">
          {row2.map((item, i) => renderCard(item, `r2a-${i}`))}
          {row2.map((item, i) => renderCard(item, `r2b-${i}`))}
        </div>
      </div>
    </section>
  );
}