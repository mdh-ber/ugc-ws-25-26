import React from "react";

export default function CertificateCard({ certificate, onView }) {
  if (!certificate) return null;

  const title = certificate.title || "Untitled";
  const issuer = certificate.issuer || "MDH University";
  const domain = certificate.domain || "General";
  const certType = certificate.certType || "Participation";
  const income = Number(certificate.incomeMade || 0);

  return (
    <div className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
          {certType}
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-1">
        Issuer: <span className="font-medium text-gray-700">{issuer}</span>
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Domain: <span className="font-medium text-gray-700">{domain}</span>
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Issued:{" "}
        <span className="font-medium text-gray-700">
          {certificate.issueDate ? new Date(certificate.issueDate).toDateString() : "—"}
        </span>
      </p>

      <p className="mt-2 font-medium text-green-600">Income: €{income}</p>

      <button
        onClick={() => onView?.(certificate)}
        className="mt-3 text-blue-600 text-sm hover:underline"
      >
        View Details
      </button>
    </div>
  );
}