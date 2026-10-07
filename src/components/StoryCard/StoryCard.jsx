import { Link } from "react-router-dom";
import "./StoryCard.css";
import { ArrowRight } from "lucide-react";

export default function StoryCard({ story }) {
  return (
    <article className="story-card">
      <img src={story.image} alt={story.title} />
      <div>
        <small>{story.category}</small>
        <h3>{story.title}</h3>
        <Link to={`/blog/${story.slug}`}>Read story <ArrowRight size={16}/></Link>
      </div>
    </article>
  );
}