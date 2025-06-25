// src/components/profile/MoyenPaiementForm.jsx

import { useState } from "react";
import Button from "../ui/Button";

export default function MoyenPaiementForm({ moyensPaiement = [], onSubmit }) {
  const [selected, setSelected] = useState(moyensPaiement);

  const toggleMoyen = (moyen) => {
    setSelected((prev) =>
      prev.includes(moyen)
        ? prev.filter((m) => m !== moyen)
        : [...prev, moyen]
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(selected);
      }}
      className="space-y-4"
    >
      <div className="flex gap-2 flex-wrap">
        {["CB", "Espèces", "Apple Pay", "Google Pay", "Ticket resto"].map((moyen) => (
          <label key={moyen} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(moyen)}
              onChange={() => toggleMoyen(moyen)}
            />
            {moyen}
          </label>
        ))}
      </div>

      <div className="text-right">
        <Button type="submit">💾 Enregistrer</Button>
      </div>
    </form>
  );
}
