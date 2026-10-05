import { Link } from "react-router-dom";
import "./EventCard.css";

export default function EventCard({ event }) {
  return (
    <article className="event-card">
      <img src={event.image} alt={event.title} />
      <div>
        <small>{event.category}</small>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <Link to={`/events/${event.slug}`}>View event →</Link>
      </div>
    </article>
  );
}