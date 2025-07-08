import PropTypes from "prop-types";
import ProduitCard from "./ProduitCard";

export default function ProduitListe({
  collectionName,
  produits,
  onModifier,
  onSupprimer,
}) {
  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold text-gray-700 mb-3">
        {collectionName}
      </h4>
      <ul>
        {produits.map((produit) => (
          <li key={produit._id}>
            <ProduitCard
              produit={produit}
              onModifier={onModifier}
              onSupprimer={onSupprimer}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

ProduitListe.propTypes = {
  collectionName: PropTypes.string.isRequired,
  produits: PropTypes.arrayOf(PropTypes.object).isRequired,
  onModifier: PropTypes.func.isRequired,
  onSupprimer: PropTypes.func.isRequired,
};