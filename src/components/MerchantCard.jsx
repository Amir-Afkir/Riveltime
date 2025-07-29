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
      className={`relative w-full rounded-xl overflow-hidden transition duration-300 transform group cursor-pointer
  ${
    variant === "featured"
      ? "border-transparent bg-white/60 backdrop-blur-lg ring-2 ring-offset-2 ring-yellow-300/40 hover:ring-yellow-400/60 shadow-[0_4px_20px_rgba(250,204,21,0.3)] hover:shadow-yellow-400 hover:-translate-y-1.5 hover:scale-[1.02]"
      : variant === "recent"
      ? "bg-gradient-to-br from-white/60 to-gray-100/60 backdrop-blur-md shadow-lg ring-1 ring-gray-300 hover:ring-[#ed354f]/40 hover:scale-[1.02] hover:shadow-xl"
      : "bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-md ring-1 ring-gray-200 hover:ring-[#ed354f]/30 hover:scale-[1.02] hover:shadow-lg"
  }`}
      onClick={() => {
        navigate(`/vitrine/${id}`);
      }}
      role="button"
      aria-label={`Voir la boutique ${name}`}
    >
      {coverImage && (
        <img
          src={coverImage}
          alt={`${name} - visuel`}
          className={`w-full object-cover ${
            variant === "featured"
              ? "aspect-[4/3] group-hover:scale-[1.08] transition-transform duration-500"
              : "aspect-[4/3]"
          }`}
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
          Dernière visite
        </div>
      )}
      <div
        className={`absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent text-white px-4 py-3 z-10`}
      >
        <div className="flex justify-between items-center gap-2">
          <h2
            className={`${
              variant === "featured"
                ? "text-[22px] font-extrabold text-white tracking-tight leading-snug"
                : variant === "recent"
                ? "text-[15px] font-medium leading-tight drop-shadow-sm"
                : "text-base font-semibold drop-shadow-sm"
            } truncate`}
          >
            {name}
          </h2>
          <p className={`${variant === "recent" ? "text-xs" : "text-sm"} truncate text-white/80 drop-shadow-sm`}>
            {category}
          </p>
        </div>
        {distance && <p className="mt-1 text-xs text-white/60">{distance} km</p>}
      </div>
    </div>
  );
}