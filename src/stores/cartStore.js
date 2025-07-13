import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useCartStore = create(devtools(persist((set, get) => ({
  cart: [],
  orders: [],

  addToCart: ({ product, merchant }) => {
    const cart = get().cart;
    const productId = product._id;
    const boutiqueId = product.boutique;

    const existingIndex = cart.findIndex(
      (item) => item.product._id === productId && item.product.boutique === boutiqueId
    );

    const updatedCart = [...cart];
    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += 1;
    } else {
      updatedCart.push({ product, merchant, quantity: 1 });
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

  placeOrder: () => {
    const cart = get().cart;
    const orders = get().orders;

    const newOrder = {
      id: Date.now(),
      items: cart,
      total: cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
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