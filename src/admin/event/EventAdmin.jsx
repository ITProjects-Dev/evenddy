import { useState } from "react";
import { Tabs } from "../ui";
import EventIntroAdmin from "./EventIntroAdmin";
import EventOptionsAdmin from "./EventOptionsAdmin";

const TABS = [
  { id: "intro",     label: "Intro & banner" },
  { id: "properties", label: "Event properties" },
];

export default function EventAdmin() {
  const [tab, setTab] = useState("intro");

  return (
    <>
      <div className="adm-between" style={{ marginBottom: 14 }}>
        <p className="adm-hint" style={{ margin: 0 }}>Manage the Event Management intro, event types & form options.</p>
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} />

      {tab === "intro" && (
        <EventIntroAdmin />
      )}

      {tab === "properties" && <EventOptionsAdmin />}
    </>
  );
}