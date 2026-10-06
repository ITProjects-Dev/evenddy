import { Link } from "react-router-dom";
import "./StoryCard.css";

export default function StoryCard({ story }) {
  return (
    <article className="story-card">
      <img src={story.image} alt={story.title} />
      <div>
        <small>{story.category}</small>
        <h3>{story.title}</h3>
        <Link to={`/blog/${story.slug}`}>Read story →</Link>
      </div>
    </article>
  );
}