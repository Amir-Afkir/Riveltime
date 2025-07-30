// ✅ Version Zustandisée de BottomSheetTournee.jsx
import { MapPinIcon, PackageIcon, ClockIcon, Phone, TruckIcon, MapIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Card from "./Card";
import Button from "./Button";
import useUserStore from "../../stores/userStore";
import useOrderStore from "../../stores/orderStore";

const tabs = [
  { key: "en_cours", label: "En cours" },
  { key: "historique", label: "Historique" },
];

function ProchaineLivraison({ livraison, code, setCode, onSubmit, loading }) {
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
      {/* Status badge */}
      {["preparing", "on_the_way"].includes(livraison.status) && (
        <span className="inline-block text-sm font-medium mb-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800">
          {livraison.status === "preparing"
            ? "📦 À récupérer"
            : livraison.status === "on_the_way"
            ? "➡️ Livraison à effectuer"
            : ""}
        </span>
      )}
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
                  {livraison.boutique?.phone || livraison.boutique?.owner?.phone || "Numéro inconnu"}
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
        livraison.status === "preparing" ? (
          <Button
            variant="secondary"
            onClick={() => onSubmit("mark-on-the-way", livraison._id)}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
                Traitement...
              </div>
            ) : (
              "Commande récupérée"
            )}
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
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin" />
              ) : (
                "Livrer"
              )}
            </Button>
          </div>
        )
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

export default function BottomSheetTournee() {
  const [activeFilter, setActiveFilter] = useState("en_cours");
  const [code, setCode] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const token = useUserStore(state => state.token);
  const {
    orders: livraisons,
    markAsDelivered,
    markAsPreparing,
    recalculerOrderedSteps,
    loading: loadingOrders,
    orderedSteps,
    map,
  } = useOrderStore();

  // Fly to the first ordered step on orderedSteps update
  useEffect(() => {
    if (orderedSteps?.length > 0 && map?.current?.flyTo) {
      const step = orderedSteps[0];
      map.current.flyTo({ center: [step.lon, step.lat], zoom: 14 });
    }
  }, [orderedSteps]);

  // Backup: recalculate orderedSteps on mount
  useEffect(() => {
    recalculerOrderedSteps();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const handleLivrer = async (action, orderId) => {
    if (!orderId || (action === "mark-delivered" && !code.trim())) {
      if (action === "mark-delivered") toast.error("❌ Veuillez saisir le code de validation.");
      return;
    }
    setLoading(true);
    try {
      if (action === "mark-on-the-way") {
        await markAsPreparing(orderId, token);
      } else {
        await markAsDelivered(orderId, code, token);
        setCode("");
      }
    } catch (err) {
      toast.error("❌ Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 left-1/2 transform -translate-x-1/2 mb-[env(safe-area-inset-bottom)] px-4 py-2 z-30 rounded-full text-sm bg-[#ed354f] !text-white font-medium shadow-lg transition-shadow duration-300 hover:shadow-[gray]/40 flex items-center gap-1"
      >
        {isOpen ? <><MapIcon size={16} /> Carte</> : <><TruckIcon size={16} /> Livraison</>}
      </button>

      <div
        className={`fixed inset-0 z-20 pb-10 bg-[#f3f4f6] shadow-lg transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain ${
          isOpen ? 'translate-y-0' : 'translate-y-[calc(100%)]'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div className="p-4">
          <main className="max-w-md mx-auto space-y-4 mt-12 mb-20">
            <section>
              <div className="mb-4 flex items-center justify-between gap-2 px-1 flex-wrap">
                <h1 className="text-lg font-semibold text-black">
                  <span className="text-green-600 text-xl">{livraisons.length}</span>{" "}
                  <span className="text-sm font-medium text-gray-700">livraisons</span>
                </h1>
                <div className="overflow-x-auto no-scrollbar flex gap-2">
                  {tabs.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      className={`px-4 py-1.5 rounded-full border text-sm ${
                        activeFilter === key ? "bg-black text-white" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 mt-2">
                <>
                  {activeFilter === "en_cours" && (
                    livraisons.filter(l => ["accepted", "preparing", "on_the_way"].includes(l.status)).length > 0 ? (
                      livraisons.filter(l => ["accepted", "preparing", "on_the_way"].includes(l.status)).map(livraison => (
                        <ProchaineLivraison
                          key={livraison._id}
                          livraison={livraison}
                          code={code}
                          setCode={setCode}
                          onSubmit={handleLivrer}
                          loading={loading}
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
                </>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}