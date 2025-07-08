import { X, Trash2, Store, Tag, FolderSearch, PackageSearch, Euro, FileText } from "lucide-react";
import { useRef, useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import IconFieldWrapper from "../ui/IconFieldWrapper";
import FileInput from "../ui/FileInput";

const safeValue = (val, fallback = "") => (val === undefined || val === null ? fallback : val);

const CATEGORIES = [
  "Alimentation",
  "Mobilité électrique",
  "Prêt-à-porter",
  "Électronique",
  "Beauté & Bien-être",
  "Maison & Déco",
];

export default function GestionModal({
  type,
  data,
  boutique, // utile uniquement pour type === "produit"
  onChange,
  onFileChange,
  onSave,
  onDelete,
  onClose,
  collectionsDispo = []
}) {
  const modalRef = useRef();

  const isBoutique = type === "boutique";
  const isProduit = type === "produit";


  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const renderBoutiqueFields = () => (
    <>
      <div className="relative mb-4 pl-10">
        <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Nom de la boutique"
          aria-label="Nom de la boutique"
          value={safeValue(data.name)}
          onChange={onChange}
          className="w-full pr-4 py-2 pl-3 border border-gray-300 rounded-md shadow-sm text-base text-gray-800 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary"
        />
      </div>

      <div className="relative mb-4 pl-10">
        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <select
          name="category"
          aria-label="Catégorie"
          value={safeValue(data.category)}
          onChange={onChange}
          className="w-full pr-4 py-2 pl-3 border border-gray-300 rounded-md shadow-sm text-base text-gray-800 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary"
        >
          <option value="">Sélectionner une catégorie</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <FileInput
          id="coverImage"
          name="coverImage"
          onChange={onFileChange}
          ariaLabel="Image de couverture"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 mb-3">Image JPG ou PNG, max 2 Mo</p>
    </>
  );

  const renderProduitFields = () => (
    <>
      <div className="relative mb-4 pl-10">
        <FolderSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          list="collections"
          name="collectionName"
          placeholder="Collection"
          aria-label="Collection"
          value={safeValue(data.collectionName)}
          onChange={onChange}
          className="w-full pr-4 py-2 pl-3 border border-gray-300 rounded-md shadow-sm text-base text-gray-800 focus-visible:ring-2 focus-visible:ring-primary focus:border-primary"
        />
      </div>

      <datalist id="collections">
        {collectionsDispo.map((col) => (
          <option key={col} value={col} />
        ))}
      </datalist>

      <IconFieldWrapper icon={PackageSearch}>
        <Input name="name" placeholder="Nom du produit" aria-label="Nom" value={safeValue(data.name)} onChange={onChange} className="pl-10" />
      </IconFieldWrapper>

      <IconFieldWrapper icon={Euro}>
        <Input name="price" placeholder="Prix" type="number" aria-label="Prix" value={safeValue(data.price, "")} onChange={onChange} className="pl-10" />
      </IconFieldWrapper>

      <IconFieldWrapper icon={FileText}>
        <Input name="description" placeholder="Description" aria-label="Description" value={safeValue(data.description)} onChange={onChange} className="pl-10" />
      </IconFieldWrapper>

      <div className="mb-3">
        <FileInput
          id="image"
          name="image"
          onChange={onFileChange}
          ariaLabel="Image"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 mb-3">Image JPG ou PNG, max 2 Mo</p>
    </>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        className="w-full max-w-screen-sm md:max-w-screen-md bg-white rounded-t-2xl rounded-b-none px-4 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">
            {data._id ? "Modifier" : "Créer"} {isBoutique ? "une boutique" : `un produit${boutique ? ` dans « ${boutique.name} »` : ""}`}
          </h3>
          <div className="flex gap-2">
            {isBoutique && data._id && (
              <Button
                onClick={onDelete}
                aria-label="Supprimer la boutique"
                className="p-2.5 border border-red-200 text-red-500 bg-red-50/40 hover:bg-red-100 transition rounded-xl"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
            <button
              onClick={onClose}
              aria-label="Fermer la fenêtre"
              className="p-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isBoutique && renderBoutiqueFields()}

        {isProduit && renderProduitFields()}

        <div className="mt-6 border-t pt-4">
          <Button onClick={onSave} aria-label="Sauvegarder" variant="secondary">
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}