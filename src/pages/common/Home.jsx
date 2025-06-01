// ✅ src/pages/common/Home.jsx
import { useNavigate } from 'react-router-dom';
import Button from "../../components/ui/Button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 text-center">
      <h1 className="text-2xl font-bold">Bienvenue sur Riveltime</h1>
      <p className="text-gray-600">Choisissez votre rôle pour commencer</p>
      <Button role="client" onClick={() => navigate('/client')}>
        👤 Je suis un Client
      </Button>
      <Button role="vendeur" onClick={() => navigate('/vendeur')}>
        🏪 Je suis un Commerçant
      </Button>
      <Button role="livreur" onClick={() => navigate('/livreur')}>
        🚴 Je suis un Livreur
      </Button>
    </div>
  );
} 