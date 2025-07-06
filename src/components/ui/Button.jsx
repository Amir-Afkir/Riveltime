// src/components/ui/Button.jsx
import React from "react";

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {"button"|"submit"|"reset"} [props.type]
 * @param {string} [props.className]
 * @param {boolean} [props.disabled]
 * @param {function} [props.onClick]
 * @param {"primary"|"secondary"} [props.variant]
 */
export default function Button({
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  variant = "primary",
  ...props
}) {
  const primaryStyle =
    "w-full bg-[#ed354f] text-white rounded-full hover:bg-[#d12e47] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#f58ba0] py-2.5 text-[15px] transition-all";

  const secondaryStyle =
    "w-full bg-neutral-50 !text-black border border-gray-300 hover:bg-neutral-100 active:scale-[0.97] active:shadow-inner focus-visible:ring-2 focus-visible:ring-red-300 rounded-full flex items-center justify-center gap-2 py-2.5 text-[15px] transition-transform";

  const selectedStyle = variant === "secondary" ? secondaryStyle : primaryStyle;

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${selectedStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
