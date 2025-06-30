import React, { useRef, useState, useMemo } from "react";
import { useUser } from "../../context/UserContext";
import { useAuth0 } from "@auth0/auth0-react";


export default function AvatarHeader() {
  const { userData } = useUser();
  const fileInputRef = useRef();
  const [avatarVersion, setAvatarVersion] = useState(0);
  const { getAccessTokenSilently } = useAuth0();
  const hasAvatar = userData?.avatarUrl && userData.avatarUrl.length > 5;

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload échoué");
      window.location.reload();
      setAvatarVersion(Date.now());
    } catch (err) {
      alert("❌ Échec de l’upload de l’avatar");
      console.error(err);
    }
  };

  const handleClickAvatar = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center w-full gap-3">
      <div
        className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer"
        onClick={handleClickAvatar}
        title="Modifier votre avatar"
      >
        <img
          src={hasAvatar ? `${userData.avatarUrl}?v=${avatarVersion}` : "/src/assets/avatar-default.png"}
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
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleAvatarUpload(e.target.files[0])}
      />
    </div>
  );
}