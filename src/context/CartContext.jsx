// ✅ src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  function addToCart({ product, merchant }) {
    setCart((prevCart) => {
      const productId = product._id;
      const boutiqueId = product.boutique;

      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product._id === productId &&
          item.product.boutique === boutiqueId
      );

      if (existingItemIndex !== -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        };
        return updatedCart;
      }

      return [...prevCart, { product, merchant, quantity: 1 }];
    });
  }

  const removeFromCart = (itemToRemove) => {
    setCart((prev) =>
      prev.flatMap((entry) => {
        if (
          entry.product === itemToRemove.product &&
          entry.merchant === itemToRemove.merchant
        ) {
          if (entry.quantity > 1) {
            return [{ ...entry, quantity: entry.quantity - 1 }];
          }
          return [];
        }
        return [entry];
      })
    );
  };

  const placeOrder = () => {
    const newOrder = {
      id: Date.now(),
      items: cart,
      total: cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0),
      date: new Date().toLocaleDateString(),
      status: "En cours",
    };
    setOrders((prev) => [...prev, newOrder]);
    setCart([]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalQuantity, orders, placeOrder, updateOrderStatus }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);