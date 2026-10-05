import { useState } from "react";
import "./FAQ.css";

export default function FAQ({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <div className={`faq ${open === index ? "active" : ""}`} key={item.question}>
          <button onClick={() => setOpen(open === index ? -1 : index)}>
            <span>{item.question}</span>
            <b>{open === index ? "−" : "+"}</b>
          </button>
          {open === index && <p>{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}