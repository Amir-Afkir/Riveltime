// ✅ InfoCard.jsx — Version améliorée (design pro et allégé)
import React from "react";

export default function InfoCard({ title, children, action, icon }) {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 p-4 mb-5 transition-all duration-300">
      {(title || action) && (
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl text-gray-500">{icon}</span>}
            {title && <h3 className="text-base font-semibold text-gray-800">{title}</h3>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="space-y-3 text-sm text-gray-700">{children}</div>
    </div>
  );
}