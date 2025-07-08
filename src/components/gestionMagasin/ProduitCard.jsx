import PropTypes from "prop-types";

export default function ProduitCard({ produit, onModifier }) {
  return (
    <div
      onClick={() => onModifier(produit)}
      role="button"
      tabIndex={0}
      className="relative flex items-start gap-4 bg-white rounded-2xl shadow-sm px-5 py-4 mb-5 border border-gray-200 hover:shadow-md transition cursor-pointer"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex-shrink-0 flex items-center justify-center">
        {produit.imageUrl ? (
          <img
            src={produit.imageUrl}
            alt={produit.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-2xl text-gray-300">🧸</span>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1 pt-1">
        <p className="text-base font-semibold text-gray-900 truncate">{produit.name}</p>
        <span className="absolute top-4 right-4 text-sm font-semibold text-primary">
          {produit.price} €
        </span>
        {produit.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{produit.description}</p>
        )}
      </div>
    </div>
  );
}

ProduitCard.propTypes = {
  produit: PropTypes.object.isRequired,
  onModifier: PropTypes.func.isRequired,
};