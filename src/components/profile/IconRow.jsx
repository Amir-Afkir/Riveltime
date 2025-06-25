// ✅ IconRow.jsx
import React from "react";

export default function IconRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon className="text-xl text-gray-600" />}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}