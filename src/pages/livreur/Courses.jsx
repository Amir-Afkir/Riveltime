import { useState } from "react";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function Courses() {
  const [status, setStatus] = useState("en_attente");

  const nextStatus = {
    en_attente: "en_cours",
    en_cours: "presque",
    presque: "terminee",
    terminee: "terminee",
  };

  const statusLabels = {
    en_attente: "En attente de confirmation",
    en_cours: "Commande à récupérer",
    presque: "En route pour la livraison",
    terminee: "Commande livrée",
  };

  const handleAdvance = () => {
    setStatus(nextStatus[status]);
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-28">
      <Header title="Ma course" showBack={false} color="orange" />
      <div className="p-4 max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Suivi de livraison</h2>
        <p className="text-gray-600 mb-6">{statusLabels[status]}</p>

        {status !== "terminee" && (
          <button
            onClick={handleAdvance}
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition"
          >
            Passer à l'étape suivante
          </button>
        )}

        {status === "terminee" && (
          <p className="text-green-600 font-semibold mt-4">Livraison terminée ✅</p>
        )}
      </div>
      <BottomNav role="livreur" />
    </div>
  );
}

