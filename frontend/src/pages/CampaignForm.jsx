import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCampaign,
  getCampaignById,
  updateCampaign
} from "../services/campaignService";

const empty = {
  name: "",
  description: "",
  platform: "Instagram",
  targetAudience: "",
  goals: "",
  budget: 0,
  spent: 0,
  startDate: "",
  endDate: "",
  assignedCreatorsText: "" // UI helper, will convert to array
};

export default function CampaignForm() {
  const { id } = useParams(); // exists for edit route
  const isEdit = useMemo(() => !!id, [id]);

  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true);
      try {
        const c = await getCampaignById(id);
        setForm({
          name: c.name || "",
          description: c.description || "",
          platform: c.platform || "Instagram",
          targetAudience: c.targetAudience || "",
          goals: c.goals || "",
          budget: c.budget ?? 0,
          spent: c.spent ?? 0,
          startDate: c.startDate ? c.startDate.slice(0, 10) : "",
          endDate: c.endDate ? c.endDate.slice(0, 10) : "",
          assignedCreatorsText: Array.isArray(c.assignedCreators) ? c.assignedCreators.join(", ") : ""
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isEdit, id]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      platform: form.platform,
      targetAudience: form.targetAudience.trim(),
      goals: form.goals.trim(),
      budget: Number(form.budget || 0),
      spent: Number(form.spent || 0),
      startDate: form.startDate ? new Date(form.startDate) : null,
      endDate: form.endDate ? new Date(form.endDate) : null,
      assignedCreators: form.assignedCreatorsText
        ? form.assignedCreatorsText.split(",").map((s) => s.trim()).filter(Boolean)
        : []
    };

    if (!payload.name) return alert("Campaign name is required");
    if (!payload.startDate || !payload.endDate) return alert("Start/End date required");

    setLoading(true);
    try {
      if (isEdit) {
        await updateCampaign(id, payload);
        alert("Campaign updated");
      } else {
        await createCampaign(payload);
        alert("Campaign created");
      }
      navigate("/campaigns");
    } catch (e2) {
      alert(e2?.response?.data?.message || e2.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h2>{isEdit ? "Edit Campaign" : "Create Campaign"}</h2>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Name *
          <input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </label>

        <label>
          Description
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>

        <label>
          Platform
          <select value={form.platform} onChange={(e) => set("platform", e.target.value)}>
            <option>Instagram</option>
            <option>TikTok</option>
            <option>YouTube</option>
            <option>Facebook</option>
            <option>Google</option>
          </select>
        </label>

        <label>
          Target Audience
          <input value={form.targetAudience} onChange={(e) => set("targetAudience", e.target.value)} />
        </label>

        <label>
          Goals
          <input value={form.goals} onChange={(e) => set("goals", e.target.value)} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Budget
            <input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} />
          </label>

          <label>
            Spent
            <input type="number" value={form.spent} onChange={(e) => set("spent", e.target.value)} />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            Start Date *
            <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </label>

          <label>
            End Date *
            <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </label>
        </div>

        <label>
          Assigned Creators (comma separated)
          <input
            value={form.assignedCreatorsText}
            onChange={(e) => set("assignedCreatorsText", e.target.value)}
            placeholder="Creator1, Creator2"
          />
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading}>
            {isEdit ? "Update" : "Create"}
          </button>
          <button type="button" onClick={() => navigate("/campaigns")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}