import { createPortal } from "react-dom";
import { useEffect, useState, useCallback, useRef } from "react";

export default function Modal({ open, onClose, title, children }) {
  const [exiting, setExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  const ANIMATION_DURATION = 300; // ms
  const modalRef = useRef(null);

  // Synchroniser shouldRender à open
  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setExiting(false);
      document.body.style.overflow = "hidden";
    } else if (!open && shouldRender) {
      setExiting(true);
    }
  }, [open, shouldRender]);

  // Ecoute la fin de l'animation de sortie
  const onAnimationEnd = useCallback((e) => {
    if (exiting && e.target === modalRef.current) {
      setShouldRender(false);
      setExiting(false);
      document.body.style.overflow = "";
      onClose();
    }
  }, [exiting, onClose]);

  // Gestion Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape" && !exiting && open) {
      setExiting(true);
    }
  }, [exiting, open]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setExiting(true)}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-lg max-w-xl max-h-[80vh] overflow-auto w-full mx-4 relative ${exiting ? "animate-slide-up-exit" : "animate-expand-card"}`}
        style={{ animationDuration: `${ANIMATION_DURATION}ms` }}
        onAnimationEnd={onAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}