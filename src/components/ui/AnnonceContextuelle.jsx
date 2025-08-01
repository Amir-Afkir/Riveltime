// src/components/ui/AnnonceContextuelle.jsx
import Lottie from "lottie-react";
import grocery from "../../assets/lotties/Grocery.json";

const contextData = {
  sunny: {
    image: "/images/cover-sunny.webp",
    bgOverlay: "bg-black/30",
    title: "Il fait beau aujourd’hui ☀️",
    subtitle: "Profitez des bonnes adresses locales",
  },
  rainy: {
    image: "/images/cover-rainy.webp",
    bgOverlay: "bg-black/40",
    title: "Il pleut aujourd’hui ☔",
    subtitle: "Faites-vous livrer bien au chaud",
  },
  cold: {
    image: "/images/cover-winter.webp",
    bgOverlay: "bg-black/50",
    title: "Il fait froid dehors ❄️",
    subtitle: "Restez au chaud, on s’occupe de tout",
  },
  morning: {
    image: "/images/cover-morning.webp",
    bgOverlay: "bg-black/30",
    title: "Bonjour 👋",
    subtitle: "Commencez la journée avec une bonne adresse",
  },
  evening: {
    image: "/images/cover-evening.webp",
    bgOverlay: "bg-black/40",
    title: "Une soirée tranquille ? 🌙",
    subtitle: "Commandez depuis votre canapé",
  },
};

export default function AnnonceContextuelle({ moment = "sunny" }) {
  const { image, bgOverlay, title, subtitle } = contextData[moment] || contextData.sunny;

  return (
    <div
      className="relative my-4 px-4 py-4 rounded-xl bg-cover bg-center shadow-sm overflow-hidden border border-gray-100 text-white"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className={`absolute inset-0 ${bgOverlay} rounded-xl z-0`} />
      <div className="relative z-10 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-base font-semibold">{title}</p>
          <p className="text-sm mt-1 opacity-90">{subtitle}</p>
        </div>
        <div className="w-[120px] h-[120px] shrink-0 ml-3">
          <Lottie animationData={grocery} loop={false} autoplay={true} className="shadow-lg" />
        </div>
      </div>
    </div>
  );
}