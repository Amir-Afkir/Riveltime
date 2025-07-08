export default function ProduitCard({ produit, onModifier }) {
  return (
    <div
      onClick={() => onModifier(produit)}
      role="button"
      tabIndex={0}
      className="relative flex items-center gap-4 bg-white rounded-2xl shadow-sm px-4 py-3 mb-4 border border-gray-200 hover:shadow-md transition cursor-pointer"
    >
      <span className="absolute z-10 top-2 left-2 bg-white/80 backdrop-blur-sm text-black text-xs font-semibold px-2 py-1 rounded-full shadow">
        {produit.price} €
      </span>
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 flex items-center justify-center">
        {produit.imageUrl ? (
          <img
            src={produit.imageUrl}
            alt={produit.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-xl text-gray-300">🧸</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-gray-900 truncate">
            {produit.name}
          </p>
        </div>
        {produit.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
            {produit.description}
          </p>
        )}
      </div>
    </div>
  );
}