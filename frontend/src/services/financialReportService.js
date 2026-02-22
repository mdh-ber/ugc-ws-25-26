import api from "./api";

// Fetch financial report data from backend API
export const getFinancialReport = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.creator) params.append('creator', filters.creator);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.allTime !== undefined) params.append('allTime', filters.allTime);

    const response = await api.get(`/financial-report?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching financial report:', error);
    throw error;
  }
};

// Export financial report as CSV from backend API
export const exportFinancialReportCSV = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.creator) params.append('creator', filters.creator);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.allTime !== undefined) params.append('allTime', filters.allTime);

    const response = await api.get(`/financial-report/export?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create a download link for the CSV file
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'financial-report.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Error exporting financial report:', error);
    throw error;
  }
};