import { useEffect, useMemo, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

  // ✅ Base routes from your backend
  const API = useMemo(
    () => ({
      // Visits router
      websiteTotals: "/api/visits/stats",
      websiteTimeline: "/api/visits/timeline",
      trackVisit: "/api/visits/track",

      // If your backend serves this under visits/analytics instead, adjust here
      ugcVisits: "/api/analytics/ugc-visits",

      // Campaign + Creator routers (list endpoints vary; we try a few)
      campaignsList: ["/api/campaign", "/api/campaign/list", "/api/campaign/all"],
      creatorsList: ["/api/creator", "/api/creator/list", "/api/creator/all"],
    }),
    []
  );

  const pad2 = (n) => String(n).padStart(2, "0");
  const toISODate = (d) => d.toISOString().slice(0, 10);
  const clampDate = (iso) => {
    if (!iso) return "";
    if (iso < "2000-01-01") return "2000-01-01";
    if (iso > "2040-12-31") return "2040-12-31";
    return iso;
  };

  const today = useMemo(() => new Date(), []);
  const currentMonthISO = useMemo(() => {
    const y = today.getFullYear();
    const m = pad2(today.getMonth() + 1);
    return `${y}-${m}`;
  }, [today]);

  const MIN_DATE = "2000-01-01";
  const MAX_DATE = "2040-12-31";

  const [totalVisits, setTotalVisits] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  const [allDaily, setAllDaily] = useState([]);
  const [loadingSeries, setLoadingSeries] = useState(false);

  const [monthTotal, setMonthTotal] = useState(currentMonthISO);
  const [monthUnique, setMonthUnique] = useState(currentMonthISO);

  const parseYM = (ym) => {
    const [yStr, mStr] = (ym || "").split("-");
    const y = Number(yStr);
    const m = Number(mStr);
    if (!y || !m) return null;
    return { y, m };
  };

  const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const isSameMonth = (isoDate, ym) => isoDate?.slice(0, 7) === ym;

  const normalizeDailySeries = (data) => {
    const raw = Array.isArray(data)
      ? data
      : Array.isArray(data?.timeline)
      ? data.timeline
      : Array.isArray(data?.series)
      ? data.series
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.items)
      ? data.items
      : [];

    return raw
      .map((it) => {
        const date = it.date || it.day || it.period || null;
        const iso = typeof date === "string" ? date.slice(0, 10) : "";
        if (!iso) return null;

        return {
          dateISO: iso,
          totalVisits: Number(it.totalVisits ?? it.total ?? it.visits ?? 0),
          uniqueVisits: Number(
            it.uniqueVisits ?? it.unique ?? it.uniqueVisitors ?? 0
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));
  };

  const inferDefaultMonths = (daily) => {
    if (!daily.length) return { totalYM: currentMonthISO, uniqueYM: currentMonthISO };
    const lastYM = daily[daily.length - 1].dateISO.slice(0, 7);
    return { totalYM: lastYM, uniqueYM: lastYM };
  };

  const buildMonthSeriesAccum = (daily, ym) => {
    const parsed = parseYM(ym);
    if (!parsed) return [];
    const { y, m } = parsed;

    const monthItems = daily
      .filter((d) => isSameMonth(d.dateISO, ym))
      .sort((a, b) => (a.dateISO < b.dateISO ? -1 : 1));

    if (monthItems.length === 0) return [];

    const firstDateISO = monthItems[0].dateISO;
    const startDay = Number(firstDateISO.slice(8, 10));
    const lastDay = daysInMonth(y, m);

    const map = new Map(monthItems.map((x) => [x.dateISO, x]));

    let runTotal = 0;
    let runUnique = 0;

    const out = [];
    for (let day = startDay; day <= lastDay; day++) {
      const iso = `${y}-${pad2(m)}-${pad2(day)}`;
      const hit = map.get(iso);

      runTotal += hit ? hit.totalVisits : 0;
      runUnique += hit ? hit.uniqueVisits : 0;

      out.push({
        dateISO: iso,
        dayLabel: String(day),
        totalVisits: runTotal,
        uniqueVisits: runUnique,
      });
    }
    return out;
  };

  const availableMonths = useMemo(() => {
    const set = new Set(allDaily.map((d) => d.dateISO.slice(0, 7)));
    return Array.from(set).sort((a, b) => (a < b ? -1 : 1));
  }, [allDaily]);

  const totalSeries = useMemo(
    () => buildMonthSeriesAccum(allDaily, monthTotal),
    [allDaily, monthTotal]
  );

  const uniqueSeries = useMemo(
    () => buildMonthSeriesAccum(allDaily, monthUnique),
    [allDaily, monthUnique]
  );

  // ---------------------------
  // ✅ Attribution from referral links (persisted)
  // ---------------------------
  const ATTR_KEY = "visit_attribution_v1"; // sessionStorage key

  const readAttribution = () => {
    try {
      const raw = sessionStorage.getItem(ATTR_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const writeAttribution = (attr) => {
    try {
      if (!attr) sessionStorage.removeItem(ATTR_KEY);
      else sessionStorage.setItem(ATTR_KEY, JSON.stringify(attr));
    } catch {}
  };

  // Captures from URL query params of CURRENT PAGE (not the pasted input)
  const captureAttributionFromCurrentUrl = () => {
    try {
      const p = new URLSearchParams(window.location.search);
      const campaign =
        (p.get("campaign") || p.get("utm_campaign") || "").trim();
      const creator =
        (p.get("creator") || p.get("utm_source") || "").trim();

      if (campaign || creator) {
        writeAttribution({
          campaign: campaign || null,
          creator: creator || null,
          capturedAt: new Date().toISOString(),
          landingPath: window.location.pathname,
        });
      }
    } catch {}
  };

  // ---------------------------
  // ✅ Visit tracking includes attribution (if exists)
  // ---------------------------
  const trackVisit = async () => {
    const attr = readAttribution();

    try {
      await fetch(API.trackVisit, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          path: window.location.pathname,
          referrer: document.referrer || null,

          // ✅ include attribution but do not require it
          campaign: attr?.campaign ?? null,
          creator: attr?.creator ?? null,
        }),
      });
    } catch {}
  };

  const fetchWebsiteTotalsAndDaily = async () => {
    setLoadingSeries(true);
    try {
      const totalsRes = await fetch(API.websiteTotals, {
        method: "GET",
        headers: authHeaders,
      });

      if (totalsRes.ok) {
        const data = await totalsRes.json();
        setTotalVisits(Number(data.totalVisits ?? data.total ?? data.visits ?? 0));
        setUniqueVisitors(
          Number(data.uniqueVisits ?? data.uniqueVisitors ?? data.unique ?? 0)
        );
      }

      const timelineRes = await fetch(API.websiteTimeline, {
        method: "GET",
        headers: authHeaders,
      });

      if (!timelineRes.ok) {
        setAllDaily([]);
        return;
      }

      const json = await timelineRes.json();
      const normalized = normalizeDailySeries(json);
      setAllDaily(normalized);

      const inferred = inferDefaultMonths(normalized);
      setMonthTotal(inferred.totalYM);
      setMonthUnique(inferred.uniqueYM);
    } catch {
      setAllDaily([]);
    } finally {
      setLoadingSeries(false);
    }
  };

  // ---------------------------
  // ✅ Campaigns + Creators from backend
  // ---------------------------
  const normalizeOptions = (data, kind) => {
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.rows)
      ? data.rows
      : Array.isArray(data?.data)
      ? data.data
      : [];

    // try common field names
    return list
      .map((x) => {
        const id =
          x.id ?? x._id ?? x.campaignId ?? x.creatorId ?? x.slug ?? x.code ?? null;

        const name =
          x.name ??
          x.title ??
          x.username ??
          x.handle ??
          x.displayName ??
          x.campaignName ??
          x.creatorName ??
          null;

        if (!id && !name) return null;
        return {
          id: String(id ?? name),
          name: String(name ?? id),
          kind,
        };
      })
      .filter(Boolean);
  };

  const tryFetchFirstOk = async (urls) => {
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: authHeaders });
        if (!res.ok) continue;
        return await res.json();
      } catch {
        // try next
      }
    }
    return null;
  };

  const [campaignOptions, setCampaignOptions] = useState([
    { id: "campaign_1", name: "Campaign 1" },
    { id: "campaign_2", name: "Campaign 2" },
    { id: "campaign_3", name: "Campaign 3" },
    { id: "campaign_4", name: "Campaign 4" },
  ]);

  const [creatorOptions, setCreatorOptions] = useState([]); // optional dropdown list

  const fetchCampaignsAndCreators = async () => {
    const campaignsJson = await tryFetchFirstOk(API.campaignsList);
    if (campaignsJson) {
      const opts = normalizeOptions(campaignsJson, "campaign");
      if (opts.length) setCampaignOptions(opts);
    }

    const creatorsJson = await tryFetchFirstOk(API.creatorsList);
    if (creatorsJson) {
      const opts = normalizeOptions(creatorsJson, "creator");
      if (opts.length) setCreatorOptions(opts);
    }
  };

  // ---------------------------
  // ✅ UGC table filters
  // ---------------------------
  const [dateFrom, setDateFrom] = useState(
    clampDate(toISODate(new Date(Date.now() - 30 * 86400000)))
  );
  const [dateTo, setDateTo] = useState(clampDate(toISODate(new Date())));
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

    // ✅ capture attribution from CURRENT landing URL (utm/campaign/creator)
    captureAttributionFromCurrentUrl();

    // ✅ tracking includes attribution automatically (if present)
    trackVisit();

    fetchWebsiteTotalsAndDaily();
    fetchCampaignsAndCreators();
    fetchRows({ from: dateFrom, to: dateTo, campaign: "", creator: "" });
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

  const MonthFilter = ({ value, onChange }) => (
    <select
      className="border rounded-lg px-3 py-2 text-sm bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {availableMonths.length === 0 ? (
        <option value={currentMonthISO}>{currentMonthISO}</option>
      ) : (
        availableMonths.map((ym) => (
          <option key={ym} value={ym}>
            {ym}
          </option>
        ))
      )}
    </select>
  );

  const ChartCard = ({ title, data, dataKey, monthValue, onMonthChange }) => (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="text-sm font-semibold">{title}</div>
        <MonthFilter value={monthValue} onChange={onMonthChange} />
      </div>

      <div className="h-64">
        {loadingSeries ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-gray-500">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayLabel" minTickGap={12} />
              <YAxis
                allowDecimals={false}
                tickFormatter={(v) => Number(v).toLocaleString()}
                domain={[0, (max) => Math.max(5, Math.ceil(max / 5) * 5)]}
                tickCount={Math.max(
                  2,
                  Math.ceil((data[data.length - 1]?.[dataKey] || 0) / 5) + 1
                )}
              />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.dateISO || ""}
                formatter={(value, name) => [
                  Number(value || 0).toLocaleString(),
                  name === "totalVisits" ? "Total Visits" : "Unique Visits",
                ]}
              />
              <Line type="linear" dataKey={dataKey} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
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
    const last30 = clampDate(toISODate(new Date(Date.now() - 30 * 86400000)));
    const todayIso = clampDate(toISODate(new Date()));
    setDateFrom(last30);
    setDateTo(todayIso);
    setSelectedCampaign("");
    setSelectedCreator("");
    fetchRows({ from: last30, to: todayIso, campaign: "", creator: "" });
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

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard
          title="Total website visits (cumulative daily)"
          data={totalSeries}
          dataKey="totalVisits"
          monthValue={monthTotal}
          onMonthChange={setMonthTotal}
        />
        <ChartCard
          title="Unique website visits (cumulative daily)"
          data={uniqueSeries}
          dataKey="uniqueVisits"
          monthValue={monthUnique}
          onMonthChange={setMonthUnique}
        />
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
            <div className="text-lg font-semibold mt-1">{refCampaign || "—"}</div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-500">Creator</div>
            <div className="text-lg font-semibold mt-1">{refCreator || "—"}</div>
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

              {/* If you prefer free-text only, keep your old input.
                  This keeps free-text, but offers suggestions when backend list exists */}
              <input
                list="creator-suggestions"
                type="text"
                className="w-full border rounded-lg px-3 py-2"
                placeholder="All creators"
                value={selectedCreator}
                onChange={(e) => setSelectedCreator(e.target.value)}
              />
              <datalist id="creator-suggestions">
                {creatorOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </datalist>
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