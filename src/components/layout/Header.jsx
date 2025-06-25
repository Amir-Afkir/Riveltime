// ✅ src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

export default function Header({ title, showBack, backTo, color = "blue", avatarUrl, showSubtitle }) {
  const navigate = useNavigate();

  return (
    <header className={`w-full p-4 bg-${color}-600 text-white shadow-md`}>
      {avatarUrl && showSubtitle ? (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
            <img
              src={avatarUrl}
              alt="Avatar utilisateur"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {title}
            </h1>
            {showSubtitle && <p className="text-sm opacity-80">{showSubtitle}</p>}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          {showBack && (
            <button
              onClick={() => backTo ? navigate(backTo) : navigate(-1)}
              className="text-white text-2xl font-light"
              aria-label="Retour"
            >
              ←
            </button>
          )}
          <h1 className="text-xl font-semibold text-center flex-1">{title}</h1>
        </div>
      )}
    </header>
  );
}