import { Link, useParams } from "react-router-dom";
import { services } from "../../data/siteData";
import CateringExplore from "../Services/CateringExplore";
import DecorExplore from "../Services/DecorExplore";
import EventManagementExplore from "../Services/EventManagementExplore";
import "./ServiceDetails.css";

export default function ServiceDetails() {
  const { slug } = useParams();

  // Catering gets its own full explore experience
  if (slug && slug.toLowerCase().includes("cater")) {
    return <CateringExplore />;
  }

  // Decor gets its own full explore experience
  if (slug && slug.toLowerCase().includes("decor")) {
    return <DecorExplore />;
  }

  // Event Management gets its own full page
  if (slug && slug.toLowerCase().includes("event")) {
    return <EventManagementExplore />;
  }

  const service = services.find((x) => x.slug === slug) || services[0];

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">SERVICE</p>
          <h1>{service.title} for your <em>perfect day.</em></h1>
          <p>{service.description}</p>
        </div>
      </section>

      <section className="section detail-grid">
        <img src={service.image} alt={service.title} />
        <div>
          <p className="eyebrow">EVENDDY</p>
          <h2>Thoughtful details. <em>Beautifully delivered.</em></h2>
          <p>Our {service.title.toLowerCase()} service is designed to fit the mood, scale and needs of your event.</p>
          <Link className="btn btn-primary" to="/plan-event">Plan my event →</Link>
        </div>
      </section>
    </>
  );
}
