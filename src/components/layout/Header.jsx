import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth0 } from '@auth0/auth0-react';

export default function Header({ title, showBack, backTo, color = "blue", avatarUrl, showSubtitle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  const { userData, refreshUser } = useUser();

  const fileInputRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);

  const isProfilePage = Boolean(avatarUrl && showSubtitle);
  const isCloudinaryImage = avatarUrl?.startsWith('https://res.cloudinary.com/') ?? false;

  const getToken = () => getAccessTokenSilently();

  const handleClickAvatar = () => {
    if (!location.pathname.includes("/profil")) return;
    if (isCloudinaryImage) setModalOpen(true);
    else fileInputRef.current?.click();
  };

  const handleUploadAvatar = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const token = await getToken();
      const res = await fetch("/api/users/me/avatar", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload échoué");
      await refreshUser();
      setModalOpen(false);
    } catch {
      alert("❌ Échec de l’upload de l’avatar");
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm("Supprimer votre avatar ?")) return;
    try {
      const token = await getToken();
      const res = await fetch("/api/users/me/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Suppression échouée");
      await refreshUser();
      setModalOpen(false);
    } catch {
      alert("❌ Échec de la suppression de l’avatar");
    }
  };

  const headerClass = [
    "fixed top-0 left-0 right-0 z-50 px-4 bg-" + color + "-600 text-white shadow-md",
    isProfilePage ? "py-4" : "h-16 flex items-center justify-center"
  ].join(' ');

  const displayedAvatarUrl = avatarUrl?.startsWith("http")
    ? `${avatarUrl}?v=${Date.now()}`
    : "/src/assets/avatar-default.png";

  return (
    <>
      <header className={headerClass}>
        {isProfilePage ? (
          <div className="flex items-center gap-4">
            <div
              className="relative w-16 h-16 cursor-pointer"
              onClick={handleClickAvatar}
              title={isCloudinaryImage ? "Voir et modifier l’avatar" : "Modifier l’avatar"}
            >
              <img
                src={displayedAvatarUrl}
                alt="Avatar utilisateur"
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "/src/assets/avatar-default.png";
                }}
                className="w-full h-full object-cover rounded-full border-2 border-white shadow-md"
              />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={e => handleUploadAvatar(e.target.files[0])}
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">{title}</h1>
              <p className="text-sm opacity-80">{showSubtitle}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            {showBack && (
              <button
                onClick={() => backTo ? navigate(backTo) : navigate(-1)}
                className="text-white text-2xl font-light absolute left-4"
                aria-label="Retour"
              >
                ←
              </button>
            )}
            <h1 className="text-xl font-semibold text-center">{title}</h1>
          </div>
        )}
      </header>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded p-4 max-w-sm w-full relative"
            onClick={e => e.stopPropagation()}
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
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={e => handleUploadAvatar(e.target.files[0])}
            />
          </div>
        </div>
      )}
    </>
  );
}