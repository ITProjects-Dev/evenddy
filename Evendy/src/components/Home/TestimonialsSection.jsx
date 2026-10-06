import { testimonials } from "../../data/siteData";
import SectionHeading from "../SectionHeading/SectionHeading";

export default function TestimonialsSection() {
  return (
    <section className="section testimonials-section">
            <div className="container">
              <SectionHeading center eyebrow="WHAT THEY SAY" title="Loved by our <em>Clients.</em>" />
    
              <div className="testimonial-grid">
                {testimonials.map((item, index) => (
                  <div className="testimonial-card-custom" key={item.name || index}>
                    <div className="quote-icon">“</div>
    
                    <p className="quote-text">
                      {/* Adjust 'item.quote' or 'item.text' based on your siteData.js structure */}
                      {item.quote || item.text}
                    </p>
    
                    <div className="quote-divider"></div>
    
                    <div className="author-info">
                      <strong>{item.name}</strong>
                      <span>
                        {item.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
  );
}
