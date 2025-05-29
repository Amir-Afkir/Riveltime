// src/pages/vendeur/Dashboard.jsx
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      <Header title="Espace Commerçant" showBack={true} backTo="/" showCart={true} color="green" />
      <div className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Bienvenue dans votre espace commerçant</h2>
        <p className="text-gray-600 mb-4">Gérez vos produits, vos commandes et votre profil depuis ce tableau de bord.</p>
        <div className="space-y-4 mt-6">
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            🛍️ Gérer ma vitrine
          </button>
          <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
            📦 Voir les commandes
          </button>
          <button className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-900">
            ⚙️ Profil commerçant
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}