// ✅ src/pages/common/Home.jsx
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-2xl font-bold">Bienvenue sur Riveltime</h1>
      <p className="text-gray-600">Choisissez votre rôle pour commencer</p>
      <button onClick={() => navigate('/client')} className="bg-blue-600 text-white py-3 px-6 rounded-xl w-full max-w-xs">
        👤 Je suis un Client
      </button>
      <button onClick={() => navigate('/vendeur')} className="bg-green-600 text-white py-3 px-6 rounded-xl w-full max-w-xs">
        🏪 Je suis un Commerçant
      </button>
      <button onClick={() => navigate('/livreur')} className="bg-orange-600 text-white py-3 px-6 rounded-xl w-full max-w-xs">
        🚴 Je suis un Livreur
      </button>
    </div>
  );
}