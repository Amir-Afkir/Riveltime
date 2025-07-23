import React, { forwardRef, useImperativeHandle, useRef, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

const Modal = forwardRef(({ open, onClose, children }, ref) => {
  const [exiting, setExiting] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  const ANIMATION_DURATION = 300; // ms
  const modalRef = useRef(null);

  useImperativeHandle(ref, () => ({
    startExit: () => {
      if (!exiting) setExiting(true);
    },
  }));

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setExiting(false);
      document.body.style.overflow = "hidden";
    } else if (!open && shouldRender) {
      setExiting(true);
    }
  }, [open, shouldRender]);

  const onAnimationEnd = useCallback((e) => {
    if (exiting && e.target === modalRef.current) {
      setShouldRender(false);
      setExiting(false);
      document.body.style.overflow = "";
      onClose();
    }
  }, [exiting, onClose]);

  const handleBackdropClick = () => {
    setExiting(true);
  };

  if (!shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-2xl shadow-lg max-w-xl max-h-[80vh] overflow-auto w-full mx-4 relative ${
          exiting ? "animate-slide-up-exit" : "animate-expand-card"
        }`}
        style={{ animationDuration: `${ANIMATION_DURATION}ms` }}
        onAnimationEnd={onAnimationEnd}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
});

export default Modal;