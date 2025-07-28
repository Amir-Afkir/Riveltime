import { PackageIcon, ClockIcon, Box, MapPinIcon, Phone } from "lucide-react";
import { useState, useEffect } from "react";
import Title from "../../components/ui/Title";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import useUserStore from "../../stores/userStore";

const tabs = [
  { key: "en_cours", label: "En cours" },
  { key: "historique", label: "Historique" },
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
        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
          livraison.status === "accepted"
            ? "bg-blue-100 text-blue-800"
            : livraison.status === "preparing"
            ? "bg-yellow-100 text-yellow-800"
            : livraison.status === "on_the_way"
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-700"
        }`}>
          {livraison.status === "accepted"
            ? "Acceptée"
            : livraison.status === "preparing"
            ? "Préparation"
            : livraison.status === "on_the_way"
            ? "En cours de livraison"
            : livraison.status}
        </span>
      </div>

      <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3 space-y-1 text-sm">
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-800">
            <MapPinIcon size={14} /> Adresse
          </div>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-0.5">
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
            <p className="text-sm font-semibold text-gray-800 mb-1">Boutique</p>
            <div className="flex items-start gap-2">
              {livraison.boutique?.coverImageUrl && (
                <img
                  src={livraison.boutique?.coverImageUrl}
                  alt={`Avatar de ${livraison.boutique?.name}`}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <div className="text-sm text-gray-700">
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
            <p className="text-sm font-semibold text-gray-800 mb-1">Client</p>
            <div className="flex items-start gap-2">
              {livraison.client?.avatarUrl && (
                <img
                  src={livraison.client?.avatarUrl}
                  alt={`Avatar de ${livraison.client?.fullname}`}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <div className="text-sm text-gray-700">
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

      {(livraison.status === "on_the_way" || livraison.status === "preparing") && (
        <>
          {livraison.status === "preparing" ? (
            <Button
              variant="secondary"
              onClick={() => onSubmit("mark-on-the-way", livraison._id)}
              className="w-full"
            >
              Commande récupérée
            </Button>
          ) : (
            <div className="flex items-center border border-gray-300 rounded-full overflow-hidden mt-2">
              <input
                type="text"
                placeholder="Code de validation"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-grow px-4 py-2 text-[16px] text-gray-700 focus:outline-none"
              />
              <Button
                variant="secondary"
                onClick={() => onSubmit("mark-delivered", livraison._id)}
              >
                Livrer
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function ListeLivraisonsParStatut({ livraisons, statut }) {
  const filtered = livraisons.filter(l => l.status === statut);
  if (filtered.length === 0) {
    return <Card><p className="text-sm text-gray-500">Aucune livraison pour ce statut</p></Card>;
  }
  return (
    <>
      {filtered.map(livraison => (
        <Card key={livraison._id} className="text-sm">
          <p className="font-semibold">Commande n° {livraison.orderNumber}</p>
          <p>Boutique : {livraison.boutique?.name}</p>
          <p>Client : {livraison.client?.fullname}</p>
          <p>Total livreur : {livraison.montantLivreur / 100} €</p>
        </Card>
      ))}
    </>
  );
}

export default function Tournee() {
  const [activeFilter, setActiveFilter] = useState("en_cours");
  const [livraisons, setLivraisons] = useState([]);
  const [code, setCode] = useState("");
  const token = useUserStore(state => state.token);

  useEffect(() => {
    const fetchLivraisons = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/livreur/assigned`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLivraisons(data);
      } catch (err) {
        console.error("Erreur récupération livraisons :", err);
      }
    };
    fetchLivraisons();
  }, [token]);

  const handleLivrer = async (action, orderId) => {
    if (!orderId || (action === "mark-delivered" && !code.trim())) {
      if (action === "mark-delivered") {
        alert("❌ Veuillez saisir le code de validation.");
      }
      return;
    }

    try {
      const url = `${import.meta.env.VITE_API_URL}/orders/${orderId}/${action}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: action === "mark-delivered" ? JSON.stringify({ code }) : null,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Livraison confirmée !");
        setLivraisons(prev => prev.filter(l => l._id !== orderId));
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
                  onClick={() => setActiveFilter(key)}
                  className={`px-4 py-1.5 rounded-full border text-sm ${
                    activeFilter === key
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-3 mt-2">
              {activeFilter === "en_cours" && (
                livraisons.filter(l => ["accepted", "preparing", "on_the_way"].includes(l.status)).length > 0 ? (
                  livraisons
                    .filter(l => ["accepted", "preparing", "on_the_way"].includes(l.status))
                    .map(livraison => (
                      <ProchaineLivraison
                        key={livraison._id}
                        livraison={livraison}
                        code={code}
                        setCode={setCode}
                        onSubmit={handleLivrer}
                      />
                    ))
                ) : (
                  <Card><p className="text-sm text-gray-500">Aucune livraison en cours</p></Card>
                )
              )}
              {activeFilter === "historique" && (
                <>
                  <ListeLivraisonsParStatut livraisons={livraisons} statut="delivered" />
                  <ListeLivraisonsParStatut livraisons={livraisons} statut="cancelled" />
                </>
              )}
            </div>
          </section>
        </main>
        <button
          className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg text-sm font-medium z-50
              
    bg-[#fde6ea]  
    shadow-lg border border-[#ed354f]
    flex items-center gap-2
    cursor-pointer
    transition-shadow duration-300
    hover:shadow-[#ed354f]/40
          "
          onClick={() => alert('🗺️ Carte à venir')}
        >
         <MapPinIcon/> Carte
        </button>
      </div>
    </>
  );
}
