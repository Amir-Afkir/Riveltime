import { apiClient, withLoadingAndError } from "../utils/api"; // Utiliser apiClient et withLoadingAndError

/**
 * 🔄 Récupérer les commandes de la boutique.
 */
export const fetchBoutiqueOrders = async (token, set) => {
  await withLoadingAndError(set, async () => {
    const res = await apiClient.get('/orders/boutique/statut'); // Token via intercepteur
    set({ orders: res.data });
  });
};

/**
 * 📜 Récupérer les commandes client.
 */
export const fetchClientOrders = async (token, set) => {
  await withLoadingAndError(set, async () => {
    const res = await apiClient.get('/orders/me');
    set({ orders: res.data });
  });
};

/**
 * 🚴‍♂️ Récupérer les commandes disponibles pour les livreurs.
 */
export const fetchOrdersLivreur = async (token, set, get) => {
  await withLoadingAndError(set, async () => {
    const { filtreActif, coordsAutour, rayonAutour } = get();

    const params = {};
    if (filtreActif === "autour" && coordsAutour) {
      params.coords = `${coordsAutour.lat},${coordsAutour.lon}`;
      params.rayon = rayonAutour;
    }

    const res = await apiClient.get('/orders/livreur/pending', {
      params,
    });
    set({ orders: res.data });
  });
};

/**
 * 🧭 Récupérer les commandes assignées au livreur.
 */
export const fetchOrdersAssignedLivreur = async (token, set) => {
  await withLoadingAndError(set, async () => {
    const res = await apiClient.get('/orders/livreur/assigned');
    set({ orders: res.data });
  });
};

/**
 * 📦 Marquer une commande comme en préparation.
 */
export const markAsPreparing = async (orderId, token, set, get) => {
  await withLoadingAndError(set, async () => {
    await apiClient.put(`/orders/${orderId}/preparing`, { status: "preparing" });

    const currentOrders = get().orders;
    set({
      orders: currentOrders.map((o) =>
        o._id === orderId ? { ...o, status: "preparing" } : o
      ),
    });
  });
};

/**
 * 📦 Marquer une commande comme récupéré (en route).
 */
export const markOrderOnTheWay = async (orderId, token, set, get) => {
  await withLoadingAndError(set, async () => {
    await apiClient.put(`/orders/${orderId}/mark-on-the-way`);

    const currentOrders = get().orders;
    set({
      orders: currentOrders.map((o) =>
        o._id === orderId ? { ...o, status: "on_the_way" } : o
      ),
    });
  });
};

/**
 * 🚚 Marquer une commande comme livrée.
 */
export const markAsDelivered = async (orderId, code, token, set, get) => {
  await withLoadingAndError(set, async () => {
    await apiClient.put(`/orders/${orderId}/mark-delivered`, { code });

    const currentOrders = get().orders;
    set({
      orders: currentOrders.map((o) =>
        o._id === orderId ? { ...o, status: "delivered" } : o
      ),
    });
  });
};

/**
 * ❌ Annuler une commande.
 */
export const cancelOrder = async (orderId, token, set, get) => {
  await withLoadingAndError(set, async () => {
    await apiClient.put(`/orders/${orderId}/cancel`);

    const currentOrders = get().orders;
    set({
      orders: currentOrders.filter((o) => o._id !== orderId),
    });
  });
};