import Card from "../../components/ui/Card";
import Title from "../../components/ui/Title";
import Badge from "../../components/ui/Badge";

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
    <div className="space-y-4">
      {commandes.map((commande) => (
        <Card key={commande.id}>
          <Title level={4} className="mb-1">Client : {commande.client}</Title>
          <ul className="text-sm text-gray-600 mt-2">
            {commande.produits.map((p, i) => (
              <li key={i}>{p.quantite}× {p.nom}</li>
            ))}
          </ul>
          <p className="text-sm mt-2">Total : {commande.total.toFixed(2)} €</p>
          <Badge color={commande.statut === "En cours" ? "blue" : "gray"} className="mt-2 inline-block">
            Statut : {commande.statut}
          </Badge>
        </Card>
      ))}
    </div>
  );
}