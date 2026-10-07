import { Link } from "react-router-dom";
import { stories } from "../../data/siteData";
import StoryCard from "../StoryCard/StoryCard";
import SectionHeading from "../SectionHeading/SectionHeading";
import { ArrowRight } from "lucide-react";

export default function StoriesSection() {
  return (
    <section className="section stories-preview"><div className="container"><div className="split-heading"><SectionHeading eyebrow="READ, EXPLORE & INSPIRE" title="<em>Stories</em> & Inspiration." /><Link className="text-button" to="/blog">View all stories <ArrowRight size={16} /></Link></div><div className="stories-grid">{stories.map(x => <StoryCard key={x.slug} story={x} />)}</div></div></section>
  );
}
