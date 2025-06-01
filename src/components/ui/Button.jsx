// src/components/ui/Button.jsx
import React from "react";

/**
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {"button"|"submit"|"reset"} [props.type]
 * @param {"primary"|"secondary"|"danger"|"success"|"orange"|"link"} [props.variant]
 * @param {"normal"|"icon"|"small"} [props.size]
 * @param {"client"|"vendeur"|"livreur"} [props.role] // optionnel
 * @param {string} [props.className]
 * @param {boolean} [props.disabled]
 * @param {function} [props.onClick]
 */
export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "normal",
  className = "",
  role, // ← pour coloration personnalisée
  disabled = false,
  ...props
}) {
  // Palette principale selon le rôle (prioritaire si défini)
  const roleColors = {
    client: "bg-blue-600 hover:bg-blue-700 text-white",
    vendeur: "bg-green-600 hover:bg-green-700 text-white",
    livreur: "bg-orange-600 hover:bg-orange-700 text-white",
  };

  // Variants par défaut (hors rôle)
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    orange: "bg-orange-500 text-white hover:bg-orange-600",
    link: "text-blue-600 hover:underline bg-transparent p-0",
  };

  // Styles de base selon la taille
  const sizeStyles = {
    normal: "px-4 py-2 rounded text-sm font-medium",
    small: "px-2 py-1 rounded text-xs font-medium",
    icon: "p-2 rounded-full",
  };

  // Calcul de la classe finale
  const baseStyle = sizeStyles[size] || sizeStyles.normal;
  const colorStyle = role ? roleColors[role] : variants[variant] || variants.primary;
  const disabledStyle = disabled
    ? "opacity-50 pointer-events-none"
    : "focus:outline-none transition";

  const finalClass = `${baseStyle} ${colorStyle} ${disabledStyle} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      className={finalClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
