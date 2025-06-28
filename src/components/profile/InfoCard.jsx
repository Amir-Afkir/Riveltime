import React, { useEffect } from "react";

// ✅ Injecte les keyframes dans le <head> une seule fois
const injectKeyframes = () => {
  if (document.getElementById("fade-in-up-style")) return;

  const style = document.createElement("style");
  style.id = "fade-in-up-style";
  style.innerHTML = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-in-up {
      animation: fadeInUp 0.4s ease-out both;
    }
  `;
  document.head.appendChild(style);
};

export default function InfoCard({ title, children, action, icon }) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <div className="fade-in-up rounded-2xl bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 p-4 mb-5 transition-all duration-300">
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