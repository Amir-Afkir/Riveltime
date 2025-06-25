// ✅ src/components/Header.jsx
import { useNavigate } from 'react-router-dom';

export default function Header({ title, showBack, backTo, color = "blue", avatarUrl, showSubtitle }) {
  const navigate = useNavigate();

  const isProfile = avatarUrl && showSubtitle;
  const headerClass =
    `fixed top-0 left-0 right-0 z-50 px-4 bg-${color}-600 text-white shadow-md ` +
    (isProfile ? "h-auto py-4" : "h-16 flex items-center justify-center");

  return (
    <header className={headerClass}>
      {isProfile ? (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
            <img
              src={avatarUrl}
              alt="Avatar utilisateur"
              className="w-full h-full object-cover"
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
  );
}