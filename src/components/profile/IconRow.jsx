// ✅ IconRow.jsx
import React from "react";

export default function IconRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="text-xl text-gray-500 mt-1">
          <Icon />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm text-gray-500 leading-tight">{label}</p>
        <p className="font-medium text-gray-800 text-base leading-snug break-words">
          {value}
        </p>
      </div>
    </div>
  );
}