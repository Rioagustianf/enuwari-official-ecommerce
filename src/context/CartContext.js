"use client";
import { createContext, useReducer, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CART":
      return action.payload;

    case "ADD_TO_CART":
      const existingItem = state.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size
      );

      if (existingItem) {
        return state.map((item) =>
          item.productId === action.payload.productId &&
          item.size === action.payload.size
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }

      return [...state, action.payload];

    case "UPDATE_QUANTITY":
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case "REMOVE_FROM_CART":
      return state.filter((item) => item.id !== action.payload.id);

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
};

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [cartItems, dispatch] = useReducer(cartReducer, []);

  useEffect(() => {
    const fetchCartFromDB = async () => {
      if (user) {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const dbCart = await res.json();
            const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
            const merged = mergeCart(localCart, dbCart);
            dispatch({ type: "LOAD_CART", payload: merged });
            localStorage.setItem("cart", JSON.stringify(merged));
            for (const item of merged) {
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: item.productId,
                  quantity: item.quantity,
                  size: item.size,
                }),
              });
            }
          }
        } catch (err) {
          // ignore
        }
      } else {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          dispatch({ type: "LOAD_CART", payload: JSON.parse(savedCart) });
        }
      }
    };
    fetchCartFromDB();
  }, [user]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  function mergeCart(local, db) {
    const map = new Map();
    [...local, ...db].forEach((item) => {
      const key = `${item.productId}-${item.size || "default"}`;
      if (!map.has(key)) {
        map.set(key, { ...item });
      } else {
        const prev = map.get(key);
        map.set(key, {
          ...item,
          quantity: Math.max(prev.quantity, item.quantity),
        });
      }
    });
    return Array.from(map.values());
  }

  const addToCart = async (product, quantity = 1, size = null) => {
    const cartItem = {
      id: `${product.id}-${size || "default"}`,
      productId: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.images ? JSON.parse(product.images)[0] : null,
      quantity,
      size,
      stock: product.stock,
    };
    dispatch({ type: "ADD_TO_CART", payload: cartItem });
    if (user) {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size,
        }),
      });
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    if (user) {
      const item = cartItems.find((i) => i.id === id);
      if (item) {
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItemId: item.dbId || item.id,
            quantity,
          }),
        });
      }
    }
  };

  const removeFromCart = async (id) => {
    dispatch({ type: "REMOVE_FROM_CART", payload: { id } });
    toast.success("Produk dihapus dari keranjang");
    if (user) {
      const item = cartItems.find((i) => i.id === id);
      if (item) {
        await fetch(`/api/cart?id=${item.dbId || item.id}`, {
          method: "DELETE",
        });
      }
    }
  };

  const clearCart = async () => {
    dispatch({ type: "CLEAR_CART" });
    if (user) {
      await fetch("/api/cart", { method: "DELETE" });
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartContext };
