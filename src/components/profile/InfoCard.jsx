// ✅ InfoCard.jsx
import React from "react";

export default function InfoCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      {title && <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>}
      <div className="space-y-2">{children}</div>
    </div>
  );
}