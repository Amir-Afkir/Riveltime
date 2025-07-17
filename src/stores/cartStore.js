import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useCartStore = create(devtools(persist((set, get) => ({
  cart: [],
  orders: [],

  addToCart: ({ product, merchant }) => {
    const cart = get().cart;
    const productId = product._id;
    const boutiqueId = typeof product.boutique === "object" ? product.boutique._id : product.boutique;

    const existingIndex = cart.findIndex(
      (item) =>
        item.product._id === productId &&
        item.product.boutique === boutiqueId
    );

    const updatedCart = [...cart];
    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      const newProduct = {
        ...product,
        boutique: boutiqueId,
        boutiqueDetails: product.boutiqueDetails || (typeof product.boutique === "object" ? product.boutique : undefined),
      };
      updatedCart.push({ product: newProduct, merchant, quantity: 1 });
    }

    set({ cart: updatedCart });
  },

  removeFromCart: (itemToRemove) => {
    const cart = get().cart;
    const updatedCart = cart.flatMap((entry) => {
      const isSameProduct = entry.product === itemToRemove.product;
      const isSameMerchant = entry.merchant === itemToRemove.merchant;

      if (isSameProduct && isSameMerchant) {
        return entry.quantity > 1
          ? [{ ...entry, quantity: entry.quantity - 1 }]
          : [];
      }

      return [entry];
    });

    set({ cart: updatedCart });
  },

  placeOrder: (cartPayload) => {
    const cart = cartPayload || get().cart;
    const orders = get().orders;

    const total = cart.reduce((sum, item) => {
      const prixProduit = item.product.price * item.quantity;
      const livraison = item.livraison || 0;
      const participation = item.participation || 0;
      return sum + prixProduit + (livraison - participation);
    }, 0);

    const newOrder = {
      id: Date.now(),
      items: cart,
      total,
      date: new Date().toLocaleDateString(),
      status: "En cours",
    };

    set({ orders: [...orders, newOrder], cart: [] });
  },

  updateOrderStatus: (orderId, newStatus) => {
    const updatedOrders = get().orders.map((order) =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    set({ orders: updatedOrders });
  },

  totalQuantity: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
}), {
  name: "cart-storage", // persist dans localStorage
})));

export default useCartStore;