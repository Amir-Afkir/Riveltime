import React from "react";
import { useUser } from "../../context/UserContext";

export default function AvatarHeader() {
  const { userData } = useUser();
  const hasAvatar = userData?.avatarUrl && userData.avatarUrl.length > 5;

  return (
    <div className="flex flex-col items-center justify-center text-center w-full gap-3">
      <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
        <img
          src={hasAvatar ? userData.avatarUrl : "/src/assets/avatar-default.png"}
          alt="Avatar utilisateur"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-xl font-semibold leading-tight text-white">
          Bonjour {userData?.name ?? "Utilisateur"} !
        </h1>
        {userData?.role && (
          <p className="text-sm text-white/80">{userData.role} fidèle depuis février</p>
        )}
      </div>
    </div>
  );
}