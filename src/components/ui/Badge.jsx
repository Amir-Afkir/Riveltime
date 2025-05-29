// src/components/ui/Badge.jsx
export default function Badge({ children, color = "blue" }) {
  const bgColor = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    orange: "bg-orange-100 text-orange-800",
    gray: "bg-gray-100 text-gray-800",
  }[color] || "bg-gray-100 text-gray-800";

  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${bgColor}`}>
      {children}
    </span>
  );
}
