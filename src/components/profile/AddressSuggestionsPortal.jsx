import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

export default function AddressSuggestionsPortal({ suggestions, onSelect, inputRef }) {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [inputRef, suggestions]);

  if (!suggestions.length || !position) return null;

  return createPortal(
    <ul
      className="bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto z-[9999]"
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      {suggestions.map((sug) => (
        <li
          key={sug.properties.id}
          className="px-2 py-1 hover:bg-gray-100 cursor-pointer text-sm"
          onClick={() => onSelect(sug.properties.label)}
        >
          {sug.properties.label}
        </li>
      ))}
    </ul>,
    document.body
  );
}