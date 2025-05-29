// src/components/ui/Button.jsx
import React from 'react';

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "normal",
  className = "",
  ...props
}) {
  // Base styles vary by size
  const baseStyle = size === 'icon'
    ? 'p-2 rounded-full focus:outline-none transition'
    : 'px-4 py-2 rounded text-sm font-medium focus:outline-none transition';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    orange: 'bg-orange-500 text-white hover:bg-orange-600',
    link: 'text-blue-600 hover:underline bg-transparent p-0',
  };

  const variantStyle = variants[variant] || variants.primary;
  const finalClass = `${baseStyle} ${variantStyle} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={finalClass}
      {...props}
    >
      {children}
    </button>
  );
}
