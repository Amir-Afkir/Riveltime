// src/components/ui/Section.jsx
export default function Section({ title, children, className = "" }) {
  return (
    <section className={`bg-white rounded shadow p-4 mb-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      {children}
    </section>
  );
}

