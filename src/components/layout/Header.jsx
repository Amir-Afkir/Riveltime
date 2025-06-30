import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useAuth0 } from "@auth0/auth0-react";

// Injection CSS globale des animations (une seule fois)
const injectHeaderAnimation = () => {
  if (document.getElementById("header-animation-style")) return;

  const style = document.createElement("style");
  style.id = "header-animation-style";
  style.innerHTML = `
    @keyframes headerReveal {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.99);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @keyframes spinToupie {
      0% {
        transform: rotateY(0deg) scale(1);
      }
      100% {
        transform: rotateY(360deg) scale(1);
      }
    }
    .header-animated {
      animation: headerReveal 400ms cubic-bezier(0.22, 1, 0.36, 1);
      animation-fill-mode: both;
    }
    .toupie-spin {
      animation: spinToupie 3s linear infinite;
      transform-style: preserve-3d;
      backface-visibility: visible;
    }
  `;
  document.head.appendChild(style);
};

export default function Header({
  title,
  showBack,
  backTo,
  color = "blue",
  avatarUrl,
  showSubtitle,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  const { refreshUser } = useUser();

  const isHomePage = location.pathname === "/";
  const isProfilePage = Boolean(avatarUrl && showSubtitle);
  const isCloudinaryImage = avatarUrl?.startsWith("https://res.cloudinary.com/") ?? false;

  const fileInputRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);

  // Prépare URL optimisée avatar avec version cache-bust
  const displayedAvatarUrl = useMemo(() => {
    if (!avatarUrl) return "/src/assets/avatar-default.png";
    if (avatarUrl.startsWith("https://res.cloudinary.com/")) {
      const optimized = avatarUrl.replace(
        "/upload/",
        "/upload/f_auto,q_auto,w_160,h_160,c_thumb,g_face,r_max/"
      );
      return avatarVersion > 0 ? `${optimized}?v=${avatarVersion}` : optimized;
    }
    return avatarUrl;
  }, [avatarUrl, avatarVersion]);

  // Gestion clic avatar profil (upload ou modal)
  const handleClickAvatar = () => {
    if (!location.pathname.includes("/profil")) return;
    isCloudinaryImage ? setModalOpen(true) : fileInputRef.current?.click();
  };

  // Upload avatar vers backend + refresh utilisateur
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
      await refreshUser();
      setAvatarVersion(Date.now());
      setModalOpen(false);
    } catch {
      alert("❌ Échec de l’upload de l’avatar");
    }
  };

  // Suppression avatar + refresh utilisateur
  const handleDeleteAvatar = async () => {
    if (!window.confirm("Supprimer votre avatar ?")) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/me/avatar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Suppression échouée");
      await refreshUser();
      setAvatarVersion(Date.now());
      setModalOpen(false);
    } catch {
      alert("❌ Échec de la suppression de l’avatar");
    }
  };

  // Classe CSS dynamique header
  const headerClass = [
    "fixed top-0 left-0 right-0 z-10",
    "header-animated",
    `${isHomePage ? "h-[30vh]" : "h-[22vh]"}`,
    "transition-all duration-300 ease-in-out"
  ].join(" ");

  useEffect(() => {
    injectHeaderAnimation();
    // Synchronisation meta theme-color (fixé à rouge ici)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#ed354f");
  }, []);

  return (
    <>
      <header className={headerClass}>
        {isProfilePage ? (
          <div className="flex flex-col w-full pt-10 pb-5 px-4 bg-[#ed354f] text-white relative shadow-[0_2px_4px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold leading-snug">{title}</h1>
                <p className="text-sm font-medium text-white/80">{showSubtitle}</p>
              </div>
              <div
                className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-md cursor-pointer"
                onClick={handleClickAvatar}
                title={isCloudinaryImage ? "Voir et modifier l’avatar" : "Modifier l’avatar"}
              >
                <img
                  src={displayedAvatarUrl}
                  alt="Avatar utilisateur"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/src/assets/avatar-default.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-4 w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div className="h-2 bg-white rounded-full" style={{ width: "100%" }}></div>
            </div>
            <p className="mt-1 text-xs text-right text-white/80">Profil complété à 100%</p>
          </div>
        ) : null}
      </header>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleAvatarUpload(e.target.files[0])}
      />

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded p-4 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-700 text-3xl font-bold"
              aria-label="Fermer la modale"
            >
              ×
            </button>
            <img
              src={avatarUrl}
              alt="Avatar agrandi"
              className="rounded mb-4 max-h-80 w-full object-contain"
            />
            <div className="flex justify-between gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Modifier
              </button>
              <button
                onClick={handleDeleteAvatar}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}