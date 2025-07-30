import axios from "axios";

/**
 * Utilitaire pour gérer proprement le chargement et les erreurs.
 */
export const withLoading = async (set, fn) => {
  set({ loading: true, error: null });
  try {
    await fn();
  } catch (err) {
    console.error("❌ Erreur dans l'action :", err);
    set({ error: err?.response?.data?.error || "Erreur serveur" });
  } finally {
    set({ loading: false });
  }
};

/**
 * 🔄 Récupérer les commandes de la boutique.
 */
export const fetchBoutiqueOrders = async (token, set) => {
  await withLoading(set, async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/boutique/statut`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ orders: res.data });
  });
};

/**
 * 📜 Récupérer les commandes client.
 */
export const fetchClientOrders = async (token, set) => {
  await withLoading(set, async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ orders: res.data });
  });
};

/**
 * 🚴‍♂️ Récupérer les commandes disponibles pour les livreurs.
 */
export const fetchOrdersLivreur = async (token, set, get) => {
  await withLoading(set, async () => {
    const { filtreActif, coordsAutour, rayonAutour } = get();

    const params = {};
    if (filtreActif === "autour" && coordsAutour) {
      params.coords = `${coordsAutour.lat},${coordsAutour.lon}`;
      params.rayon = rayonAutour;
    }

    const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/livreur/pending`, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    set({ orders: res.data });
  });
};

/**
 * 🧭 Récupérer les commandes assignées au livreur.
 */
export const fetchOrdersAssignedLivreur = async (token, set) => {
  await withLoading(set, async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/livreur/assigned`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ orders: res.data });
  });
};

/**
 * 📦 Marquer une commande comme en préparation.
 */
export const markAsPreparing = async (orderId, token, set, get) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/orders/${orderId}/preparing`,
      { status: "preparing" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const currentOrders = get().orders;
    set({
      orders: currentOrders.map((o) =>
        o._id === orderId ? { ...o, status: "preparing" } : o
      ),
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour (preparing) :", err);
    throw err;
  }
};

/**
 * 📦 Marquer une commande comme récupéré.
 */
export const markOrderOnTheWay = async (orderId, token, set, get) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/orders/${orderId}/mark-on-the-way`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const currentOrders = get().orders;
    set({
      orders: currentOrders.map((o) =>
        o._id === orderId ? { ...o, status: "on_the_way" } : o
      ),
    });
  } catch (err) {
    console.error("❌ Erreur mise à jour (on-the-way) :", err);
    throw err;
  }
};

/**
 * 🚚 Marquer une commande comme livrée.
 */
export const markAsDelivered = async (orderId, code, token, set, get) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/orders/${orderId}/mark-delivered`,
      { code },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const currentOrders = get().orders;
    set({
      orders: currentOrders.map((o) =>
        o._id === orderId ? { ...o, status: "delivered" } : o
      ),
    });
  } catch (err) {
    console.error("❌ Erreur livraison :", err);
    throw err;
  }
};

/**
 * ❌ Annuler une commande.
 */
export const cancelOrder = async (orderId, token, set, get) => {
  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const currentOrders = get().orders;
    set({
      orders: currentOrders.filter((o) => o._id !== orderId),
    });
  } catch (err) {
    console.error("❌ Erreur annulation :", err);
    throw err;
  }
};