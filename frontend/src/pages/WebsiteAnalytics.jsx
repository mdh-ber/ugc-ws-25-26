import { useEffect, useMemo, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";

export default function WebsiteAnalytics() {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const isMarketingManager = params.get("mode") === "manager";

  const token = useMemo(
    () => sessionStorage.getItem("token") || localStorage.getItem("token"),
    []
  );

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const API = useMemo(
    () => ({
      websiteTotals: "/api/visits/stats",
      ugcVisits: "/api/analytics/ugc-visits",
      trackVisit: "/api/analytics/track-visit",
    }),
    []
  );

  const toISODate = (d) => d.toISOString().slice(0, 10);
  const clampDate = (iso) => {
    if (!iso) return "";
    if (iso < "2000-01-01") return "2000-01-01";
    if (iso > "2040-12-31") return "2040-12-31";
    return iso;
  };

  const todayISO = useMemo(() => clampDate(toISODate(new Date())), []);
  const last30ISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return clampDate(toISODate(d));
  }, []);

  const MIN_DATE = "2000-01-01";
  const MAX_DATE = "2040-12-31";

  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  const campaignOptions = useMemo(
    () => [
      { id: "campaign_1", name: "Campaign 1" },
      { id: "campaign_2", name: "Campaign 2" },
      { id: "campaign_3", name: "Campaign 3" },
      { id: "campaign_4", name: "Campaign 4" },
    ],
    []
  );

  const [dateFrom, setDateFrom] = useState(last30ISO);
  const [dateTo, setDateTo] = useState(todayISO);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [selectedCreator, setSelectedCreator] = useState("");

  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);

  const [referralUrl, setReferralUrl] = useState("");
  const [refCampaign, setRefCampaign] = useState("");
  const [refCreator, setRefCreator] = useState("");
  const [refError, setRefError] = useState("");

  const parseReferral = (value) => {
    const raw = (value || "").trim();
    if (!raw) {
      setRefCampaign("");
      setRefCreator("");
      setRefError("");
      return;
    }

    try {
      const url = new URL(raw);
      const p = url.searchParams;

      const campaign = (p.get("campaign") || p.get("utm_campaign") || "").trim();
      const creator = (p.get("creator") || p.get("utm_source") || "").trim();

      setRefCampaign(campaign);
      setRefCreator(creator);
      setRefError("");
    } catch {
      setRefCampaign("");
      setRefCreator("");
      setRefError("Invalid URL");
    }
  };

  const getAttribution = () => {
    const p = new URLSearchParams(window.location.search);

    const urlCampaign = p.get("campaign") || p.get("utm_campaign");
    const urlCreator = p.get("creator") || p.get("utm_source");

    const storedRaw = localStorage.getItem("visit_attribution");
    let stored = null;
    try {
      stored = storedRaw ? JSON.parse(storedRaw) : null;
    } catch {
      stored = null;
    }

    const campaign = (urlCampaign ?? stored?.campaign ?? "").trim();
    const creator = (urlCreator ?? stored?.creator ?? "").trim();

    if (campaign || creator) {
      try {
        localStorage.setItem(
          "visit_attribution",
          JSON.stringify({ campaign, creator, ts: Date.now() })
        );
      } catch {}
    }

    return { campaign: campaign || null, creator: creator || null };
  };

  const trackVisit = async () => {
    const { campaign, creator } = getAttribution();
    try {
      await fetch(API.trackVisit, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer || null,
          campaign,
          creator,
        }),
      });
    } catch {}
  };

  const fetchWebsiteTotals = async () => {
    try {
      const res = await fetch(API.websiteTotals, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) return;

      const data = await res.json();

      const total =
        data.totalVisits ?? data.total ?? data.total_visits ?? data.visits ?? 0;

      const unique =
        data.uniqueVisits ??
        data.uniqueVisitors ??
        data.unique ??
        data.unique_visitors ??
        0;

      setTotalVisits(Number(total || 0));
      setUniqueVisitors(Number(unique || 0));
    } catch {}
  };

  const fetchRows = async (opts) => {
    const from = clampDate(opts?.from ?? dateFrom);
    const to = clampDate(opts?.to ?? dateTo);
    const campaign = (opts?.campaign ?? selectedCampaign) || "";
    const creator = (opts?.creator ?? selectedCreator) || "";

    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    if (campaign) qs.set("campaign", campaign);
    if (creator) qs.set("creator", creator);

    setLoadingRows(true);
    try {
      const res = await fetch(`${API.ugcVisits}?${qs.toString()}`, {
        headers: authHeaders,
      });
      if (!res.ok) return setRows([]);
      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.rows)
        ? data.rows
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setRows(
        list.map((r) => ({
          campaignName: String(r.campaignName ?? r.campaignTitle ?? r.campaign ?? "—"),
          creatorName: String(r.creatorName ?? r.creatorUsername ?? r.creator ?? "—"),
          totalVisits: Number(r.totalVisits ?? r.visits ?? r.total ?? 0),
          uniqueVisits: Number(r.uniqueVisits ?? r.unique ?? r.uniqueVisitors ?? 0),
          lastVisit: r.lastVisit ?? r.lastSeen ?? r.updatedAt ?? r.createdAt ?? null,
        }))
      );
    } catch {
      setRows([]);
    } finally {
      setLoadingRows(false);
    }
  };

  useEffect(() => {
    if (!isMarketingManager) return;
    trackVisit();
    fetchWebsiteTotals();
    fetchRows({ from: last30ISO, to: todayISO, campaign: "", creator: "" });
  }, [isMarketingManager]); // eslint-disable-line

  if (!isMarketingManager) {
    return <Navigate to="/dashboard" replace />;
  }

  const Card = ({ title, value }) => (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-4xl font-bold mt-2">
        {Number(value || 0).toLocaleString()}
      </div>
    </div>
  );

  const onApply = () => {
    fetchRows({
      from: dateFrom,
      to: dateTo,
      campaign: selectedCampaign,
      creator: selectedCreator,
    });
  };

  const onReset = () => {
    setDateFrom(last30ISO);
    setDateTo(todayISO);
    setSelectedCampaign("");
    setSelectedCreator("");
    fetchRows({ from: last30ISO, to: todayISO, campaign: "", creator: "" });
  };

  return (
    <div className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">Website Analytics</h2>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Total number of website visits" value={totalVisits} />
        <Card title="Unique number of website visits" value={uniqueVisitors} />
      </div>

      <div className="mt-4 bg-white rounded-xl shadow p-6 border">
        <div className="text-sm font-semibold">Referral Link Parser</div>
        <div className="text-sm text-gray-500 mt-1">
          Paste a referral link to view captured campaign and creator information.
        </div>

        <div className="mt-4">
          <label className="block text-sm text-gray-500 mb-1">Referral URL</label>
          <input
            type="url"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="https://example.com/?campaign=...&creator=..."
            value={referralUrl}
            onChange={(e) => {
              const v = e.target.value;
              setReferralUrl(v);
              parseReferral(v);
            }}
          />
          {refError ? <div className="text-sm text-red-600 mt-2">{refError}</div> : null}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-500">Campaign</div>
            <div className="text-lg font-semibold mt-1">{refCampaign ? refCampaign : "—"}</div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-500">Creator</div>
            <div className="text-lg font-semibold mt-1">{refCreator ? refCreator : "—"}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[160px]">
              <label className="block text-sm text-gray-500 mb-1">From</label>
              <input
                type="date"
                min={MIN_DATE}
                max={MAX_DATE}
                className="w-full border rounded-lg px-3 py-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(clampDate(e.target.value))}
              />
            </div>

            <div className="min-w-[160px]">
              <label className="block text-sm text-gray-500 mb-1">To</label>
              <input
                type="date"
                min={MIN_DATE}
                max={MAX_DATE}
                className="w-full border rounded-lg px-3 py-2"
                value={dateTo}
                onChange={(e) => setDateTo(clampDate(e.target.value))}
              />
            </div>

            <div className="min-w-[220px]">
              <label className="block text-sm text-gray-500 mb-1">Campaign</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
              >
                <option value="">All campaigns</option>
                {campaignOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[220px]">
              <label className="block text-sm text-gray-500 mb-1">Creator</label>
              <input
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="All creators"
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white border border-blue-600"
              onClick={onApply}
            >
              Apply
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-white border"
              onClick={onReset}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border">
          <div className="mb-3">
            <div className="font-semibold">Visits by Campaign</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left">
                  <th className="py-2 px-2 border-b">Campaign</th>
                  <th className="py-2 px-2 border-b">Creator</th>
                  <th className="py-2 px-2 border-b">Total Visits</th>
                  <th className="py-2 px-2 border-b">Unique Visits</th>
                  <th className="py-2 px-2 border-b">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {loadingRows ? (
                  <tr>
                    <td colSpan={5} className="py-3 px-2 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 px-2 text-gray-500">
                      No data yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-2 border-b">{r.campaignName}</td>
                      <td className="py-2 px-2 border-b">{r.creatorName}</td>
                      <td className="py-2 px-2 border-b">
                        {Number(r.totalVisits || 0).toLocaleString()}
                      </td>
                      <td className="py-2 px-2 border-b">
                        {Number(r.uniqueVisits || 0).toLocaleString()}
                      </td>
                      <td className="py-2 px-2 border-b">
                        {r.lastVisit ? new Date(r.lastVisit).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}