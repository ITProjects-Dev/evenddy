import { services } from "../../data/siteData";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import SectionHeading from "../../components/SectionHeading/SectionHeading";
import "./Services.css";
export default function Services() {
    return <>
        {/* <section className="page-hero">
            <div className="container">
                <p className="eyebrow">WHAT WE DO</p>
                <h1>Everything you need for an <em>unforgettable</em> celebration.</h1>
                <p>Explore Evenddy's event services and build an experience around your vision.</p>
            </div>
        </section> */}
        <section className="section">
            <div className="container">
                <SectionHeading eyebrow="EVENDDY SERVICES" title="Designed around <em>your day.</em>" text="From the first idea to the final guest departure, our services can work together as one seamless experience." />
                <div className="service-grid">{services.map(s => <ServiceCard key={s.slug} service={s} />)}
                </div>
            </div>
        </section></>
}