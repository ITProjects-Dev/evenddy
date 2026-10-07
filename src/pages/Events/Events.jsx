import { events } from "../../data/siteData"; import EventCard from "../../components/EventCard/EventCard"; import "./Events.css";
export default function Events() {
    return <>
        {/* <section className="page-hero">
            <div className="container">
                <p className="eyebrow">EVENTS</p>
                <h1>Moments we've helped <em>create.</em></h1>
                <p>Browse a selection of celebrations and event experiences.</p>
            </div>
        </section> */}
        <section className="section page-hero">
            <div className="container mb-4">
                <p className="eyebrow">EVENTS</p>
                <h1>Moments we've helped <em>create.</em></h1>
                <p>Browse a selection of celebrations and event experiences.</p>
            </div>
            <div className="container event-grid">{events.map(e => <EventCard key={e.slug} event={e} />)}</div>
        </section>
    </>
}