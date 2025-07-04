import PropTypes from "prop-types";

export default function BoutiqueSelector({ boutiques, selectedId, onSelect, onCreate }) {
    return (
      <div className="flex gap-4 overflow-x-auto mt-4 pb-2 px-1">
        {boutiques.map((b) => (
          <button
            key={b._id}
            onClick={() => onSelect(b)}
            className={`relative w-[120px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden border transition duration-200 transform hover:scale-[1.03]
              ${selectedId === b._id ? "ring-2 ring-primary shadow-lg" : "border-gray-200"}
            `}
            style={{
              backgroundImage: b.coverImageUrl ? `url(${b.coverImageUrl})` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <span className="absolute bottom-2 left-2 text-white text-sm font-semibold">
              {b.name}
            </span>
          </button>
        ))}
  
        {/* Bouton Ajouter */}
        <button
          onClick={onCreate}
          className="w-[100px] h-[100px] flex-shrink-0 rounded-xl border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all duration-200"
        >
          <span className="text-3xl text-gray-500">＋</span>
        </button>
      </div>
    );
  }

BoutiqueSelector.propTypes = {
  boutiques: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};