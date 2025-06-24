// src/pages/vendeur/Dashboard.jsx
import Title from "../../components/ui/Title";
import Button from "../../components/ui/Button";

export default function Dashboard() {
  return (
    <div>
      <div className="p-6 max-w-md mx-auto text-center">
        <Title level={2} className="mb-2 text-gray-800">Bienvenue dans votre espace commerçant</Title>
        <p className="text-gray-600 mb-4">Gérez vos produits, vos commandes et votre profil depuis ce tableau de bord.</p>
        <div className="space-y-4 mt-6">
          <Button variant="success" className="w-full">
            🛍️ Gérer ma vitrine
          </Button>
          <Button variant="success" className="w-full">
            📦 Voir les commandes
          </Button>
          <Button variant="success" className="w-full bg-green-800 hover:bg-green-900">
            ⚙️ Profil commerçant
          </Button>
        </div>
      </div>
    </div>
  );
}