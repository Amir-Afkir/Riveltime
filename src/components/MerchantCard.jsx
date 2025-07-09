import { useNavigate } from "react-router-dom";

export default function MerchantCard({ id, name, category, distance, coverImage }) {
  const navigate = useNavigate();

  return (
    <div
      className="w-full rounded-lg overflow-hidden border-2 border-white shadow-sm transition duration-300 hover:shadow-md hover:-translate-y-0.5"
      onClick={() => navigate(`/vitrine/${id}`)}
      role="button"
    >
      {coverImage && (
        <img
          src={coverImage}
          alt={`${name} - visuel`}
          className="w-full h-28 object-cover"
        />
      )}
      <div className="px-3 py-2 bg-white/60 text-white">
        <div className="flex justify-between items-center gap-2">
          <h2 className="truncate text-base font-semibold text-gray-800">{name}</h2>
          <p className="truncate text-sm text-gray-500">{category}</p>
        </div>
        {distance && <p className="mt-1 text-xs text-gray-400">{distance} km</p>}
      </div>
    </div>
  );
}