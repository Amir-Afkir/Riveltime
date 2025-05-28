import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";

export default function CommandesVendeur() {
  const commandes = [
    {
      id: 1,
      client: "Jean Dupont",
      produits: [
        { nom: "Tomates", quantite: 2 },
        { nom: "Pain", quantite: 1 },
      ],
      total: 6.80,
      statut: "En attente",
    },
    {
      id: 2,
      client: "Marie Durand",
      produits: [{ nom: "Pommes", quantite: 3 }],
      total: 3.30,
      statut: "En cours",
    },
  ];

  return (
    <div className="min-h-screen bg-green-50 pb-20">
      <Header title="Commandes reçues" showBack={true} backTo="/vendeur" color="green" />
      <div className="p-4 max-w-md mx-auto space-y-4">
        {commandes.map((commande) => (
          <div key={commande.id} className="bg-white rounded shadow p-4">
            <p className="font-semibold">Client : {commande.client}</p>
            <ul className="text-sm text-gray-600 mt-2">
              {commande.produits.map((p, i) => (
                <li key={i}>{p.quantite}× {p.nom}</li>
              ))}
            </ul>
            <p className="text-sm mt-2">Total : {commande.total.toFixed(2)} €</p>
            <p className="text-xs text-green-600 mt-1">Statut : {commande.statut}</p>
          </div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}