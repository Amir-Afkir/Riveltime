import { X, Trash2, Save } from "lucide-react";
import { useRef } from "react";

const CATEGORIES = [
  "Alimentation",
  "Mobilité électrique",
  "Prêt-à-porter",
  "Électronique",
  "Beauté & Bien-être",
  "Maison & Déco",
];

export default function BoutiqueModal({
  boutique,
  onChange,
  onFileChange,
  onSave,
  onDelete,
  onClose,
}) {
  const modalRef = useRef();

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md md:max-w-lg bg-white rounded-t-2xl rounded-b-none px-4 py-5 shadow-lg animate-slide-up"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-base md:text-lg font-semibold">
            {boutique._id ? "Modifier" : "Créer"} une boutique
          </h3>
          <div className="flex gap-1">
            <button
              onClick={onClose}
              title="Annuler"
              className="p-1.5 rounded hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
            {boutique._id && (
              <button
                onClick={onDelete}
                title="Supprimer"
                className="p-1.5 rounded hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            )}
            <button
              onClick={onSave}
              title="Sauvegarder"
              className="p-1.5 rounded hover:bg-green-50 transition"
            >
              <Save className="w-4 h-4 text-green-600" />
            </button>
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la boutique
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={boutique.name}
            onChange={onChange}
            className="w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <label className="block mt-2 mb-1 font-medium text-sm text-gray-700">Catégorie</label>
        <select
          name="category"
          value={boutique.category}
          onChange={onChange}
          className="w-full border rounded-md px-3 py-2 text-sm mb-6"
        >
          <option value="">-- Sélectionner une catégorie --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <div className="mt-2">
          <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
            Image de couverture
          </label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="w-full text-sm"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 mb-1">Image JPG ou PNG, max 2 Mo</p>
      </div>
      </div>
  );
}
