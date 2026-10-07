import { Link } from "react-router-dom";
import { services } from "../../data/siteData";
import photographyIcon from "../../assets/icons/photography.png";
import venueIcon from "../../assets/icons/venue-booking.png";
import makeupIcon from "../../assets/icons/makeups.png";
import entertainmentIcon from "../../assets/icons/entertainment.png";
import { ArrowRight } from "lucide-react";

export default function ServicesSection() {
  return (
    <section className="section home-services">
            <div className="container">
    
              <div className="services-heading">
                <p className="services-eyebrow">OUR SERVICES</p>
    
                <h2>
                  Evenddy In-house
                  <br />
                  <span>Services.</span>
                </h2>
    
                <p className="services-description">
                  We specialise in catering and decor today, and are partnering with
                  India's best vendors to bring you a complete celebration marketplace soon.
                </p>
              </div>
    
    
              <div className="service-grid">
    
                {services.map((service) => (
                  <article className="service-card" key={service.slug}>
    
                    <div className="service-card-image">
                      <img
                        src={service.image}
                        alt={service.title}
                      />
                    </div>
    
                    <div className="service-card-content">
    
                      <h3>{service.title}</h3>
    
                      <p>{service.description}</p>
    
                      <Link to={`/services/${service.slug}`}>
                        Explore <ArrowRight size={16}/>
                      </Link>
    
                    </div>
    
                  </article>
                ))}
    
              </div>
    
    
              <div className="coming-soon-heading">
                <strong>Coming soon</strong>
                <span>
                  — more services through our curated vendor network.
                </span>
              </div>
    
    
              <div className="service-pills">
    
                <Link to="/services">
                  <span className="service-pill-icon">
                    <img src={photographyIcon} alt="Photography" />
                  </span>
    
                  <span className="service-pill-name">
                    Photography
                  </span>
    
                  <small>Coming soon</small>
                </Link>
    
    
                <Link to="/services">
                  <span className="service-pill-icon">
                    <img src={venueIcon} alt="Venue Booking" />
                  </span>
    
                  <span className="service-pill-name">
                    Venue Booking
                  </span>
    
                  <small>Coming soon</small>
                </Link>
    
    
                <Link to="/services">
                  <span className="service-pill-icon">
                    <img src={makeupIcon} alt="Makeup & Styling" />
                  </span>
    
                  <span className="service-pill-name">
                    Makeup & Styling
                  </span>
    
                  <small>Coming soon</small>
                </Link>
    
    
                <Link to="/services">
                  <span className="service-pill-icon">
                    <img src={entertainmentIcon} alt="Entertainment" />
                  </span>
    
                  <span className="service-pill-name">
                    Entertainment
                  </span>
    
                  <small>Coming soon</small>
                </Link>
    
              </div>
    
            </div>
          </section>
  );
}
