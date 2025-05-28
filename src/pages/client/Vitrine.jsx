// src/pages/client/Vitrine.jsx
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext";

export default function Vitrine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [merchant, setMerchant] = useState(null);

  useEffect(() => {
    fetch("/src/data/merchants.json")
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((m) => m.id === parseInt(id, 10));
        setMerchant(found);
      });
  }, [id]);

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <p className="text-red-600">Commerçant introuvable</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-28">
      <Header title={merchant.name} showBack={true} onBack={() => navigate("/client")} />
      <div className="p-4 max-w-md mx-auto">
        <h2 className="text-lg font-semibold mb-2">
          Catégorie : {merchant.category}
        </h2>
        <ul className="space-y-2">
          {merchant.products.map((product, index) => (
            <li
              key={index}
              className="bg-white p-3 rounded shadow text-gray-700 flex justify-between items-center"
            >
              <div>
                <span className="font-medium">{product.name}</span>
                <br />
                <span className="text-sm text-gray-500">
                  {product.price.toFixed(2)} €
                </span>
              </div>
              <button
                onClick={() => addToCart({ merchant: merchant.name, product })}
                className="ml-4 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Ajouter
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate("/client/panier")}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-green-700"
        >
          Voir le panier
        </button>
      </div>
      <BottomNav />
    </div>
  );
}
