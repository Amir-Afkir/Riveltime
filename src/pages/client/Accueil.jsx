// src/pages/client/Accueil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import MerchantCard from "../../components/MerchantCard";
import merchants from "../../data/merchants.json";
import BottomNav from "../../components/BottomNav";

export default function Accueil() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      <Header title="Commerçants près de vous" showBack={true} showCart={true} />
      <div className="p-4">
        <input
          type="text"
          placeholder="Rechercher un commerçant ou une catégorie..."
          className="w-full p-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <main className="max-w-md mx-auto space-y-4">
          {filteredMerchants.map((m) => (
            <MerchantCard
              key={m.id}
              id={m.id}
              name={m.name}
              category={m.category}
              distance={m.distance}
              onClick={() => navigate(`/vitrine/${m.id}`)}
            />
          ))}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}