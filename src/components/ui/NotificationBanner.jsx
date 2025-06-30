// src/components/ui/NotificationBanner.jsx
import { useEffect, useRef } from "react";

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

export default function NotificationBanner({ message, type = "success", onClose }) {
  const bgColor = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  }[type];

  const bannerRef = useRef();

  useEffect(() => {
    injectKeyframes();

    const handleClickOutside = (event) => {
      if (bannerRef.current && !bannerRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={bannerRef}
      className={`fade-in-up fixed top-6 left-4 right-4 z-50 border px-4 py-3 rounded-xl shadow-md bg-white/80 backdrop-blur-sm transition-all duration-300 ease-in-out ${bgColor}`}
    >
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="leading-snug">{message}</span>
        <button
          onClick={onClose}
          className="text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}