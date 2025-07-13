import { useNavigate } from "react-router-dom";
import { Clock, Star } from "lucide-react";

export default function MerchantCard({
  id,
  name,
  category,
  distance,
  coverImage,
  variant = "default",
}) {
  const navigate = useNavigate();

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border-[3px] shadow-md transition duration-300 transform group
    ${
      variant === "featured"
        ? "border-transparent bg-white/60 backdrop-blur-lg ring-2 ring-offset-2 ring-yellow-300/40 hover:ring-yellow-400/60 shadow-[0_4px_20px_rgba(250,204,21,0.3)] hover:shadow-yellow-400 hover:-translate-y-1.5 hover:scale-[1.02]"
        : variant === "recent"
        ? "border-gray-200 hover:-translate-y-0.5"
        : "border-white hover:-translate-y-0.5"
    }`}
      onClick={() => {
        navigate(`/vitrine/${id}`);
      }}
      role="button"
    >
      {coverImage && (
        <img
          src={coverImage}
          alt={`${name} - visuel`}
          className={`${
            variant === "featured"
              ? "h-60 group-hover:scale-[1.08] transition-transform duration-500 rounded-t-xl"
              : variant === "recent"
              ? "h-24"
              : "h-28"
          } w-full object-cover`}
        />
      )}
      {variant === "featured" && (
        <div className="absolute inset-0 bg-black/40 z-10 flex flex-col justify-between p-4">
          <div className="flex justify-end">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="text-yellow-400 drop-shadow" />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-end">
            <h3 className="text-white text-lg font-bold">{name}</h3>
            <span className="text-white text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {category || "Non renseignée"}
            </span>
          </div>
        </div>
      )}
      {variant === "recent" && (
        <div className="absolute top-2 left-2 bg-white/80 backdrop-blur-md text-gray-700 text-[11px] px-2.5 py-1 rounded-full shadow flex items-center gap-1 z-10">
          <Clock size={12} className="text-[#ed354f]" />
          Vu récemment
        </div>
      )}
      <div
        className={`px-4 py-3 ${
          variant === "featured" ? "bg-white/80 backdrop-blur-md" : "bg-white"
        } rounded-b-xl`}
      >
        <div className="flex justify-between items-center gap-2">
          <h2
            className={`${
              variant === "featured"
                ? "text-[22px] font-extrabold text-gray-900 tracking-tight leading-snug"
                : variant === "recent"
                ? "text-sm"
                : "text-base"
            } truncate`}
          >
            {name}
          </h2>
          <p className={`${variant === "recent" ? "text-xs" : "text-sm"} truncate text-gray-500`}>
            {category}
          </p>
        </div>
        {distance && <p className="mt-1 text-xs text-gray-400">{distance} km</p>}
      </div>
    </div>
  );
}