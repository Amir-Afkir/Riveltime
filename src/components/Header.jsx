import { useNavigate } from 'react-router-dom';

export default function Header({ title, showBack }) {
  const navigate = useNavigate();

  return (
    <header className="w-full p-4 bg-blue-600 text-white shadow-md flex items-center justify-between relative">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="text-white text-2xl font-light"
          aria-label="Retour"
        >
          ←
        </button>
      )}
      <h1 className="text-xl font-semibold text-center flex-1">{title}</h1>
    </header>
  );
}