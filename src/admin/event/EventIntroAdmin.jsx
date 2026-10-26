import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Eye, Pencil, Plus, RefreshCw, Save } from "lucide-react";
import {
  createEventManagementIntro,
  fetchEventManagementBanner,
  getEventManagementBannerUrl,
  getEventManagementIntro,
  listEventManagementIntros,
  updateEventManagementIntro,
} from "../../services/eventManagementIntroService";
import { F, Section } from "../ui";

function EventBannerPreview({ imageUrl, alt, className }) {
  const [source, setSource] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!imageUrl) {
      setSource("");
      setError("");
      return undefined;
    }

    let active = true;
    let objectUrl;
    setSource("");
    setError("");
    fetchEventManagementBanner(imageUrl)
      .then((url) => {
        objectUrl = url;
        if (active) setSource(url);
        else URL.revokeObjectURL(url);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "The banner image could not be loaded.");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageUrl]);

  if (error) {
    return <div className={`adm-event-intro-no-image ${className || ""}`} role="status">{error}</div>;
  }
  if (!source) {
    return <div className={`adm-event-intro-no-image ${className || ""}`}>Loading image...</div>;
  }
  return <img className={className} src={source} alt={alt} />;
}

const EMPTY_FORM = {
  eyebrow: "",
  heading: "",
  leadParagraph: "",
  status: "ACTIVE",
};

function getIntroForm(intro) {
  return {
    eyebrow: intro.eyebrow || "",
    heading: intro.heading || "",
    leadParagraph: intro.leadParagraph || "",
    status: intro.status ?? "",
  };
}

export default function EventIntroAdmin() {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null);
  const [draft, setDraft] = useState(EMPTY_FORM);
  const [bannerImage, setBannerImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPage = useCallback(async (pageNumber) => {
    setLoading(true);
    setError("");
    try {
      setResult(await listEventManagementIntros(pageNumber, 10));
    } catch (requestError) {
      setError(requestError.message || "Could not load event management intros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(page);
  }, [loadPage, page]);

  useEffect(() => {
    if (!bannerImage) {
      setImagePreview("");
      return undefined;
    }
    const previewUrl = URL.createObjectURL(bannerImage);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [bannerImage]);

  const beginCreate = () => {
    setError("");
    setNotice("");
    setBannerImage(null);
    setDraft(EMPTY_FORM);
    setEditor({ mode: "create" });
  };

  const beginEdit = async (id) => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const intro = await getEventManagementIntro(id);
      setBannerImage(null);
      setDraft(getIntroForm(intro));
      setEditor({ mode: "edit", id, imageUrl: getEventManagementBannerUrl(intro.bannerImageUrl) });
    } catch (requestError) {
      setError(requestError.message || "Could not load the selected intro.");
    } finally {
      setLoading(false);
    }
  };

  const viewIntro = async (id) => {
    setError("");
    setDetail(null);
    setDetailLoading(true);
    try {
      setDetail(await getEventManagementIntro(id));
    } catch (requestError) {
      setError(requestError.message || "Could not load the selected intro.");
    } finally {
      setDetailLoading(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      let savedIntro;
      if (editor.mode === "create") {
        savedIntro = await createEventManagementIntro(draft, bannerImage);
      } else {
        savedIntro = await updateEventManagementIntro(editor.id, draft, bannerImage);
      }
      if (savedIntro?.id == null) {
        throw new Error("The server accepted the save but did not return an intro ID to verify persistence.");
      }
      const persistedIntro = await getEventManagementIntro(savedIntro.id);
      if (String(persistedIntro?.id) !== String(savedIntro.id)) {
        throw new Error("The saved intro could not be confirmed by the server.");
      }
      setNotice(`Event management intro ${editor.mode === "create" ? "created" : "updated"} and confirmed.`);
      setEditor(null);
      setBannerImage(null);
      const nextPage = editor.mode === "create" ? 0 : page;
      setPage(nextPage);
      await loadPage(nextPage);
    } catch (requestError) {
      setError(requestError.message || "Could not save the event management intro.");
    } finally {
      setSaving(false);
    }
  };

  const records = result?.content || [];
  const pageCount = result?.totalPages || 0;

  return (
    <Section
      title="Event management intro"
      sub="Manage the intro content stored by the admin service."
      right={!editor && (
        <button className="adm-btn sm" type="button" onClick={beginCreate}>
          <Plus size={16} /> Create intro
        </button>
      )}
    >
      {error && <p className="adm-form-message error" role="alert">{error}</p>}
      {notice && <p className="adm-form-message success" role="status">{notice}</p>}

      {editor ? (
        <form onSubmit={submit} className="adm-event-intro-form">
          <div className="adm-event-intro-fields">
            <F label="Eyebrow">
              <input value={draft.eyebrow} onChange={(event) => setDraft({ ...draft, eyebrow: event.target.value })} />
            </F>
            <F label="Heading">
              <input value={draft.heading} onChange={(event) => setDraft({ ...draft, heading: event.target.value })} required />
            </F>
            <F label="Lead paragraph">
              <textarea
                rows={4}
                value={draft.leadParagraph}
                onChange={(event) => setDraft({ ...draft, leadParagraph: event.target.value })}
                required
              />
            </F>
            <F label="Status">
              <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
                <option value="">—</option>
                {draft.status && !["ACTIVE", "INACTIVE"].includes(draft.status) && (
                  <option value={draft.status}>{draft.status}</option>
                )}
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </F>
            <F label={`Banner image${editor.mode === "edit" ? " (optional)" : ""}`}>
              {imagePreview || editor.imageUrl ? (
                imagePreview
                  ? <img className="adm-event-intro-image" src={imagePreview} alt="Banner preview" />
                  : <EventBannerPreview
                    className="adm-event-intro-image"
                    imageUrl={editor.imageUrl}
                    alt="Banner preview"
                  />
              ) : null}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setBannerImage(event.target.files?.[0] || null)}
                required={editor.mode === "create"}
              />
            </F>
          </div>
          <div className="adm-event-intro-actions">
            <button className="adm-btn ghost sm" type="button" onClick={() => setEditor(null)} disabled={saving}>
              Cancel
            </button>
            <button className="adm-btn sm" type="submit" disabled={saving}>
              <Save size={16} /> {saving ? "Saving..." : editor.mode === "create" ? "Create intro" : "Save changes"}
            </button>
          </div>
        </form>
      ) : detailLoading ? (
        <p className="adm-hint" role="status">Loading intro details...</p>
      ) : detail ? (
        <div className="adm-event-intro-detail">
          <button className="adm-btn ghost sm" type="button" onClick={() => setDetail(null)}>
            <ArrowLeft size={16} /> Back to list
          </button>
          <h4>{detail.heading || "Event management intro"}</h4>
          {detail.bannerImageUrl && (
            <EventBannerPreview
              className="adm-event-intro-image"
              imageUrl={detail.bannerImageUrl}
              alt="Event management banner"
            />
          )}
          <dl>
            <dt>ID</dt><dd>{detail.id}</dd>
            <dt>Eyebrow</dt><dd>{detail.eyebrow || "—"}</dd>
            <dt>Lead paragraph</dt><dd>{detail.leadParagraph || "—"}</dd>
            <dt>Status</dt><dd>{detail.status || "—"}</dd>
            <dt>Created by</dt><dd>{detail.createdById ?? "—"}</dd>
            <dt>Updated by</dt><dd>{detail.updatedById ?? "—"}</dd>
            <dt>Created</dt><dd>{detail.createdDate || "—"}</dd>
            <dt>Updated</dt><dd>{detail.updatedDate || "—"}</dd>
          </dl>
          <button className="adm-btn sm" type="button" onClick={() => {
            setDetail(null);
            beginEdit(detail.id);
          }}>
            <Pencil size={16} /> Edit intro
          </button>
        </div>
      ) : (
        <>
          <div className="adm-event-intro-toolbar">
            <p className="adm-hint">{result ? `${result.totalElements || 0} intro record(s)` : "Loading intro records..."}</p>
            <button className="adm-btn ghost sm" type="button" onClick={() => loadPage(page)} disabled={loading}>
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
          {loading ? <p className="adm-hint">Loading event management intros...</p> : result && !error && records.length === 0 ? (
            <p className="adm-hint">No intro records yet. Create one to get started.</p>
          ) : (
            <div className="adm-event-intro-list">
              {records.map((intro) => (
                <article className="adm-event-intro-row" key={intro.id}>
                  {intro.bannerImageUrl
                    ? <EventBannerPreview
                      className="adm-event-intro-list-image"
                      imageUrl={intro.bannerImageUrl}
                      alt=""
                    />
                    : <div className="adm-event-intro-no-image">No image</div>}
                  <div className="adm-event-intro-copy">
                    <span className="adm-hint">#{intro.id} · {intro.status || "No status"} · Created {intro.createdDate || "—"}</span>
                    <p className="adm-event-intro-eyebrow">{intro.eyebrow || "—"}</p>
                    <h4>{intro.heading || "Untitled intro"}</h4>
                    <p>{intro.leadParagraph || "No lead paragraph"}</p>
                  </div>
                  <div className="adm-event-intro-actions">
                    <button className="adm-btn ghost sm" type="button" onClick={() => viewIntro(intro.id)}>
                      <Eye size={15} /> View
                    </button>
                    <button className="adm-btn ghost sm" type="button" onClick={() => beginEdit(intro.id)}>
                      <Pencil size={15} /> Edit
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          {pageCount > 1 && (
            <div className="adm-event-intro-pagination">
              <button className="adm-btn ghost sm" type="button" onClick={() => setPage(page - 1)} disabled={loading || page <= 0}>Previous</button>
              <span className="adm-hint">Page {page + 1} of {pageCount}</span>
              <button className="adm-btn ghost sm" type="button" onClick={() => setPage(page + 1)} disabled={loading || page + 1 >= pageCount}>Next</button>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
