// src/components/ui/Card.jsx
export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded shadow p-4 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      {children}
    </div>
  );
}

