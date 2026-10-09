import { useState } from "react";
import { loadData, saveData } from "../store";
import { Section, F, Text, Area, TagsInput, Repeater, Tabs, Toast } from "../ui";

const TABS = [
  { id: "intro",     label: "Intro & banner" },
  { id: "types",     label: "Event types" },
  { id: "options",   label: "Venue & Priorities" },
  { id: "global",    label: "Contact" },
];

export default function EventAdmin() {
  const [tab, setTab] = useState("intro");
  const [data, setData] = useState(() => loadData());
  const [toast, setToast] = useState("");

  const save = () => { saveData(data); setToast("Event data saved"); setTimeout(() => setToast(""), 2200); };
  const patch = (path, value) => setData((d) => ({ ...d, event: { ...d.event, [path]: value } }));

  return (
    <>
      <div className="adm-between" style={{ marginBottom: 14 }}>
        <p className="adm-hint" style={{ margin: 0 }}>Manage the left intro card, event types & form options.</p>
        <button className="adm-btn" onClick={save}>Save event</button>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "intro" && (
        <>
          <Section num="1" title="Left intro card">
            <Text label="Banner image URL (blank = illustrated fallback)" value={data.event.sideImage} onChange={(v) => patch("sideImage", v)} />
            <Text label="Eyebrow" value={data.event.intro.eyebrow} onChange={(v) => patch("intro", { ...data.event.intro, eyebrow: v })} />
            <Text label="Heading" value={data.event.intro.heading} onChange={(v) => patch("intro", { ...data.event.intro, heading: v })} />
            <Area label="Lead paragraph" value={data.event.intro.lead} onChange={(v) => patch("intro", { ...data.event.intro, lead: v })} rows={4} />
          </Section>
        </>
      )}

      {tab === "types" && (
        <Section title="Event types & subtypes" sub="The Type dropdown, and the Subtype dropdown that depends on it.">
          <Repeater
            items={Object.entries(data.event.eventTypes).map(([k, v]) => ({ type: k, subtypes: v }))}
            onChange={(list) => {
              const next = {};
              list.forEach((row) => { if (row.type.trim()) next[row.type.trim()] = row.subtypes; });
              patch("eventTypes", next);
            }}
            itemTitle={(r) => `${r.type || "—"} · ${r.subtypes.length} subtypes`}
            makeNew={() => ({ type: "New Type", subtypes: [] })}
            renderRow={(row, i, upd) => (
              <>
                <Text label="Event type" value={row.type} onChange={(v) => upd({ ...row, type: v })} />
                <TagsInput label="Subtypes"
                  value={row.subtypes}
                  onChange={(v) => upd({ ...row, subtypes: v })}
                  placeholder="Type a subtype and Enter" />
              </>
            )}
          />
        </Section>
      )}

      {tab === "options" && (
        <>
          <Section title="Venue status options">
            <TagsInput label="" value={data.event.venueStatus} onChange={(v) => patch("venueStatus", v)} placeholder="Add an option…" />
          </Section>
          <Section title="Priority chips">
            <TagsInput label="" value={data.event.priorities} onChange={(v) => patch("priorities", v)} placeholder="Add a priority…" />
          </Section>
        </>
      )}

      {tab === "global" && (
        <Section title="Contact">
          <Text label="WhatsApp number (country code + number, no +)" value={data.global.whatsapp}
            onChange={(v) => setData({ ...data, global: { ...data.global, whatsapp: v } })} />
        </Section>
      )}

      <Toast text={toast} />
    </>
  );
}