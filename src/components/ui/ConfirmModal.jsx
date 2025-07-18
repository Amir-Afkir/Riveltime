import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, message = "Confirmer l’action ?" }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 px-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative z-[9999]">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="Fermer la modale"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4">Êtes-vous sûr ?</h2>
        <p className="text-sm text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 text-sm rounded"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}