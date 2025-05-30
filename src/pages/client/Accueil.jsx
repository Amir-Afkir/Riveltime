// src/pages/client/Accueil.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import MerchantCard from "../../components/MerchantCard";
import merchants from "../../data/merchants.json";
import Input from "../../components/ui/Input";

export default function Accueil() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const filteredMerchants = merchants.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase()) ||
    m.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Layout title="Commerçants près de vous" showBack backTo="/" showCart>
      <div className="p-4">
        <Input
          type="text"
          placeholder="Rechercher un commerçant ou une catégorie..."
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
    </Layout>
  );
}