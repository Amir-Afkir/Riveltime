// src/pages/livreur/Dashboard.jsx
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function DashboardLivreur() {
  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      <Header title="Bonjour, Amir 🚴" showBack={true} backTo="/" color="orange" />

      <div className="p-4 max-w-md mx-auto space-y-6 text-gray-700">

        {/* Bloc Statut Global */}
        <section className="bg-white rounded shadow p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Statut</h2>
            <span className="text-sm text-green-600 font-medium">✅ Disponible</span>
          </div>
          <p className="text-sm mt-1">📦 3 courses en attente · ✅ 4 livrées aujourd’hui</p>
        </section>

        {/* Bloc suivi de la course en cours */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Course en cours</h2>
          <p className="mb-2">🛍️ Jean Dupont – Rue du Faubourg</p>
          <ol className="list-decimal list-inside text-sm space-y-1">
            <li className="text-orange-600 font-semibold">1. En attente – Commande acceptée</li>
            <li>2. En cours – Vers le magasin</li>
            <li>3. Presque – Vers le client</li>
            <li>4. Livrée</li>
          </ol>
          <button className="mt-3 w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            Passer à l'étape suivante
          </button>
        </section>

        {/* Bloc Courses disponibles */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Courses à accepter</h2>
          <ul className="text-sm space-y-2">
            <li className="border p-2 rounded flex justify-between items-center">
              <span>📦 La Papeterie Locale → Rue Jeanne d’Arc</span>
              <button className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700">
                Accepter
              </button>
            </li>
            {/* autres courses */}
          </ul>
        </section>

        {/* Bloc Statistiques */}
        <section className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Statistiques</h2>
          <p>Livraisons totales : <span className="font-medium">48</span></p>
          <p>Évaluations moyennes : <span className="font-medium">4.7 ⭐</span></p>
          <p>Temps moyen de livraison : <span className="font-medium">23 min</span></p>
          <button className="mt-2 text-blue-600 text-sm hover:underline">Voir l’historique</button>
        </section>

      </div>

      <BottomNav role="livreur" />
    </div>
  );
}