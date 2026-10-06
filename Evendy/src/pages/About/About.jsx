import { images } from "../../data/siteData";
import "./About.css";

export default function About() {
  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow">ABOUT EVENDDY</p>
          <h1>
            We make the <em>important moments</em> feel effortless.
          </h1>
          <p>
            We bring people, ideas and event services together to create
            celebrations with meaning.
          </p>
        </div>
      </section>

      {/* ABOUT GRID */}
      <section className="section about-grid">
        <div className="container about-grid-inner">
          <div className="about-text">
            <p className="eyebrow">OUR STORY</p>
            <h2>
              Built around <em>your vision.</em>
            </h2>
            <p>
              Every celebration is different. Our approach combines thoughtful
              planning, creative direction and practical execution so hosts can
              focus on enjoying the moment.
            </p>
            <p>
              From intimate gatherings to large events, we believe the best
              experiences are the ones where every detail feels intentional.
            </p>
          </div>

          <div className="about-image">
            <img src={images.wedding} alt="Celebration" />
          </div>
        </div>
      </section>
    </>
  );
}