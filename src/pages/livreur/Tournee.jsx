import { PackageIcon, ClockIcon, Box, MapPinIcon, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import useUserStore from "../../stores/userStore";

const tabs = [
  { key: "prochaine", label: "Prochaine livraison" },
  { key: "historique", label: "Historique" }
];

function ProchaineLivraison({ livraison, code, setCode, onSubmit }) {
  if (!livraison) {
    return <Card><p className="text-sm text-gray-500">Aucune livraison en cours</p></Card>;
  }

  let heureLivraison = "inconnue";
  const dateLimite = new Date(livraison.estimatedDeliveryAt);
  if (!isNaN(dateLimite.getTime())) {
    heureLivraison = dateLimite.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (livraison.estimatedDelayMinutes) {
    heureLivraison = `${livraison.estimatedDelayFormatted}`;
  }

  return (
    <Card className="space-y-4">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-600 font-medium flex items-center gap-1 justify-left">
          <PackageIcon size={14} /> Commande n° {livraison.orderNumber}
        </p>
        <span className="inline-block text-xs font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          En cours de livraison
        </span>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 space-y-1 text-sm">
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
            <MapPinIcon size={14} /> Adresse
          </div>
        <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5">
          <li>{livraison.boutiqueAddress}</li>
          <li>{livraison.deliveryAddress}</li>
        </ul>
                <div className="text-right text-sm font-semibold text-gray-800 pt-1 border-t border-yellow-100 mt-2">
                  Total : {livraison.montantLivreur / 100} €
                </div>
      </div>

      <div className="border-t pt-2 grid grid-cols-2 gap-2">
        {livraison.boutique?.name && (
          <div>
            <p className="text-xs font-semibold text-gray-800 mb-1">Boutique</p>
            <div className="flex items-start gap-2">
              {livraison.boutique?.coverImageUrl && (
                <img
                  src={livraison.boutique?.coverImageUrl}
                  alt={`Avatar de ${livraison.boutique?.name}`}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <div className="text-xs text-gray-700">
                <p className="truncate">{livraison.boutique?.name}</p>
                <p className="flex items-center gap-1 truncate">
                  <Phone size={12} />
                  {livraison.boutique?.phone
                    ? livraison.boutique.phone
                    : livraison.boutique?.owner?.phone
                      ? livraison.boutique.owner.phone
                      : "Numéro inconnu"}
                </p>
              </div>
            </div>
          </div>
        )}

        {livraison.client?.fullname && (
          <div>
            <p className="text-xs font-semibold text-gray-800 mb-1">Client</p>
            <div className="flex items-start gap-2">
              {livraison.client?.avatarUrl && (
                <img
                  src={livraison.client?.avatarUrl}
                  alt={`Avatar de ${livraison.client?.fullname}`}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <div className="text-xs text-gray-700">
                <p className="truncate">{livraison.client?.fullname}</p>
                <p className="flex items-center gap-1 truncate"><Phone size={12} /> {livraison.client?.phone}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm flex items-center gap-1 justify-center text-gray-700">
        <ClockIcon size={14} /> À livrer avant {heureLivraison}
      </div>

      <div className="flex items-center border border-gray-300 rounded-full overflow-hidden mt-2">
        <input
          type="text"
          placeholder="Code de validation"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-grow px-4 py-2 text-sm text-gray-700 focus:outline-none"
        />
        <button
          onClick={onSubmit}
          className="bg-[#ed354f] text-white text-sm font-medium px-6 py-2 rounded-full"
        >
          Livrer
        </button>
      </div>
    </Card>
  );
}

function HistoriqueLivraisons() {
  return (
    <Card>
      <p className="text-sm text-gray-500">Historique</p>
      <div className="text-sm">✅ CMD-058310 livrée à 11h10</div>
      <div className="text-sm">✅ CMD-058299 livrée à 09h45</div>
    </Card>
  );
}

export default function Tournee() {
  const [activeTab, setActiveTab] = useState("prochaine");
  const [prochaineLivraison, setProchaineLivraison] = useState(null);
  const [code, setCode] = useState("");
  const token = useUserStore(state => state.token);

  useEffect(() => {
    const fetchLivraison = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/livreur/preparing`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setProchaineLivraison(data[0] || null);
      } catch (err) {
        console.error("Erreur récupération livraison :", err);
      }
    };
    fetchLivraison();
  }, [token]);

  const handleLivrer = async () => {
    if (!prochaineLivraison || !code) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${prochaineLivraison._id}/mark-delivered`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Livraison confirmée !");
        setProchaineLivraison(null);
        setCode("");
      } else {
        alert("❌ Erreur : " + data.message);
      }
    } catch (err) {
      console.error("❌ Erreur livraison :", err);
      alert("❌ Erreur serveur.");
    }
  };

  return (
    <>
      <div className="p-4">
        <main className="max-w-md mx-auto space-y-4">
          <section>
            <div className="mb-4 overflow-x-auto whitespace-nowrap no-scrollbar flex gap-2 px-1">
              {tabs.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-4 py-1.5 rounded-full border text-sm ${
                    activeTab === key
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-3 mt-2">
              {activeTab === "prochaine" && (
                <ProchaineLivraison
                  livraison={prochaineLivraison}
                  code={code}
                  setCode={setCode}
                  onSubmit={handleLivrer}
                />
              )}
              {activeTab === "historique" && <HistoriqueLivraisons />}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
