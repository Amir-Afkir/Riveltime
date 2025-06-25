// ✅ AvatarHeader.jsx
import React from "react";

export default function AvatarHeader({ avatarUrl, name, subtitle }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
        <img
          src={avatarUrl || "/assets/avatar-default.png"}
          alt="Avatar utilisateur"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-xl font-semibold leading-tight text-white">
          {name}
        </h1>
        {subtitle && <p className="text-sm opacity-80 text-white">{subtitle}</p>}
      </div>
    </div>
  );
}