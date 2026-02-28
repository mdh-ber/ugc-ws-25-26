const Campaign = require("../models/Campaign");
const MarketingMetric = require("../models/MarketingMetric");
const Lead = require("../models/Lead");
const Conversion = require("../models/Conversion");
const Analytics = require("../models/Analytics");
const converter = require("json-2-csv");
const ExcelJS = require("exceljs");

/* -------------------------------------------------------------------------- */
/* handlers                                                                    */
/* -------------------------------------------------------------------------- */

async function downloadReportCSV(req, res) {
  try {
    const { startDate, endDate, reportType = "marketing", fields } = req.query;

    let filters = {};
    if (req.query.filters) {
      try {
        filters = JSON.parse(req.query.filters);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid filters JSON format",
        });
      }
    }

    const reportData = await fetchReportData({
      startDate,
      endDate,
      reportType,
      filters,
    });

    if (!reportData || reportData.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No data found for the given parameters",
      });
    }

    const csvFields = getReportFields(reportType, fields);

    const plainData = reportData.map((doc) =>
      doc.toObject ? doc.toObject() : doc,
    );

    const csv = await converter.json2csv(plainData, {
      keys: csvFields,
      delimiter: { field: "," },
      excelBOM: true,
      emptyFieldValue: "",
      prependHeader: true,
      trimHeaderFields: true,
      trimFieldValues: true,
    });

    const filename = `${reportType}_report_${Date.now()}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");

    res.status(200).send(csv);
  } catch (error) {
    console.error("Error generating CSV report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
}

async function downloadRawData(req, res) {
  try {
    const {
      startDate,
      endDate,
      dataType,
      format = "json",
      limit = 10000,
      offset = 0,
      sortBy,
      sortOrder = "DESC",
    } = req.query;

    const rawData = await fetchRawData({
      startDate,
      endDate,
      dataType,
      limit: parseInt(limit),
      offset: parseInt(offset),
      sortBy,
      sortOrder,
    });

    const totalCount = await getRawDataCount({
      startDate,
      endDate,
      dataType,
    });

    const response = {
      success: true,
      data: rawData,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        returned: rawData.length,
      },
      generatedAt: new Date().toISOString(),
    };

    if (format === "file") {
      const filename = `raw_data_${dataType}_${Date.now()}.json`;
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      return res.status(200).send(JSON.stringify(response, null, 2));
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching raw data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch raw data",
      error: error.message,
    });
  }
}

async function generateReport(req, res) {
  try {
    const {
      format = "csv",
      reportType = "marketing",
      startDate,
      endDate,
      aggregation,
    } = req.body;

    let data;
    switch (reportType) {
      case "marketing":
        data = await getMarketingData(startDate, endDate, aggregation);
        break;
      case "campaign":
        data = await getCampaignData(startDate, endDate);
        break;
      case "analytics":
        data = await getAnalyticsData(startDate, endDate);
        break;
      default:
        data = await getDefaultReportData(startDate, endDate);
    }

    const plainData = data.map((doc) => (doc.toObject ? doc.toObject() : doc));

    let fileBuffer;
    let contentType;
    let filename;

    switch (format.toLowerCase()) {
      case "csv": {
        const csv = await converter.json2csv(plainData, {
          delimiter: { field: "," },
          excelBOM: true,
          emptyFieldValue: "",
          prependHeader: true,
        });
        fileBuffer = Buffer.from(csv);
        contentType = "text/csv";
        filename = `${reportType}_report_${Date.now()}.csv`;
        break;
      }

      case "excel":
      case "xlsx":
        fileBuffer = await generateExcelReport(plainData, reportType);
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        filename = `${reportType}_report_${Date.now()}.xlsx`;
        break;

      case "json":
      default:
        fileBuffer = Buffer.from(JSON.stringify(plainData, null, 2));
        contentType = "application/json";
        filename = `${reportType}_report_${Date.now()}.json`;
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", fileBuffer.length);
    res.status(200).send(fileBuffer);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* helpers                                                                     */
/* -------------------------------------------------------------------------- */

async function generateExcelReport(data, reportType) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Marketing System";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(`${reportType} Report`);

  if (data && data.length > 0) {
    const headers = Object.keys(data[0]).filter(
      (key) => !["_id", "__v"].includes(key),
    );

    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    data.forEach((item) => {
      const row = headers.map((key) => {
        const val = item[key];
        if (val instanceof Date) return val.toISOString();
        if (typeof val === "object" && val !== null) return JSON.stringify(val);
        return val;
      });
      worksheet.addRow(row);
    });

    worksheet.columns.forEach((column) => {
      column.width = 18;
    });
  }

  return await workbook.xlsx.writeBuffer();
}

async function getMarketingData(startDate, endDate, aggregation) {
  const query = buildDateQuery(startDate, endDate, "createdAt");

  if (aggregation === "daily") {
    return await MarketingMetric.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          date: { $first: "$createdAt" },
          totalImpressions: { $sum: "$impressions" },
          totalClicks: { $sum: "$clicks" },
          totalConversions: { $sum: "$conversions" },
          totalRevenue: { $sum: "$revenue" },
          totalSpend: { $sum: "$spend" },
        },
      },
      { $sort: { date: -1 } },
    ]);
  }

  return await MarketingMetric.find(query)
    .populate("campaignId", "name type status")
    .sort({ createdAt: -1 });
}

async function getCampaignData(startDate, endDate) {
  const query = buildDateQuery(startDate, endDate, "createdAt");
  return await Campaign.find(query)
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });
}

async function getAnalyticsData(startDate, endDate) {
  const query = buildDateQuery(startDate, endDate, "date");
  return await Analytics.find(query).sort({ date: -1 });
}

async function getDefaultReportData(startDate, endDate) {
  const query = buildDateQuery(startDate, endDate, "createdAt");
  return await MarketingMetric.find(query).limit(1000).sort({ createdAt: -1 });
}

function getReportFields(reportType, requestedFields) {
  if (requestedFields) {
    return requestedFields.split(",").map((f) => f.trim());
  }

  const fieldMappings = {
    marketing: [
      "campaignName",
      "impressions",
      "clicks",
      "ctr",
      "conversions",
      "conversionRate",
      "spend",
      "revenue",
      "roi",
      "createdAt",
    ],
    campaign: [
      "name",
      "type",
      "status",
      "budget",
      "spent",
      "startDate",
      "endDate",
      "targetAudience",
    ],
    analytics: [
      "date",
      "pageViews",
      "uniqueVisitors",
      "bounceRate",
      "avgSessionDuration",
      "goalCompletions",
    ],
  };

  return fieldMappings[reportType] || fieldMappings.marketing;
}

async function fetchRawData(params) {
  const { startDate, endDate, dataType, limit, offset, sortBy, sortOrder } =
    params;

  const query = buildDateQuery(startDate, endDate, "createdAt");

  const sortOptions = sortBy
    ? { [sortBy]: sortOrder === "DESC" ? -1 : 1 }
    : { createdAt: -1 };

  const model = resolveModel(dataType);

  return await model
    .find(query)
    .sort(sortOptions)
    .skip(offset)
    .limit(limit)
    .lean();
}

async function getRawDataCount(params) {
  const { startDate, endDate, dataType } = params;
  const query = buildDateQuery(startDate, endDate, "createdAt");
  return await resolveModel(dataType).countDocuments(query);
}

async function fetchReportData(params) {
  const { startDate, endDate, reportType, filters } = params;
  let query = buildDateQuery(startDate, endDate, "createdAt");

  if (filters && Object.keys(filters).length > 0) {
    query = { ...query, ...filters };
  }

  switch (reportType) {
    case "marketing":
      return await MarketingMetric.find(query)
        .populate("campaignId", "name type")
        .lean();

    case "campaign":
      return await Campaign.find(query)
        .populate("createdBy", "username email")
        .lean();

    case "analytics": {
      const aQuery = buildDateQuery(startDate, endDate, "date");
      return await Analytics.find(aQuery).lean();
    }

    default:
      return await MarketingMetric.find(query).limit(1000).lean();
  }
}

function resolveModel(dataType) {
  switch (dataType) {
    case "campaigns":
      return Campaign;
    case "leads":
      return Lead;
    case "conversions":
      return Conversion;
    case "analytics":
      return Analytics;
    default:
      return MarketingMetric;
  }
}

function buildDateQuery(start, end, field) {
  const q = {};
  if (start && end) {
    q[field] = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }
  return q;
}

/* -------------------------------------------------------------------------- */
/* exports                                                                     */
/* -------------------------------------------------------------------------- */

module.exports = {
  downloadReportCSV,
  downloadRawData,
  generateReport,
  // (export helpers if you need them elsewhere)
  fetchReportData,
  fetchRawData,
  getRawDataCount,
  getMarketingData,
  getCampaignData,
  getAnalyticsData,
  getDefaultReportData,
  getReportFields,
  generateExcelReport,
};
