// ✅ InfoCard.jsx
import React from "react";

export default function InfoCard({ title, children, action }) {
    return (
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        {(title || action) && (
          <>
            <div className="flex justify-between items-center mb-2">
              {title && <h3 className="text-lg font-semibold text-gray-700">{title}</h3>}
              {action && <div>{action}</div>}
            </div>
            {/* ligne de séparation */}
            <div className="border-t border-gray-200 mb-3"></div>
          </>
        )}
        <div className="space-y-2">{children}</div>
      </div>
    );
  }