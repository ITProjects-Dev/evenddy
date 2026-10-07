import { Link } from "react-router-dom";
import "./ServiceCard.css";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({ service }) {
  return (
    <article className="service-card">
      <img src={service.image} alt={service.title} />
      <div className="service-card-body">
        <span className="mini-label">{service.number}</span>
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <Link to={`/services/${service.slug}`}>
          Explore <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}