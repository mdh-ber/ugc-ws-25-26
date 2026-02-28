import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  getCampaignById,
  createCampaign,
  updateCampaign,
} from "../services/campaignService";

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "X"];

// ✅ Auto-generate UTM when missing (for old campaigns)
function generateUtm(name, id) {
  const base = String(name || "campaign")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const suffix = id
    ? String(id).slice(-6)
    : Math.random().toString(36).slice(2, 8);

  return `${base}_${suffix}`.toLowerCase();
}

function CampaignForm() {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const location = useLocation();
  const withQuery = (path) => `${path}${location.search || ""}`;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    platform: "Instagram",
    targetAudience: "",
    goals: "",
    budget: "",
    spent: "",
    startDate: "",
    endDate: "",
    assignedCreators: "", // comma separated
    utmCampaign: "",
  });

  const title = useMemo(
    () => (isEdit ? "Edit Campaign" : "Create Campaign"),
    [isEdit]
  );

  const setField = (key) => (e) => {
    const val = e.target.value;
    setErr(""); // ✅ clear error when user edits
    setForm((p) => ({ ...p, [key]: val }));
  };

  const toInputDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      try {
        setErr("");
        setLoading(true);
        const c = await getCampaignById(id);

        setForm({
          name: c?.name || "",
          description: c?.description || "",
          platform: c?.platform || "Instagram",
          targetAudience: c?.targetAudience || "",
          goals: c?.goals || "",
          budget: c?.budget ?? "",
          spent: c?.spent ?? "",
          startDate: toInputDate(c?.startDate),
          endDate: toInputDate(c?.endDate),
          assignedCreators: Array.isArray(c?.assignedCreators)
            ? c.assignedCreators.join(", ")
            : c?.assignedCreators || "",
          // ✅ if old campaign has no utmCampaign, keep blank in UI (we generate on submit)
          utmCampaign: c?.utmCampaign || "",
        });
      } catch (e) {
        setErr(
          e?.response?.data?.message || e.message || "Failed to load campaign"
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!form.name.trim()) return setErr("Name is required");
    if (!form.startDate) return setErr("Start date is required");
    if (!form.endDate) return setErr("End date is required");

    // ✅ DO NOT block update if utm is empty — generate it
    const utm = form.utmCampaign.trim()
      ? form.utmCampaign.trim().toLowerCase()
      : generateUtm(form.name, id);

    try {
      setErr("");
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        platform: form.platform,
        targetAudience: form.targetAudience.trim(),
        goals: form.goals.trim(),
        budget: Number(form.budget || 0),
        spent: Number(form.spent || 0),

        // backend expects date, you can send ISO safely
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),

        assignedCreators: form.assignedCreators
          ? form.assignedCreators
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],

        utmCampaign: utm,
      };

      if (isEdit) {
        await updateCampaign(id, payload);
      } else {
        await createCampaign(payload);
      }

      navigate(withQuery("/campaigns"));
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Fill campaign details. UTM is auto-generated if left blank.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(withQuery("/campaigns"))}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200"
        >
          ← Back
        </button>
      </div>

      {err ? (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {err}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Name *" hint="Example: Summer UGC Campaign">
            <input
              className="input"
              value={form.name}
              onChange={setField("name")}
              placeholder="Campaign name"
            />
          </Field>

          <Field label="Platform" hint="Choose where the content will be posted">
            <select
              className="input"
              value={form.platform}
              onChange={setField("platform")}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="UTM Campaign"
            hint="Optional. If empty, system generates: name_suffix"
          >
            <input
              className="input"
              value={form.utmCampaign}
              onChange={setField("utmCampaign")}
              placeholder="e.g. summer_sale_2026"
            />
          </Field>

          <Field label="Target Audience" hint="Who are we targeting?">
            <input
              className="input"
              value={form.targetAudience}
              onChange={setField("targetAudience")}
              placeholder="e.g. College students"
            />
          </Field>

          <Field label="Goals" hint="What is the purpose of this campaign?">
            <input
              className="input"
              value={form.goals}
              onChange={setField("goals")}
              placeholder="e.g. Brand awareness, Leads"
            />
          </Field>

          <Field
            label="Assigned Creators"
            hint="Comma separated: Creator1, Creator2"
          >
            <input
              className="input"
              value={form.assignedCreators}
              onChange={setField("assignedCreators")}
              placeholder="Creator1, Creator2"
            />
          </Field>

          <Field label="Budget" hint="Total planned budget">
            <input
              className="input"
              type="number"
              value={form.budget}
              onChange={setField("budget")}
              placeholder="0"
              min="0"
            />
          </Field>

          <Field label="Spent" hint="Actual spent amount (can update later)">
            <input
              className="input"
              type="number"
              value={form.spent}
              onChange={setField("spent")}
              placeholder="0"
              min="0"
            />
          </Field>

          <Field label="Start Date *">
            <input
              className="input"
              type="date"
              value={form.startDate}
              onChange={setField("startDate")}
            />
          </Field>

          <Field label="End Date *">
            <input
              className="input"
              type="date"
              value={form.endDate}
              onChange={setField("endDate")}
            />
          </Field>

          <Field label="Description" full hint="Short summary shown to team">
            <textarea
              className="input min-h-[110px]"
              value={form.description}
              onChange={setField("description")}
              placeholder="Short campaign description..."
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3 mt-8">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 shadow-sm"
          >
            {saving ? "Saving..." : isEdit ? "Update Campaign" : "Create Campaign"}
          </button>

          <button
            type="button"
            onClick={() => navigate(withQuery("/campaigns"))}
            className="px-5 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.7rem 0.85rem;
          outline: none;
          background: #fff;
          transition: box-shadow 120ms ease, border-color 120ms ease;
        }
        .input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.14);
        }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-semibold text-gray-800 mb-1">
        {label}
      </label>
      {hint ? <div className="text-xs text-gray-500 mb-2">{hint}</div> : null}
      {children}
    </div>
  );
}

export default CampaignForm;