import PropTypes from "prop-types";
import { Pencil, Trash2 } from "lucide-react";

export default function ProduitCard({ produit, onModifier, onSupprimer }) {
  return (
    <li className="relative flex items-start gap-4 bg-white rounded-2xl shadow-sm px-5 py-4 mb-5 border border-gray-200 hover:shadow-md transition">
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
        <p className="text-sm text-primary font-medium">{produit.price} €</p>
        {produit.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{produit.description}</p>
        )}
      </div>

      <div className="flex flex-col items-end justify-between gap-2 pt-1">
        <button
          title="Modifier"
          onClick={() => onModifier(produit)}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <Pencil className="w-5 h-5 text-gray-700" />
        </button>
        <button
          title="Supprimer"
          onClick={() => {
            if (window.confirm("Supprimer ce produit ?")) {
              onSupprimer(produit._id);
            }
          }}
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </li>
  );
}

ProduitCard.propTypes = {
  produit: PropTypes.object.isRequired,
  onModifier: PropTypes.func.isRequired,
  onSupprimer: PropTypes.func.isRequired,
};