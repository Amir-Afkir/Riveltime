

import React from "react";

export default function BoutiqueCard({ boutique, isSelected, onSelect }) {
  return (
    <button
      className={`min-w-[120px] h-[120px] flex-shrink-0 rounded border flex items-center justify-center text-center ${
        isSelected ? "bg-blue-100 border-blue-500" : "bg-white"
      } shadow hover:shadow-md transition`}
      onClick={onSelect}
    >
      <span className="text-sm font-medium px-2">{boutique.name}</span>
    </button>
  );
}