// src/components/ui/BarreDeRecherche.jsx

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function BarreDeRecherche({ onChange, value }) {
  const [placeholder, setPlaceholder] = useState("Rechercher une boutique ou un produit…");

useEffect(() => {
  const hour = new Date().getHours();
  if (hour < 11) {
    setPlaceholder("Besoin de quelque chose ce matin ? 🌅");
  } else if (hour < 17) {
    setPlaceholder("Trouvez ce qu’il vous faut près de chez vous 🔍");
  } else {
    setPlaceholder("Faites-vous plaisir sans bouger 🌙");
  }
}, []);

  return (
    <motion.div
      role="search"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-[60px] z-30 px-4"
    >
      <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md shadow-md border-t border-gray-200  px-4 py-2 focus-within:ring-2 focus-within:ring-[#ed354f] transition-all">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label="Rechercher une boutique ou un produit"
          autoComplete="off"
          enterKeyHint="search"
          className="flex-1 text-base text-gray-800 placeholder-gray-400 bg-transparent outline-none"
        />
      </div>
    </motion.div>
  );
}
