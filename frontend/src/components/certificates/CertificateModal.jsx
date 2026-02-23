import React from "react";

export default function CertificateModal({ certificate, onClose }) {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[520px] max-w-[92vw]">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold">{certificate.title || "Certificate"}</h2>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <p><strong>Issuer:</strong> {certificate.issuer || "MDH University"}</p>
          <p><strong>Domain:</strong> {certificate.domain || "General"}</p>
          <p><strong>Type:</strong> {certificate.certType || "Participation"}</p>

          <p>
            <strong>Issued On:</strong>{" "}
            {certificate.issueDate ? new Date(certificate.issueDate).toDateString() : "—"}
          </p>

          <p className="text-green-600 font-semibold">
            Income Made: €{Number(certificate.incomeMade || 0)}
          </p>

          <p><strong>Description:</strong> {certificate.description || "N/A"}</p>

          {certificate.certificateUrl ? (
            <a
              href={certificate.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline inline-block mt-2"
            >
              Open Certificate URL
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}