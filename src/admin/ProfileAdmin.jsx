import { useState } from "react";
import { loadData, saveDataSections } from "./store";
import { Section, Text, Toast } from "./ui";

function SaveSection({ updates, label, onSave }) {
  return (
    <button className="adm-btn ghost sm" type="button" onClick={() => onSave(updates)}>
      Save {label}
    </button>
  );
}

export default function ProfileAdmin() {
  const [data, setData] = useState(() => loadData());
  const [toast, setToast] = useState("");

  const saveSection = (updates) => {
    setToast(saveDataSections(updates) ? "Section saved" : "Could not save. Browser storage may be full; remove some images and try again.");
    setTimeout(() => setToast(""), 3500);
  };

  const updateGlobal = (field, value) => setData((current) => ({
    ...current,
    global: { ...current.global, [field]: value },
  }));
  return (
    <>
      <div className="adm-between" style={{ marginBottom: 14 }}>
        <p className="adm-hint" style={{ margin: 0 }}>Manage business contact details. Save this section after editing.</p>
      </div>

      <Section title="Business contact details" sub="Used by contact and WhatsApp buttons across the website."
        right={<SaveSection
          updates={[
            { path: "global.whatsapp", value: data.global.whatsapp },
            { path: "global.phone", value: data.global.phone },
          ]}
          label="contact details" onSave={saveSection} />}>
        <div className="adm-grid2">
          <Text label="WhatsApp number (country code + number, no +)" value={data.global.whatsapp}
            onChange={(value) => updateGlobal("whatsapp", value)} />
          <Text label="Display phone" value={data.global.phone}
            onChange={(value) => updateGlobal("phone", value)} />
        </div>
      </Section>

      <Toast text={toast} />
    </>
  );
}
