import { Link, useParams } from "react-router-dom";
import { events } from "../../data/siteData";
import "./EventDetails.css";

export default function EventDetails() {
  const { slug } = useParams();
  const event = events.find((x) => x.slug === slug) || events[0];

  return (
    <>
      {/* HERO */}
      <section className="event-detail-hero">
        <img src={event.image} alt={event.title} />
        <div className="container">
          <p className="eyebrow">EVENT / {event.category}</p>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
        </div>
      </section>

      {/* COPY */}
      <section className="section event-detail-copy">
        <div className="container">
          <p className="eyebrow">THE EXPERIENCE</p>
          <h2>
            Designed around the <em>moment.</em>
          </h2>
          <p>
            Every element was considered to create a cohesive experience for
            the hosts and guests.
          </p>
          <Link className="btn btn-primary" to="/plan-event">
            Plan something similar →
          </Link>
        </div>
      </section>
    </>
  );
}