import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "../../data/siteData";

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section id="home-faq" className="section faq-custom-section">
            <div className="container">
    
              {/* HEADER */}
              <div className="faq-header">
                <p className="faq-eyebrow">FAQ</p>
                <h2>
                  Questions, <em>Answered.</em>
                </h2>
              </div>
    
              {/* ACCORDION LIST */}
              <div className="faq-list">
                {faqs.map((faq, index) => (
                  <div
                    className={`faq-item ${openFaq === index ? 'open' : ''}`}
                    key={index}
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <div className="faq-question">
                      {/* Adjust 'faq.question' or 'faq.title' based on your siteData.js structure */}
                      <span>{faq.question || faq.title}</span>
                      <ChevronDown className="faq-icon" size={20} />
                    </div>
    
                    {openFaq === index && (
                      <div className="faq-answer">
                        {faq.answer || faq.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
    
            </div>
          </section>
  );
}
