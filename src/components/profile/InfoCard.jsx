// ✅ InfoCard.jsx — Avec support du delay pour effet cascade
import React, { useEffect } from "react";

const injectKeyframes = () => {
    if (document.getElementById("fade-in-up-style")) return;
  
    const style = document.createElement("style");
    style.id = "fade-in-up-style";
    style.innerHTML = `
      @keyframes fadeInUpSoft {
        0% {
          opacity: 0;
          transform: translateY(24px) scale(0.96);
          filter: blur(4px);
          box-shadow: none;
        }
        60% {
          opacity: 1;
          transform: translateY(-1px) scale(1.01);
          filter: blur(1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
        }
      }
  
      .fade-in-up {
        animation-name: fadeInUpSoft;
        animation-duration: 500ms;
        animation-delay: var(--fade-delay, 0ms);
        animation-timing-function: cubic-bezier(0.24, 0.8, 0.32, 1);
        animation-fill-mode: both;
        will-change: transform, opacity, filter, box-shadow;
      }
    `;
    document.head.appendChild(style);
  };

export default function InfoCard({ title, children, action, icon, delay = 0 }) {
  useEffect(() => {
    injectKeyframes();
  }, []);

  return (
    <div
      className="fade-in-up rounded-2xl bg-white/80 backdrop-blur-sm shadow-md border border-gray-100 p-4 mb-5 transition-all duration-300"
      style={{ '--fade-delay': `${delay}ms` }}
    >
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