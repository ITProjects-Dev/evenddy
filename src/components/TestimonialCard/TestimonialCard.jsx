import "./TestimonialCard.css";

export default function TestimonialCard({ item }) {
  return (
    <article className="testimonial">
      <span className="quote">“</span>
      <p>{item.text}</p>
      <strong>{item.name}</strong>
      <small>{item.meta}</small>
    </article>
  );
}