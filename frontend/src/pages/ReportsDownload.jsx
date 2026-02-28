import { useState } from "react";
import {
    FileDown,
    FileJson,
    Users,
    Megaphone,
    UserSearch,
    Globe,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import { downloadCsv, downloadJson } from "../services/reportService";

const REPORTS = [
    {
        key: "leads",
        title: "Leads Report",
        description:
            "All tracked marketing leads across platforms — platform name and click timestamp.",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
    },
    {
        key: "campaigns",
        title: "Campaigns Report",
        description:
            "Campaign details with aggregated ROI metrics — budget, spend, revenue, clicks, and conversions.",
        icon: Megaphone,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-200",
    },
    {
        key: "referrals",
        title: "Referrals Report",
        description:
            "Full referral data — student details, enrollment course, referral date, and reward status.",
        icon: UserSearch,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
    },
    {
        key: "visits",
        title: "Website Visits Report",
        description:
            "Raw website visit logs — timestamps, anonymised IP hashes, and user-agent strings.",
        icon: Globe,
        color: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
    },
];

function ReportsDownload() {
    // per-report loading state  { leads_csv: true, ... }
    const [loading, setLoading] = useState({});
    const [done, setDone] = useState({});

    const handleDownload = async (type, format) => {
        const stateKey = `${type}_${format}`;
        setLoading((prev) => ({ ...prev, [stateKey]: true }));
        setDone((prev) => ({ ...prev, [stateKey]: false }));

        try {
            if (format === "csv") {
                await downloadCsv(type);
            } else {
                await downloadJson(type);
            }
            setDone((prev) => ({ ...prev, [stateKey]: true }));
            setTimeout(() => setDone((prev) => ({ ...prev, [stateKey]: false })), 2000);
        } catch (err) {
            console.error(`Failed to download ${type} ${format}:`, err);
            alert(`Download failed. Please try again.`);
        } finally {
            setLoading((prev) => ({ ...prev, [stateKey]: false }));
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-4">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <FileDown className="text-blue-600" />
                    Reports &amp; Data Export
                </h2>
                <p className="text-gray-500 mt-1">
                    Download reports as CSV (for Excel / Google Sheets) or raw JSON for
                    advanced analysis.
                </p>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {REPORTS.map((r) => {
                    const Icon = r.icon;
                    const csvKey = `${r.key}_csv`;
                    const jsonKey = `${r.key}_json`;

                    return (
                        <div
                            key={r.key}
                            className={`bg-white rounded-xl shadow border ${r.border} p-6 flex flex-col justify-between hover:shadow-lg transition`}
                        >
                            {/* Top */}
                            <div className="flex items-start gap-4 mb-4">
                                <div
                                    className={`${r.bg} ${r.color} p-3 rounded-lg flex-shrink-0`}
                                >
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-800">
                                        {r.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm mt-1">{r.description}</p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 mt-2">
                                <button
                                    id={`download-${r.key}-csv`}
                                    onClick={() => handleDownload(r.key, "csv")}
                                    disabled={loading[csvKey]}
                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-60"
                                >
                                    {loading[csvKey] ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : done[csvKey] ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <FileDown size={16} />
                                    )}
                                    {done[csvKey] ? "Downloaded!" : "Download CSV"}
                                </button>

                                <button
                                    id={`download-${r.key}-json`}
                                    onClick={() => handleDownload(r.key, "json")}
                                    disabled={loading[jsonKey]}
                                    className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg transition disabled:opacity-60"
                                >
                                    {loading[jsonKey] ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : done[jsonKey] ? (
                                        <CheckCircle2 size={16} />
                                    ) : (
                                        <FileJson size={16} />
                                    )}
                                    {done[jsonKey] ? "Downloaded!" : "Download JSON"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Tip Banner */}
            <div className="bg-[#213588] text-white p-6 rounded-xl shadow-md">
                <h3 className="font-bold text-lg mb-1 text-white">Pro Tip</h3>
                <p className="text-sm text-blue-100">
                    Import the CSV files into Google Sheets or Excel to create pivot
                    tables, charts, and custom dashboards for deeper analysis.
                </p>
            </div>
        </div>
    );
}

export default ReportsDownload;
