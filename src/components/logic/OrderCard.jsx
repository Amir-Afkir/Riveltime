import Card from "../ui/Card";
import Title from "../ui/Title";

export default function OrderCard({ order }) {
  const {
    _id,
    createdAt,
    ordersParBoutique,
    statutPaiement,
    statutLivraison,
    totalFinal
  } = order;

  const formattedDate = new Date(createdAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderStatutPaiement = () => {
    const baseClass = "font-semibold capitalize";

    switch (statutPaiement) {
      case "authorized":
        return <span className={`${baseClass} text-blue-600`}>Autorisé</span>;
      case "succeeded":
        return <span className={`${baseClass} text-green-600`}>Payée</span>;
      case "canceled":
        return <span className={`${baseClass} text-gray-500`}>Annulée</span>;
      case "failed":
        return <span className={`${baseClass} text-red-600`}>Échouée</span>;
      default:
        return <span className={`${baseClass} text-gray-400`}>Inconnu</span>;
    }
  };

  return (
    <Card>
      <div className="space-y-4 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <Title level={4}>Commande #{_id.slice(-6)}</Title>
          <p className="text-sm text-gray-500">Passée le {formattedDate}</p>
        </div>

        {ordersParBoutique.map((item, index) => (
          <div key={index} className="border-t pt-2 space-y-2">
            <p className="text-lg font-semibold text-primary">
              Boutique : {item.nomBoutique}
            </p>

            <div className="space-y-1 ml-2">
              {item.produits.map((p) => (
                <div key={p.productId} className="text-sm flex justify-between">
                  <span>
                    {p.nomProduit} × {p.quantite}
                  </span>
                  <span>{(p.prixUnitaire * p.quantite).toFixed(2)} €</span>
                </div>
              ))}

              <div className="text-sm text-gray-600 flex justify-between mt-1">
                <span>Frais de livraison</span>
                <span>{item.fraisLivraison.toFixed(2)} €</span>
              </div>

              {item.participationBoutique > 0 && (
                <div className="text-sm text-gray-600 flex justify-between">
                  <span>Participation vendeur</span>
                  <span>-{item.participationBoutique.toFixed(2)} €</span>
                </div>
              )}

              <div className="text-sm font-medium flex justify-between mt-1">
                <span>Total boutique</span>
                <span>{item.totalBoutique.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between items-center border-t pt-3 font-medium">
          <span>Statut paiement :</span>
          {renderStatutPaiement()}
        </div>

        <div className="flex justify-between items-center font-medium">
          <span>Statut livraison :</span>
          <span className="capitalize">{statutLivraison}</span>
        </div>

        <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
          <span>Total commande :</span>
          <span>{totalFinal.toFixed(2)} €</span>
        </div>
      </div>
    </Card>
  );
}