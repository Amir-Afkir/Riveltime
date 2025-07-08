// src/components/ui/IconFieldWrapper.jsx
import React from "react";

export default function IconFieldWrapper({ icon: Icon, children, className = "mb-4" }) {
  return (
    <div className={`relative ${className}`}>
      <Icon className="absolute left-3  top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      {children}
    </div>
  );
}