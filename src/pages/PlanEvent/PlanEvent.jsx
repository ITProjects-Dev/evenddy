import "./PlanEvent.css";
import { ArrowRight } from "lucide-react";

export default function PlanEvent() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">PLAN YOUR EVENT</p>
          <h1>
            Your vision. Our <em>expertise.</em>
          </h1>
          <p>
            Share a few details and we'll help you shape the celebration.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container plan-form-wrap">
          <form className="plan-form" onSubmit={(e) => e.preventDefault()}>
            {/* FULL NAME + PHONE */}
            <div className="field-row">
              <label>
                <span>Full name</span>
                <input placeholder="Your name" />
              </label>
              <label>
                <span>Phone</span>
                <input placeholder="+91" />
              </label>
            </div>

            {/* EVENT TYPE + DATE */}
            <div className="field-row">
              <label>
                <span>Event type</span>
                <select defaultValue="">
                  <option value="" disabled>Select event</option>
                  <option>Wedding</option>
                  <option>Birthday</option>
                  <option>Corporate</option>
                  <option>Private celebration</option>
                </select>
              </label>
              <label>
                <span>Event date</span>
                <input type="date" />
              </label>
            </div>

            {/* LOCATION */}
            <label>
              <span>Location</span>
              <input placeholder="City / venue" />
            </label>

            {/* MESSAGE */}
            <label>
              <span>Tell us about your event</span>
              <textarea
                rows="6"
                placeholder="Guest count, style, services, budget or anything else..."
              />
            </label>

            {/* SUBMIT */}
            <button type="submit" className="btn btn-primary">
              Request a quote <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </section>
    </>
  );
}