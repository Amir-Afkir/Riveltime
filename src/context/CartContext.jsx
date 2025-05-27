// ✅ src/context/CartContext.jsx
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.product === item.product && i.merchant === item.merchant
      );

      if (existingIndex !== -1) {
        return prev.map((entry, index) =>
          index === existingIndex
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

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

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, totalQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);