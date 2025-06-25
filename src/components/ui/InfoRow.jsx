// src/components/ui/InfoRow.jsx
import {
    HiUser,
    HiPhone,
    HiTag,
    HiLocationMarker,
    HiCreditCard,
    HiMail,
    HiOfficeBuilding,
    HiGlobeAlt
  } from "react-icons/hi";
  
  const iconMap = {
    "Nom :": <HiUser className="text-gray-500" />,
    "Email :": <HiMail className="text-gray-500" />,
    "Téléphone :": <HiPhone className="text-gray-500" />,
    "Catégorie :": <HiTag className="text-gray-500" />,
    "Adresse :": <HiLocationMarker className="text-gray-500" />,
    "Moyens de paiement :": <HiCreditCard className="text-gray-500" />,
    "Siret :": <HiOfficeBuilding className="text-gray-500" />,
    "Zone :": <HiGlobeAlt className="text-gray-500" />,
  };
  
  export default function InfoRow({ label, value }) {
    return (
      <div className="flex justify-between items-center border-b py-2 text-sm gap-3">
        <div className="flex items-center gap-2 min-w-[120px]">
          {iconMap[label] || null}
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-right text-gray-900 flex-1">{value || "—"}</span>
      </div>
    );
  }