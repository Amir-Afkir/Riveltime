import { useNavigate } from "react-router-dom";

export default function MerchantCard({ id, name, category, distance }) {
  console.log("MerchantCard props:", { id, name, category, distance });
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white shadow-md rounded-xl p-4 border border-gray-100 transition hover:shadow-lg">
      <h2 className="text-lg font-bold text-gray-800">{name}</h2>
      <p className="text-sm text-gray-500">{category}</p>
      <p className="text-xs text-gray-400 mt-1">{distance} km</p>
      <button
        onClick={() => navigate(`/vitrine/${id}`)}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md text-sm text-center hover:bg-blue-700"
      >
        Voir les produits
      </button>
    </div>
  );
}