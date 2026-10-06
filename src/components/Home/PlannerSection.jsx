import PlannerForm from "./PlannerForm";

export default function PlannerSection() {
  return (
    <section className="section planner-preview">
            <div className="container">
    
              {/* =========================================
            PLANNER HEADING
        ========================================= */}
    
              <div className="planner-heading">
    
                <div className="planner-badge">
                  <span>✧</span>
                  Free planning consultation
                </div>
    
                <h2>
                  Plan your next
                  <br />
                  <em>event together</em>
                </h2>
    
                <p>
                  Share a few details. A dedicated planner curates a tailored proposal
                  with transparent pricing — back to you within 24 hours.
                </p>
    
              </div>
    
    
              {/* =========================================
            PLANNER CONTENT
        ========================================= */}
    
              <PlannerForm />
    
            </div>
          </section>
  );
}
