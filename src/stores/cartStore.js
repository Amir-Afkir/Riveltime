// src/stores/cartStore.js
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useCartStore = create(
  devtools(
    persist(
      (set, get) => ({
        cart: [],
        orders: [],

        // ➕ Ajouter un produit au panier
        addToCart: ({ product, merchant }) => {
          const cart = get().cart;
          const productId = product._id;
          const boutiqueId =
            typeof product.boutique === "object"
              ? product.boutique._id
              : product.boutique;

          const existingItemIndex = cart.findIndex(
            (item) =>
              item.product._id === productId &&
              item.product.boutique === boutiqueId
          );

          let updatedCart;

          if (existingItemIndex !== -1) {
            updatedCart = cart.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            const newProduct = {
              ...product,
              boutique: boutiqueId,
            };
            updatedCart = [
              ...cart,
              { product: newProduct, merchant, quantity: 1 },
            ];
          }

          set({ cart: updatedCart });
        },

        // ➖ Retirer un produit du panier
        removeFromCart: (itemToRemove) => {
          const cart = get().cart;

          const updatedCart = cart
            .map((entry) => {
              if (
                entry.product._id === itemToRemove.product._id &&
                entry.merchant._id === itemToRemove.merchant._id
              ) {
                return { ...entry, quantity: entry.quantity - 1 };
              }
              return entry;
            })
            .filter((entry) => entry.quantity > 0);

          set({ cart: updatedCart });
        },

        // 🧾 Simuler une commande locale (non connectée au backend)
        placeOrder: (cartPayload) => {
          const cartToProcess = cartPayload || get().cart;

          const total = cartToProcess.reduce((sum, item) => {
            const prixProduit = item.product.price * item.quantity;
            const livraison = typeof item.livraison === "number" ? item.livraison : 0;
            const participation = typeof item.participation === "number" ? item.participation : 0;
            return sum + prixProduit + (livraison - participation);
          }, 0);

          const newOrder = {
            id: `ORDER-${Date.now()}`,
            items: cartToProcess,
            total,
            date: new Date().toISOString(),
            status: "En cours",
          };

          set((state) => ({
            orders: [...state.orders, newOrder],
            cart: [],
          }));
        },

        // 🔄 Mettre à jour le statut d'une commande simulée
        updateOrderStatus: (orderId, newStatus) => {
          const updatedOrders = get().orders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          );
          set({ orders: updatedOrders });
        },

        // 🔢 Total d’articles dans le panier
        totalQuantity: () =>
          get().cart.reduce((sum, item) => sum + item.quantity, 0),
      }),
      {
        name: "cart-storage", // 🔐 Persisté dans localStorage
      }
    )
  )
);

export default useCartStore;