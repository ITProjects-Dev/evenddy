import { Link } from "react-router-dom";
import { useState } from "react";
import { images, services, stories, testimonials, faqs } from "../../data/siteData";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import StoryCard from "../../components/StoryCard/StoryCard";
import TestimonialCard from "../../components/TestimonialCard/TestimonialCard";
import FAQ from "../../components/FAQ/FAQ";
import SectionHeading from "../../components/SectionHeading/SectionHeading";
import "./Home.css";
import banner1 from "../../assets/images/banner1.svg";
import banner2 from "../../assets/images/banner2.svg";

import photographyIcon from "../../assets/icons/photography.png";
import venueIcon from "../../assets/icons/venue-booking.png";
import makeupIcon from "../../assets/icons/makeups.png";
import entertainmentIcon from "../../assets/icons/entertainment.png";

export default function Home() {
  
  return (
    <>
   <section className="home-hero">
  <div className="container home-hero-grid">

    {/* LEFT CONTENT */}
    <div className="home-hero-content">

      <div className="hero-location-badge">
        <span className="hero-badge-icon">✧</span>
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

        <Link
          className="btn btn-primary"
          to="/plan-event"
        >
          Plan My Event
        </Link>

        <Link
          className="btn btn-outline"
          to="/services"
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
          ✦
        </div>

        <div>
          <strong>2+ more cities in India</strong>
          <span>We are Expanding soon</span>
        </div>

      </div>

    </div>

  </div>
</section>

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
              Explore <span>→</span>
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

     <section className="process-section">
  <div className="container">

    <div className="process-heading">
      <p className="process-eyebrow">HOW IT WORKS</p>

      <h2>
        Three simple steps to a perfect
        <br />
        day.
      </h2>
    </div>

    <div className="process-grid">

      <div className="process-item">
        <div className="process-number">01</div>

        <h3>Share your vision</h3>

        <p>
          Tell us about your event — date, guests, style and
          the experience you imagine.
        </p>
      </div>


      <div className="process-item">
        <div className="process-number">02</div>

        <h3>We curate the team</h3>

        <p>
          Our planners pair you with the right caterers,
          decorators and trusted vendors.
        </p>
      </div>


      <div className="process-item">
        <div className="process-number">03</div>

        <h3>You celebrate</h3>

        <p>
          Sit back as we manage every detail — you only
          show up to enjoy the moment.
        </p>
      </div>

    </div>

  </div>
</section>

     <section className="section planner-preview">
  <div className="container">

    {/* =========================================
        PLANNER HEADING
    ========================================= */}

    <div className="planner-heading">

      <div className="planner-badge">
        <span>✧</span>
        Free planning consultation
      </div>

      <h2>
        Plan your next
        <br />
        <em>event together</em>
      </h2>

      <p>
        Share a few details. A dedicated planner curates a tailored proposal
        with transparent pricing — back to you within 24 hours.
      </p>

    </div>


    {/* =========================================
        PLANNER CONTENT
    ========================================= */}

    <PlannerForm />

  </div>
</section>

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

      <section className="section testimonials-section">
        <div className="container"><SectionHeading center eyebrow="WHAT THEY SAY" title="Loved by our <em>Clients.</em>"/><div className="testimonial-grid">{testimonials.map(x=><TestimonialCard key={x.name} item={x}/>)}</div></div>
      </section>

      <section className="business-section">
        <div className="container business-inner"><div className="business-copy"><p className="eyebrow">GROW YOUR BUSINESS WITH</p><h2>Evenddy<span>.</span></h2><p>Partner with us to reach people planning memorable celebrations and grow your event business.</p><Link className="btn btn-primary" to="/contact">Become a Vendor →</Link><div className="business-stats"><b>10k+<small>Customers</small></b><b>2.5k+<small>Partners</small></b><b>4.9★<small>Rating</small></b></div></div><div className="business-visual"><div className="hand-shape"/><div className="float-box b1">✓ Quick & easy</div><div className="float-box b2">↗ Grow your reach</div><div className="float-box b3">✦ Get discovered</div></div></div>
      </section>

      <section className="section app-section"><div className="container app-grid"><div><p className="eyebrow">YOUR EVENT, IN YOUR POCKET</p><h2>Plan your event<br/>from your <em>pocket.</em></h2><p>Manage your event, discover inspiration and stay connected with your planning team wherever you are.</p><div className="store-buttons"><button> App Store</button><button>▶ Google Play</button></div></div><div className="phone"><div><small>EVENDDY</small><img src={images.party} alt="Evenddy app"/><h3>Manage everything<br/>in one place.</h3><Link className="btn btn-primary" to="/plan-event">Plan your event</Link></div></div></div></section>

      <section className="section stories-preview"><div className="container"><div className="split-heading"><SectionHeading eyebrow="READ, EXPLORE & INSPIRE" title="<em>Stories</em> & Inspiration."/><Link className="text-button" to="/blog">View all stories →</Link></div><div className="stories-grid">{stories.map(x=><StoryCard key={x.slug} story={x}/>)}</div></div></section>

      <section className="section faq-preview"><div className="container faq-container"><SectionHeading center eyebrow="FAQ" title="Questions, <em>Answered.</em>"/><FAQ items={faqs}/></div></section>

      <section className="final-cta"><div className="container final-content"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Let's plan your perfect <em>day.</em></h2><p>Tell us what you are dreaming about. We'll help make it happen.</p><Link className="btn btn-light" to="/plan-event">Start planning →</Link></div></section>
    </>
  );
}


function PlannerForm() {

  const serviceOptions = [
    "Photographers",
    "Makeup Artists",
    "Venues",
    "DJS",
    "Caterers",
    "Decorators",
    "Entertainment",
  ];


  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    eventType: "",
    eventDate: "",
    location: "",
    services: [],
  });


  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  const handleServiceToggle = (service) => {

    setFormData((previous) => {

      const isSelected =
        previous.services.includes(service);


      if (isSelected) {

        return {
          ...previous,

          services: previous.services.filter(
            (item) => item !== service
          ),
        };

      }


      return {
        ...previous,

        services: [
          ...previous.services,
          service,
        ],
      };

    });

  };


  const handleSubmit = (e) => {

    e.preventDefault();

    console.log("Planner form submitted:", formData);

  };


  return (

    <div className="planner-preview-grid">


      {/* =========================================
          LEFT FORM
      ========================================= */}

      <form
        className="planner-form-card"
        onSubmit={handleSubmit}
      >


        {/* NAME + PHONE */}

        <div className="planner-form-row">

          <div className="planner-field">

            <label htmlFor="planner-name">
              Your Name
            </label>

            <input
              id="planner-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              autoComplete="name"
              required
            />

          </div>


          <div className="planner-field">

            <label htmlFor="planner-phone">
              Phone number
            </label>

            <input
              id="planner-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              autoComplete="tel"
              inputMode="numeric"
              maxLength="10"
              pattern="[0-9]{10}"
              required
            />

          </div>

        </div>


        {/* EVENT TYPE + DATE */}

        <div className="planner-form-row">

          <div className="planner-field">

            <label htmlFor="planner-event-type">
              Event Type
            </label>

            <div className="planner-select-wrapper">

              <select
                id="planner-event-type"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select
                </option>

                <option value="Wedding">
                  Wedding
                </option>

                <option value="Engagement">
                  Engagement
                </option>

                <option value="Reception">
                  Reception
                </option>

                <option value="Birthday">
                  Birthday
                </option>

                <option value="Anniversary">
                  Anniversary
                </option>

                <option value="Baby Shower">
                  Baby Shower
                </option>

                <option value="Corporate Event">
                  Corporate Event
                </option>

                <option value="House Warming">
                  House Warming
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>


          <div className="planner-field">

            <label htmlFor="planner-date">
              Event date
            </label>

            <input
              id="planner-date"
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              required
            />

          </div>

        </div>


        {/* LOCATION */}

        <div className="planner-field">

          <label htmlFor="planner-location">
            Event Location
          </label>

          <div className="planner-location-input">

            <span className="location-icon">
              ⌖
            </span>

            <input
              id="planner-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City / Location"
              autoComplete="address-level2"
              required
            />

          </div>

        </div>


        {/* SERVICES MULTI SELECT */}

        <div className="planner-field">

          <label>
            Services needed
          </label>


          <div className="planner-services">

            {serviceOptions.map((service) => {

              const selected =
                formData.services.includes(service);


              return (

                <button
                  key={service}
                  type="button"
                  className={
                    selected
                      ? "planner-service-option selected"
                      : "planner-service-option"
                  }
                  onClick={() =>
                    handleServiceToggle(service)
                  }
                  aria-pressed={selected}
                >

                  {service}

                  {selected && (
                    <span className="service-check">
                      ✓
                    </span>
                  )}

                </button>

              );

            })}

          </div>


          <small className="planner-service-help">
            Combine multiple for best package pricing.
          </small>

        </div>


        {/* SUBMIT BUTTON */}

        <button
          type="submit"
          className="planner-submit"
        >
          Request my quote
        </button>


        {/* DISCLAIMER */}

        <p className="planner-disclaimer">
          By submitting, you agree to be contacted by our team.
          No spam, ever.
        </p>

      </form>


      {/* =========================================
          RIGHT SIDE
      ========================================= */}

      <div className="planner-right">


        {/* SERVICE AREA */}

        <div className="planner-service-area">

          <span className="planner-area-label">
            SERVICE AREA
          </span>


          <h3>
            Visakhapatnam &amp; nearby
          </h3>


          <p>
            Local crews, local pricing — operating across the Vizag belt.
          </p>


          {/* MAP */}

          <div className="planner-map">

            <div className="map-ring ring-1"></div>

            <div className="map-ring ring-2"></div>

            <div className="map-ring ring-3"></div>


            <div className="map-center">

              <span>
                ✦
              </span>

              <small>
                Vizag
              </small>

            </div>


            <span className="map-location bheemili">

              <i>
                ⌖
              </i>

              <small>
                Bheemili
              </small>

            </span>


            <span className="map-location anakapalle">

              <i>
                ⌖
              </i>

              <small>
                Anakapalle
              </small>

            </span>


            <span className="map-location gajuwaka">

              <i>
                ⌖
              </i>

              <small>
                Gajuwaka
              </small>

            </span>


            <span className="map-location araku">

              <i>
                ⌖
              </i>

              <small>
                Araku
              </small>

            </span>

          </div>


          {/* LOCATION TAGS */}

          <div className="planner-area-tags">

            <span>
              <b>●</b>
              Visakhapatnam
            </span>

            <span>
              <b>●</b>
              Bheemili
            </span>

            <span>
              <b>●</b>
              Gajuwaka
            </span>

            <span>
              <b>●</b>
              Anakapalle
            </span>

            <span>
              <b>●</b>
              Vizianagaram
            </span>

            <span>
              <b>●</b>
              Araku
            </span>

          </div>

        </div>


        {/* CONTACT CARD */}

        <div className="planner-contact-card">


          <div className="planner-contact-item">

            <div className="contact-icon">
              ☎
            </div>

            <div>

              <small>
                Talk to a planner
              </small>

              <strong>
                +91 99999 99999
              </strong>

            </div>

          </div>


          <div className="planner-contact-item">

            <div className="contact-icon booking-icon">
              ✦
            </div>

            <div>

              <small>
                Booking now
              </small>

              <strong>
                2026 events with us !
              </strong>

            </div>

          </div>


        </div>

      </div>

    </div>

  );

}