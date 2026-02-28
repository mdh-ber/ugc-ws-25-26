import api from "./api";

const REPORT_TYPES = ["leads", "campaigns", "referrals", "visits"];

/**
 * Download a report as CSV — triggers browser file save.
 */
export const downloadCsv = async (type) => {
    const res = await api.get(`/reports/${type}?format=csv`, {
        responseType: "blob",
    });

    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_report.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Download a report as JSON — triggers browser file save.
 */
export const downloadJson = async (type) => {
    const res = await api.get(`/reports/${type}`);

    const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_report.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
};

export { REPORT_TYPES };
