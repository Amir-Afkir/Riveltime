import { useNavigate } from "react-router-dom";

export default function MerchantCard({ id, name, category, distance, coverImage }) {
  const navigate = useNavigate();

  return (
    <div
      className="w-full bg-white shadow-sm rounded-xl p-4 transition duration-300 hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(`/vitrine/${id}`)}
      role="button"
    >
      {coverImage && (
        <img
          src={coverImage}
          alt={`${name} - visuel`}
          className="rounded-md w-full h-28 object-cover mb-3"
        />
      )}
      <h2 className="text-base font-semibold text-gray-800 truncate">{name}</h2>
      <p className="text-sm text-gray-500 truncate">{category}</p>
      {distance && <p className="text-xs text-gray-400 mt-1">{distance} km</p>}
    </div>
  );
}