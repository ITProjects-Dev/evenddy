import { useState } from "react";
import PlannerMap from "../../components/PlannerMap/PlannerMap";
export default function PlannerForm() {

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

                  {/* SERVICE AREA */}

        <div className="planner-service-area">

          {/* <span className="planner-area-label">
            SERVICE AREA
          </span>

          <h3>
            Visakhapatnam &amp; nearby
          </h3>

          <p>
            Local crews, local pricing — operating across the Vizag belt.
          </p> */}

          {/* REAL MAP */}
          <PlannerMap />

          {/* LOCATION TAGS */}
          {/* <div className="planner-area-tags">
            <span><b>●</b> Visakhapatnam</span>
            <span><b>●</b> Bheemili</span>
            <span><b>●</b> Gajuwaka</span>
            <span><b>●</b> Anakapalle</span>
            <span><b>●</b> Vizianagaram</span>
            <span><b>●</b> Araku</span>
          </div> */}

        </div>


          {/* LOCATION TAGS */}

          {/* <div className="planner-area-tags">

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

          </div> */}

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
                +91 9XXXX XXXXX
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