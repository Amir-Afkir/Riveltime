import { Plus, Settings } from "lucide-react";
import PropTypes from "prop-types";
import { useState, useMemo } from "react";

export default function BoutiqueSelector({ boutiques, selectedId, onSelect, onCreate, onEdit }) {
  const [shrinkingId, setShrinkingId] = useState(null);
  const [isDeselecting, setIsDeselecting] = useState(false);

  const selectedBoutique = useMemo(
    () => selectedId ? boutiques.find((b) => b._id === selectedId) : null,
    [selectedId, boutiques]
  );

  const avatarUrl = useMemo(
    () => selectedBoutique?.owner?.avatarUrl || "/avatar-default.png",
    [selectedBoutique]
  );

  const handleDeselect = () => {
    setIsDeselecting(true);
    setTimeout(() => {
      onSelect(null);
      setIsDeselecting(false);
    }, 200);
  };

  const handleSelect = (boutique) => {
    setShrinkingId(boutique._id);
    setTimeout(() => {
      onSelect(boutique);
      setShrinkingId(null);
    }, 200);
  };

  const renderSelectedBoutique = () => (
    <div
      className={`relative w-full max-w-[350px] mx-auto overflow-visible ${
        isDeselecting ? "animate-fade-shrink-out" : "animate-expand-card"
      }`}
      key={selectedBoutique._id}
    >
      <div className="rounded-xl border-2 border-gray-100 overflow-hidden max-h-[120px]">
        <div className="aspect-[2.5/1] w-full relative">
          <button
            onClick={handleDeselect}
            className="absolute inset-0 w-full h-full focus:outline-none"
            aria-label={`Désélectionner ${selectedBoutique.name}`}
          >
            <img
              src={selectedBoutique.coverImageUrl}
              alt={`Image de ${selectedBoutique.name}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        </div>
      </div>
      <div className="absolute bottom-[-36px] left-1/2 -translate-x-1/2 w-[72px] h-[72px] rounded-full border-2 border-white shadow-md overflow-hidden bg-white z-[60]">
        <img
          src={avatarUrl}
          alt={`Avatar de ${selectedBoutique.owner?.fullname || "vendeur"}`}
          title={selectedBoutique.owner?.fullname || "Vendeur"}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <button
        onClick={() => onEdit(selectedBoutique)}
        className="absolute top-2.5 right-2.5 z-[70] bg-white/70 backdrop-blur-sm p-3 rounded-full shadow hover:bg-white transition w-12 h-12 flex items-center justify-center"
        title="Modifier la boutique"
        aria-label="Modifier la boutique"
      >
        <Settings className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );

  const renderBoutique = (b) => {
    const isShrinking = shrinkingId === b._id;
    return (
      <div
        key={b._id}
        className={`flex flex-col items-center w-[96px] flex-shrink-0 snap-center transition-all duration-100 ease-in-out ${
          isShrinking ? "animate-shrink-fade-out" : "animate-expand-card"
        }`}
      >
        <button
          onClick={() => handleSelect(b)}
          className="relative w-full h-[96px] rounded-xl overflow-hidden border-2 ring-0 shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-transform duration-100 ease-out hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-primary"
          style={{
            backgroundImage: b.coverImageUrl ? `url(${b.coverImageUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-label={`Boutique ${b.name}`}
        />
        <span
          className="text-center text-sm font-medium text-black truncate w-full"
          title={b.name}
        >
          {b.name}
        </span>
      </div>
    );
  };

  return (
    <div className="relative py-4 -mx-4 px-4 overflow-x-auto overflow-visible flex gap-3 snap-x snap-mandatory scrollbar-hide flex-nowrap scroll-smooth pb-12">
      {selectedId
        ? renderSelectedBoutique()
        : boutiques.filter((b) => !b.isPlaceholder).map(renderBoutique)}

      {!selectedId && (
        <button
          key="add-boutique"
          onClick={onCreate}
          className="w-[96px] h-[96px] min-w-[96px] min-h-[96px] flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center snap-center shadow-[0_2px_6px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Ajouter une boutique"
        >
          <Plus size={24} className="text-gray-500" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

BoutiqueSelector.propTypes = {
  boutiques: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};