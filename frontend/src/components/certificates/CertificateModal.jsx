// src/components/certificates/CertificateModal.jsx

import React from "react";

const CertificateModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-[500px]">
        <h2 className="text-xl font-bold mb-3">
          {certificate.title}
        </h2>

        <p className="mb-2">
          <strong>Description:</strong>{" "}
          {certificate.description || "N/A"}
        </p>

        <p className="mb-2">
          <strong>Issued On:</strong>{" "}
          {new Date(certificate.issueDate).toDateString()}
        </p>

        <p className="mb-4 text-green-600 font-semibold">
          Total Income During Period: $
          {certificate.incomeDuringPeriod}
        </p>

        {certificate.certificateFileUrl && (
          <a
            href={certificate.certificateFileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download Certificate
          </a>
        )}

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
