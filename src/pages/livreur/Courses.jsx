import { useState, useEffect, useCallback, useRef } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import {
  Home,
  LocateIcon,
  RouteIcon,
  StoreIcon,
  MapPinIcon,
  ClockIcon,
  NavigationIcon,
  CreditCardIcon,
  TruckIcon,
  PackageIcon,
  HardDriveIcon,
  Box,
  Phone,
  ScaleIcon,
} from "lucide-react";
import useUserStore from "../../stores/userStore";
import Card from "../../components/ui/Card";

export default function Courses() {
  const token = useUserStore(state => state.token);

  const [orders, setOrders] = useState([]);
  const [filterType, setFilterType] = useState("autour"); // "autour" ou "itineraire"
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [departSuggestions, setDepartSuggestions] = useState([]);
  const [adresseSuggestions, setAdresseSuggestions] = useState([]);
  const [coordsDepart, setCoordsDepart] = useState(null);
  const [coordsArrivee, setCoordsArrivee] = useState(null);
  const [coordsAutour, setCoordsAutour] = useState(null);
  const [rayon, setRayon] = useState("5"); // en km, string pour URLSearchParams

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const modalRef = useRef(null);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedOrder(null);
  }, []);

  const closeModalWithAnimation = () => {
    if (modalRef.current?.startExit) {
      modalRef.current.startExit();
    } else {
      closeModal(); // fallback
    }
  };

  const openModal = useCallback((order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  }, []);

  // Fonction pour fetch suggestions d'adresse
  const fetchSuggestions = async (query, setSuggestions) => {
    if (query.length > 3) {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}`);
        const dataAPI = await res.json();
        setSuggestions(dataAPI.features || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Effet pour charger les commandes selon filtre et coordonnées
  useEffect(() => {
    const fetchOrders = async () => {
      let url = `${import.meta.env.VITE_API_URL}/orders/livreur/pending`;
      const params = new URLSearchParams();
      const rayonFloat = parseFloat(rayon);
      let useFilter = false;

      if (filterType === "autour") {
        if (coordsAutour?.lat && coordsAutour?.lon && !isNaN(rayonFloat)) {
          params.append("filterType", "autour");
          params.append("lat", coordsAutour.lat);
          params.append("lon", coordsAutour.lon);
          params.append("rayon", rayonFloat);
          useFilter = true;
        }
      } else if (filterType === "itineraire") {
        if (
          coordsDepart?.lat && coordsDepart?.lon &&
          coordsArrivee?.lat && coordsArrivee?.lon &&
          !isNaN(rayonFloat)
        ) {
          params.append("filterType", "itineraire");
          params.append("latDepart", coordsDepart.lat);
          params.append("lonDepart", coordsDepart.lon);
          params.append("latArrivee", coordsArrivee.lat);
          params.append("lonArrivee", coordsArrivee.lon);
          params.append("rayon", rayonFloat);
          useFilter = true;
        }
      }

      if (useFilter && params.toString()) {
        url += `?${params.toString()}`;
      }

      try {
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !Array.isArray(data)) {
          console.error("Erreur API ou réponse inattendue :", data);
          setOrders([]);
          return;
        }
        setOrders(data);
      } catch (err) {
        console.error("Erreur lors du chargement des commandes :", err);
        setOrders([]);
      }
    };

    fetchOrders();
  }, [coordsAutour, filterType, coordsDepart, coordsArrivee, rayon, token]);

  // Reset des filtres lors du changement de mode
  const handleFilterTypeChange = (newFilterType) => {
    setFilterType(newFilterType);
    setDepart("");
    setArrivee("");
    setDepartSuggestions([]);
    setAdresseSuggestions([]);
    setCoordsDepart(null);
    setCoordsArrivee(null);
    setCoordsAutour(null);
    setRayon("5");
  };

  // Fonction pour accepter une commande
  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/accept-delivery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Erreur : ${errorData.error || "Impossible d'accepter la commande"}`);
        return;
      }
      const data = await res.json();
      alert("Commande acceptée !");
      
      setOrders((prev) => prev.filter(order => order._id !== orderId));
      closeModalWithAnimation();
    } catch (error) {
      alert("Erreur réseau lors de l’acceptation de la commande.");
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-black">
          <span className="text-green-600 text-xl">{orders.length}</span>{" "}
          <span className="text-sm font-medium text-gray-700">annonces</span>
        </h1>
        <div className="flex gap-2">
          {filterType === "itineraire" ? (
            <button
              onClick={() => handleFilterTypeChange("autour")}
              className="px-4 py-4 rounded-full border text-sm transition flex items-center gap-2 bg-black text-white"
              aria-label="Filtrer par itinéraire"
            >
              <RouteIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFilterTypeChange("itineraire")}
              className="px-4 py-4 rounded-full border text-sm transition flex items-center gap-2 bg-white text-gray-700"
              aria-label="Filtrer autour d'une adresse"
            >
              <LocateIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filterType === "itineraire" ? (
        <div className="flex flex-col sm:flex-row gap-3 mt-3 mb-5 px-1">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RouteIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse de départ"
              value={depart}
              onChange={(e) => {
                const value = e.target.value;
                setDepart(value);
                fetchSuggestions(value, setDepartSuggestions);
              }}
              className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
              autoComplete="off"
            />
            {departSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto text-sm">
                {departSuggestions.map((sug) => (
                  <li
                    key={sug.properties.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDepart(sug.properties.label);
                      setDepartSuggestions([]);
                      const [lon, lat] = sug.geometry.coordinates;
                      setCoordsDepart({ lat, lon });
                    }}
                  >
                    {sug.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <RouteIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse d’arrivée"
              value={arrivee}
              onChange={(e) => {
                const value = e.target.value;
                setArrivee(value);
                fetchSuggestions(value, setAdresseSuggestions);
              }}
              className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
              autoComplete="off"
            />
            {adresseSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto text-sm">
                {adresseSuggestions.map((sug) => (
                  <li
                    key={sug.properties.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArrivee(sug.properties.label);
                      setAdresseSuggestions([]);
                      const [lon, lat] = sug.geometry.coordinates;
                      setCoordsArrivee({ lat, lon });
                    }}
                  >
                    {sug.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-row flex-nowrap items-center gap-2 mt-3 mb-5 px-1">
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <LocateIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Adresse autour de..."
              value={arrivee}
              onChange={(e) => {
                const value = e.target.value;
                setArrivee(value);
                fetchSuggestions(value, setAdresseSuggestions);
              }}
              className="w-full pl-10 pr-4 py-2 text-[16px] border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
              autoComplete="off"
            />
            {adresseSuggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto text-sm">
                {adresseSuggestions.map((sug) => (
                  <li
                    key={sug.properties.id}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArrivee(sug.properties.label);
                      setAdresseSuggestions([]);
                      const [lon, lat] = sug.geometry.coordinates;
                      setCoordsAutour({ lat, lon });
                    }}
                  >
                    {sug.properties.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            type="number"
            min={1}
            max={30}
            placeholder="Rayon"
            value={rayon}
            onChange={(e) => setRayon(e.target.value.replace(/[^\d.]/g, ""))}
            className="border border-gray-300 rounded-full px-4 py-2 w-20 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#ed354f] bg-white"
          />
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 mt-6">Aucune commande en attente.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const totalItems = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
            return (
              <Card
                key={order._id}
                title={order.boutiqueNom}
                action={
                  <span className="text-[#ed354f] font-bold text-sm">
                    {order.totalLivraison.toFixed(2)} €
                  </span>
                }
                delay={index * 80}
                onClick={() => openModal(order)}
                className="cursor-pointer"
              >
                <div>• {order.boutiqueAddress}</div>
                <div>• {order.deliveryAddress}</div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    {order.estimatedDelayFormatted} ({order.distanceKm} km)
                  </span>
                  <span className="border px-3 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border-gray-300">
                    {order.vehiculeRecommande}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal ref={modalRef} open={modalOpen} onClose={closeModal}>
        {selectedOrder ? (
          <div className="flex flex-col max-h-[70vh]">
            {/* Section titre fixe */}
            <header className="sticky top-0 bg-white z-20 px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Détails de la commande</h3>
            </header>

            {/* Section contenu scrollable */}
            <main className="flex-1 overflow-auto p-4 space-y-6 text-sm">
              {/* Résumé rapide en haut avec proposition livraison en premier */}
              <div
                className="max-w-md w-full mx-auto bg-[#ed354f]/10 rounded-xl px-5 py-4 shadow-lg border border-[#ed354f] flex flex-row gap-5 items-start"
              >
                {/* Colonne gauche image */}
                <div
                  className="w-[100px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden border border-gray-300 shadow-md ring-1 ring-[#ed354f]/30 bg-white flex items-center justify-center"
                >
                  {selectedOrder.boutiqueCoverUrl ? (
                    <img
                      src={selectedOrder.boutiqueCoverUrl}
                      alt={`Photo de la boutique ${selectedOrder.boutiqueNom}`}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs select-none px-2 text-center">
                      Pas d’image
                    </div>
                  )}
                </div>

                {/* Colonne droite infos */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Prix livraison tout en haut à droite */}
                  <div className="flex justify-end mb-4">
                    <div
                      className="flex items-center gap-2 bg-[#ed354f]/10 text-[#ed354f] font-extrabold text-xl tracking-wide rounded-full px-4 py-2 select-none shadow-sm min-w-[96px] justify-center ring-1 ring-[#ed354f]/40 drop-shadow-sm leading-none whitespace-nowrap"
                      aria-label="Prix livraison"
                    >
                      <CreditCardIcon className="w-6 h-6" />
                      <span>{selectedOrder.totalLivraison.toFixed(2)} €</span>
                    </div>
                  </div>

                  {/* Infos complémentaires sous le prix, alignées et centrées */}
                  <div className="flex flex-nowrap gap-3 justify-between mt-1 text-center">
                    <div className="flex flex-col items-center min-w-[36px]">
                      <ClockIcon className="w-5 h-5 text-gray-600" aria-label="Délai estimé" />
                      <span className="text-gray-700 font-semibold text-xs truncate">{selectedOrder.estimatedDelayFormatted}</span>
                    </div>
                    <div className="flex flex-col items-center min-w-[36px]">
                      <NavigationIcon className="w-5 h-5 text-gray-600" aria-label="Distance" />
                      <span className="text-gray-700 font-semibold text-xs truncate">{selectedOrder.distanceKm} km</span>
                    </div>
                    <div className="flex flex-col items-center min-w-[36px]">
                      <TruckIcon className="w-5 h-5 text-gray-600" aria-label="Véhicule recommandé" />
                      <span className="text-gray-700 font-semibold text-xs truncate">{selectedOrder.vehiculeRecommande}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Articles & Logistique */}
              <section className="bg-white/90 rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">
                  {selectedOrder.items ? selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0) : 0} Articles
                </h3>
                <div className="flex flex-wrap justify-between gap-4 items-center">
                  <div className="flex items-center gap-1">
                    <HardDriveIcon className="w-5 h-5 text-gray-600" aria-label="Poids total" />
                    <span className="text-gray-700">{selectedOrder.poidsTotalKg} kg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Box className="w-5 h-5 text-gray-600" aria-label="Volume total" />
                    <span className="text-gray-700">{selectedOrder.volumeTotalM3} m³</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ScaleIcon className="w-5 h-5 text-gray-600" aria-label="Poids facturé" />
                    <span className="text-gray-700">{selectedOrder.poidsFacture} kg</span>
                  </div>
                </div>
              </section>

              {/* Section Boutique */}
              <section className="bg-white/90 rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Boutique</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <StoreIcon className="w-5 h-5 text-gray-600" aria-label="Boutique" />
                    <span className="truncate">{selectedOrder.boutiqueNom}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-600" aria-label="Adresse boutique" />
                    <span className="truncate">{selectedOrder.boutiqueAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-600" aria-label="Téléphone boutique" />
                    <span>{selectedOrder.boutiqueTelephone || "Non renseignée"}</span>
                  </div>
                </div>
              </section>

              {/* Section Livraison */}
              <section className="bg-white/90 rounded-lg p-4 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">Livraison</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Home className="w-5 h-5 text-gray-600" aria-label="Client" />
                    <span className="truncate">{selectedOrder.clientNom || "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-gray-600" aria-label="Adresse livraison" />
                    <span className="truncate">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-600" aria-label="Téléphone client" />
                    <span>{selectedOrder.clientTelephone || "Non renseignée"}</span>
                  </div>
                </div>
              </section>
            </main>

            {/* Section boutons fixes */}
            <footer className="sticky bottom-0 bg-white z-20 px-4 py-3 border-t border-gray-200 flex gap-4 justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  closeModalWithAnimation();
                }}
              >
                Passer
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  handleAcceptOrder(selectedOrder._id);
                }}
              >
                Accepter
              </Button>
            </footer>
          </div>
        ) : (
          <p>Chargement...</p>
        )}
      </Modal>
    </div>
  );
}