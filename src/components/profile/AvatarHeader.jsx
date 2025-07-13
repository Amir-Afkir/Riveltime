import React, { useRef, useState } from "react";
import useUserStore from "../../stores/userStore";


export default function AvatarHeader() {
  const { userData, fetchUser } = useUserStore();
  const fileInputRef = useRef();
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const hasAvatar = userData?.avatarUrl && userData.avatarUrl.length > 5;

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setIsUploading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload échoué");
      await fetchUser({ silent: true });
      setAvatarVersion(Date.now());
    } catch (err) {
      alert("❌ Échec de l’upload de l’avatar");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClickAvatar = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center w-full gap-3">
      <div
        className="relative w-[96px] h-[96px] rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer"
        onClick={handleClickAvatar}
        title="Modifier votre avatar"
      >
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-[3px] border-[#f58ba0]/50 border-t-[#ed354f]" />
          </div>
        )}
        <img
          src={hasAvatar ? `${userData.avatarUrl}?v=${avatarVersion}` : "/src/assets/avatar-default.png"}
          alt="Avatar utilisateur"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <h1 className="text-xl font-semibold leading-tight text-white">
          Bonjour {userData?.fullname?.trim() || userData?.name || "Utilisateur"} !
        </h1>
        {userData?.role && (
          <p className="text-sm text-white/80">
            {userData.role === "client" && "Bienvenue parmi nos fidèles clients"}
            {userData.role === "vendeur" && "Cher commerçant, merci de faire vivre nos quartiers"}
            {userData.role === "livreur" && "Livrer, c’est aussi créer du lien "}
          </p>
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