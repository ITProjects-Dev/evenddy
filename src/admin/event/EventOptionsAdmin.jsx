import { useCallback, useEffect, useState } from "react";
import { LoaderCircle, Plus, RefreshCw, Save } from "lucide-react";
import { addEventManagementPropertyOptions, getEventManagementPropertySections, mapEventManagementPropertySections } from "../../services/eventManagementOptionsService";
import { saveDataSections } from "../store";
import { F, Section } from "../ui";

function splitOptions(value) {
  return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
}

function OptionChips({ values, emptyLabel }) {
  if (!values.length) return <p className="adm-event-options-empty">{emptyLabel}</p>;
  return (
    <div className="adm-event-option-chips">
      {values.map((value) => <span className="adm-event-option-chip" key={value}>{value}</span>)}
    </div>
  );
}

export default function EventOptionsAdmin() {
  const [options, setOptions] = useState({ eventTypes: {}, venueStatus: [], priorities: [] });
  const [newType, setNewType] = useState("");
  const [newSubtypes, setNewSubtypes] = useState("");
  const [subtypeDrafts, setSubtypeDrafts] = useState({});
  const [venueInput, setVenueInput] = useState("");
  const [priorityInput, setPriorityInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sections = await getEventManagementPropertySections();
      const loadedOptions = mapEventManagementPropertySections(sections);
      setOptions(loadedOptions);
      const updates = [
        { path: "event.eventTypes", value: loadedOptions.eventTypes },
        { path: "event.venueStatus", value: loadedOptions.venueStatus },
        { path: "event.priorities", value: loadedOptions.priorities },
      ];
      if (!saveDataSections(updates)) {
        throw new Error("Options loaded, but could not update the local website configuration.");
      }
    } catch (requestError) {
      setError(requestError.message || "Could not load Event Management properties.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  const addType = () => {
    const name = newType.trim();
    if (!name) {
      setError("Enter an event type.");
      return;
    }
    const subtypes = splitOptions(newSubtypes);
    if (!subtypes.length) {
      setError("Add at least one subtype; the backend requires a category for each new event type.");
      return;
    }
    if (Object.keys(options.eventTypes).some((type) => type.toLowerCase() === name.toLowerCase())) {
      setError(`The event type "${name}" already exists.`);
      return;
    }
    setError("");
    setOptions((current) => ({ ...current, eventTypes: { ...current.eventTypes, [name]: subtypes } }));
    setNewType("");
    setNewSubtypes("");
  };

  const addTypeSubtypes = (typeName, values) => {
    const additions = splitOptions(values);
    if (!additions.length) {
      setError("Enter at least one subtype.");
      return;
    }
    setError("");
    setOptions((current) => {
      const currentValues = current.eventTypes[typeName] || [];
      const currentNames = new Set(currentValues.map((value) => value.toLowerCase()));
      const uniqueAdditions = additions.filter((value) => !currentNames.has(value.toLowerCase()));
      return {
        ...current,
        eventTypes: { ...current.eventTypes, [typeName]: [...currentValues, ...uniqueAdditions] },
      };
    });
    setSubtypeDrafts((current) => ({ ...current, [typeName]: "" }));
  };

  const addListValues = (field, values) => {
    const additions = splitOptions(values);
    if (!additions.length) {
      setError("Enter at least one option.");
      return;
    }
    setError("");
    setOptions((current) => ({
      ...current,
      [field]: [...new Map([...current[field], ...additions].map((value) => [value.toLowerCase(), value])).values()],
    }));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const sections = await addEventManagementPropertyOptions(options);
      const savedOptions = mapEventManagementPropertySections(sections);
      setOptions(savedOptions);
      const updated = saveDataSections([
        { path: "event.eventTypes", value: savedOptions.eventTypes },
        { path: "event.venueStatus", value: savedOptions.venueStatus },
        { path: "event.priorities", value: savedOptions.priorities },
      ]);
      if (!updated) throw new Error("Properties were saved, but the website's local options could not be refreshed.");
      setNotice("Event Management properties saved.");
    } catch (requestError) {
      setError(requestError.message || "Could not save Event Management properties.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {error && <p className="adm-form-message error" role="alert">{error}</p>}
      {notice && <p className="adm-form-message success" role="status">{notice}</p>}

      <div className="adm-between adm-event-options-toolbar">
        <p className="adm-hint">Configure the event enquiry form options. Changes are saved to the backend.</p>
        <div className="adm-event-options-toolbar-actions">
          <button className="adm-btn ghost sm" type="button" onClick={loadOptions} disabled={loading || saving}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="adm-btn sm" type="button" onClick={save} disabled={loading || saving}>
            {saving ? <LoaderCircle className="adm-event-options-spin" size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : "Save properties"}
          </button>
        </div>
      </div>

      <Section
        num="1"
        title="Event types and subtypes"
        sub="Each event type is a menu section with its subtypes stored as categories."
      >
        {loading ? <p className="adm-event-options-loading"><LoaderCircle className="adm-event-options-spin" size={17} /> Loading properties from the backend...</p> : (
          <>
            {Object.entries(options.eventTypes).length ? (
              <div className="adm-event-type-list">
                {Object.entries(options.eventTypes).map(([typeName, subtypes]) => (
                  <div className="adm-event-property-row" key={typeName}>
                    <div>
                      <b>{typeName}</b>
                      <p className="adm-hint">{subtypes.length} {subtypes.length === 1 ? "subtype" : "subtypes"}</p>
                    </div>
                    <div className="adm-event-subtype-list">
                      <OptionChips values={subtypes} emptyLabel="No subtypes configured." />
                    </div>
                    <div className="adm-event-type-add">
                      <F label={`Add subtype to ${typeName}`}>
                        <input
                          value={subtypeDrafts[typeName] || ""}
                          aria-label={`Add subtype to ${typeName}`}
                          placeholder="e.g. Destination wedding"
                          onChange={(event) => setSubtypeDrafts((current) => ({ ...current, [typeName]: event.target.value }))}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              addTypeSubtypes(typeName, subtypeDrafts[typeName] || "");
                            }
                          }}
                        />
                      </F>
                      <button className="adm-btn ghost sm" type="button" onClick={() => addTypeSubtypes(typeName, subtypeDrafts[typeName] || "")}>
                        <Plus size={15} /> Add subtype
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="adm-event-options-empty">No event types configured. Add an event type below.</p>
            )}
            <div className="adm-event-property-add">
              <F label="New event type">
                <input value={newType} onChange={(event) => setNewType(event.target.value)} placeholder="e.g. Wedding" />
              </F>
              <F label="Subtypes (required)"><input value={newSubtypes} onChange={(event) => setNewSubtypes(event.target.value)} placeholder="Separate with commas" /></F>
              <button className="adm-btn ghost sm" type="button" onClick={addType}><Plus size={15} /> Add event type</button>
            </div>
          </>
        )}
      </Section>

      <Section num="2" title="Venue status" sub="Options shown to customers when they tell us about their venue.">
        <OptionChips values={options.venueStatus} emptyLabel="No venue statuses configured yet." />
        <div className="adm-event-property-add adm-event-property-add-single">
          <F label="Add venue statuses"><input value={venueInput} onChange={(event) => setVenueInput(event.target.value)} placeholder="e.g. Have a venue, Looking for a venue" /></F>
          <button className="adm-btn ghost sm" type="button" onClick={() => { addListValues("venueStatus", venueInput); setVenueInput(""); }}><Plus size={15} /> Add options</button>
        </div>
      </Section>

      <Section num="3" title="Planning priorities" sub="Selectable priorities on the event enquiry form.">
        <OptionChips values={options.priorities} emptyLabel="No planning priorities configured yet." />
        <div className="adm-event-property-add adm-event-property-add-single">
          <F label="Add priorities"><input value={priorityInput} onChange={(event) => setPriorityInput(event.target.value)} placeholder="e.g. Decor, Food, Budget-friendly" /></F>
          <button className="adm-btn ghost sm" type="button" onClick={() => { addListValues("priorities", priorityInput); setPriorityInput(""); }}><Plus size={15} /> Add options</button>
        </div>
      </Section>

      <p className="adm-event-options-footnote">Empty groups are skipped. Existing backend properties are preserved; this screen currently supports adding options only.</p>

    </>
  );
}
