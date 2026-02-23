import React, { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Area, AreaChart,
  ReferenceLine
} from 'recharts';

// ─── Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  revenue:  '#10b981',
  cost:     '#3b82f6',
  roi:      '#f59e0b',
  clicks:   '#8b5cf6',
  ctr:      '#ec4899',
  grid:     '#e5e7eb',
  text:     '#6b7280',
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 10,
      padding: '10px 16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      fontSize: 13,
    }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: '#111827' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: COLORS.text }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#111827' }}>
            {formatter ? formatter(p.value, p.name) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Format helpers ──────────────────────────────────────────────────────────
const fmtCurrency = (v) => `$${Number(v).toLocaleString()}`;
const fmtPercent  = (v) => `${Number(v).toFixed(2)}%`;
const fmtNumber   = (v) => Number(v).toLocaleString();

// ─── Sub-graphs ──────────────────────────────────────────────────────────────

/** 1. Campaign vs Campaign — grouped bar */
function CampaignCompare({ data }) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
        <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 12 }} />
        <YAxis tickFormatter={fmtCurrency} tick={{ fill: COLORS.text, fontSize: 12 }} />
        <Tooltip content={<CustomTooltip formatter={fmtCurrency} />} />
        <Legend />
        <Bar dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[4,4,0,0]} />
        <Bar dataKey="cost"    name="Cost"    fill={COLORS.cost}    radius={[4,4,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** 2. ROI — area chart showing spend vs return + ROI % line */
function ROIChart({ data }) {
  // Compute ROI % for each point: (revenue - cost) / cost * 100
  const enriched = data.map(d => ({
    ...d,
    roiPct: d.cost > 0 ? +((d.revenue - d.cost) / d.cost * 100).toFixed(1) : 0,
  }));

  return (
    <div>
      <p style={{ fontSize: 12, color: COLORS.text, marginBottom: 8 }}>
        ROI % = (Revenue − Cost) / Cost × 100. Bars show absolute spend vs return; line shows ROI %.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={enriched} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis yAxisId="left"  tickFormatter={fmtCurrency} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip formatter={(v, name) =>
            name === 'ROI %' ? fmtPercent(v) : fmtCurrency(v)
          } />} />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={COLORS.revenue} radius={[4,4,0,0]} />
          <Bar yAxisId="left" dataKey="cost"    name="Cost"    fill={COLORS.cost}    radius={[4,4,0,0]} />
          <Line yAxisId="right" type="monotone" dataKey="roiPct" name="ROI %" stroke={COLORS.roi} strokeWidth={2} dot={{ r: 4 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 3. Time Series — smooth area chart with interval selector */
function TimeSeriesChart({ data, interval, onIntervalChange }) {
  return (
    <div>
      {/* Interval toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['hour', 'day', 'week', 'month', 'year'].map(opt => (
          <button
            key={opt}
            onClick={() => onIntervalChange(opt)}
            style={{
              padding: '4px 14px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              background: interval === opt ? '#111827' : '#f3f4f6',
              color:      interval === opt ? '#fff'    : COLORS.text,
              transition: 'all 0.15s',
            }}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.revenue} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.cost} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.cost} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis tickFormatter={fmtCurrency} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip formatter={fmtCurrency} />} />
          <Legend />
          <Area type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} strokeWidth={2} fill="url(#revGrad)" />
          <Area type="monotone" dataKey="cost"    name="Cost"    stroke={COLORS.cost}    strokeWidth={2} fill="url(#costGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 4. Cost Per Click — line chart, cost & clicks on dual axis */
function CPCChart({ data }) {
  const enriched = data.map(d => ({
    ...d,
    cpc: d.clicks > 0 ? +(d.cost / d.clicks).toFixed(2) : 0,
  }));

  return (
    <div>
      <p style={{ fontSize: 12, color: COLORS.text, marginBottom: 8 }}>
        CPC = Total Cost ÷ Total Clicks (Social Media)
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={enriched} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis yAxisId="left"  tickFormatter={fmtCurrency} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={fmtNumber} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip formatter={(v, name) =>
            name === 'Clicks' ? fmtNumber(v) : fmtCurrency(v)
          } />} />
          <Legend />
          <Line yAxisId="left"  type="monotone" dataKey="cost" name="Cost"      stroke={COLORS.cost}   strokeWidth={2} dot={{ r: 4 }} />
          <Line yAxisId="left"  type="monotone" dataKey="cpc"  name="CPC ($)"   stroke={COLORS.roi}    strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
          <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks"  stroke={COLORS.clicks} strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 5. Click Through Rate — revenue vs cost area + CTR % line */
function CTRChart({ data }) {
  const enriched = data.map(d => ({
    ...d,
    ctr: d.impressions > 0 ? +((d.clicks / d.impressions) * 100).toFixed(2) : 0,
  }));

  return (
    <div>
      <p style={{ fontSize: 12, color: COLORS.text, marginBottom: 8 }}>
        CTR % = Clicks ÷ Impressions × 100 (Website). Bands show Revenue vs Cost; line shows CTR %.
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={enriched} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.revenue} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.revenue} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="costGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={COLORS.cost} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLORS.cost} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis dataKey="label" tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis yAxisId="left"  tickFormatter={fmtCurrency} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={v => `${v}%`} tick={{ fill: COLORS.text, fontSize: 12 }} />
          <Tooltip content={<CustomTooltip formatter={(v, name) =>
            name === 'CTR %' ? fmtPercent(v) : fmtCurrency(v)
          } />} />
          <Legend />
          <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke={COLORS.revenue} strokeWidth={2} fill="url(#revGrad2)" />
          <Area yAxisId="left" type="monotone" dataKey="cost"    name="Cost"    stroke={COLORS.cost}    strokeWidth={2} fill="url(#costGrad2)" />
          <Line yAxisId="right" type="monotone" dataKey="ctr" name="CTR %" stroke={COLORS.ctr} strokeWidth={2} dot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Titles & descriptions ────────────────────────────────────────────────────
const META = {
  compare:    { title: 'Campaign Comparison',              icon: '📊' },
  roi:        { title: 'Spending vs ROI',                  icon: '📈' },
  timeseries: { title: 'Revenue & Cost Over Time',         icon: '🕐' },
  cpc:        { title: 'Cost Per Click',                   icon: '🖱️'  },
  ctr:        { title: 'Click Through Rate',               icon: '🌐' },
};

// ─── Main component ───────────────────────────────────────────────────────────
function FinancialReportGraph({ selectedOption, data, interval, onIntervalChange }) {
  const meta = META[selectedOption] || { title: 'Report', icon: '📉' };

  // Enrich data with clicks/impressions passthrough
  const safeData = (Array.isArray(data) ? data : []).map(d => ({
    label:       String(d.label ?? d._id ?? ''),
    revenue:     Number(d.revenue     ?? d.totalRevenue     ?? 0),
    cost:        Number(d.cost        ?? d.totalCost        ?? 0),
    clicks:      Number(d.clicks      ?? d.totalClicks      ?? 0),
    impressions: Number(d.impressions ?? d.totalImpressions ?? 0),
  }));

  const renderChart = () => {
    if (!safeData.length) {
      return (
        <div style={{
          height: 340,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.text,
          fontSize: 14,
          background: '#f9fafb',
          borderRadius: 12,
        }}>
          No data available for this view.
        </div>
      );
    }

    switch (selectedOption) {
      case 'compare':
        return <CampaignCompare data={safeData} />;
      case 'roi':
        return <ROIChart data={safeData} />;
      case 'timeseries':
        return (
          <TimeSeriesChart
            data={safeData}
            interval={interval || 'month'}
            onIntervalChange={onIntervalChange || (() => {})}
          />
        );
      case 'cpc':
        return <CPCChart data={safeData} />;
      case 'ctr':
        return <CTRChart data={safeData} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: '24px 28px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      marginTop: 24,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>
          {meta.icon} {meta.title}
        </h2>
      </div>

      {renderChart()}
    </div>
  );
}

export default FinancialReportGraph;