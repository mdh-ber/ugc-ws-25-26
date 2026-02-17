// src/components/certificates/CertificateCard.jsx

import React from "react";

const CertificateCard = ({ certificate, onView }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 hover:shadow-xl transition">
      <h3 className="text-lg font-semibold mb-2">
        {certificate.title}
      </h3>

      <p className="text-sm text-gray-500">
        Issued: {new Date(certificate.issueDate).toDateString()}
      </p>

      <p className="mt-2 font-medium text-green-600">
        Income: ${certificate.incomeDuringPeriod}
      </p>

      <button
        onClick={() => onView(certificate)}
        className="mt-3 text-blue-600 text-sm hover:underline"
      >
        View Details
      </button>
    </div>
  );
};

export default CertificateCard;
