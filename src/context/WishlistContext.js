"use client";
import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";
import { NotificationContext } from "./NotificationContext";
import axios from "axios";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const { showSuccess, showError } = useContext(NotificationContext);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await axios.get("/api/wishlist");
      setWishlistItems(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (product) => {
    if (!user) {
      showError("Silakan login terlebih dahulu");
      return false;
    }

    try {
      const response = await axios.post("/api/wishlist", {
        productId: product.id,
      });

      if (response.data.wishlist) {
        setWishlistItems((prev) => [...prev, response.data.wishlist]);
        showSuccess("Produk ditambahkan ke wishlist");
      } else {
        // Product was removed from wishlist
        setWishlistItems((prev) =>
          prev.filter((item) => item.product.id !== product.id)
        );
        showSuccess("Produk dihapus dari wishlist");
      }

      return true;
    } catch (error) {
      showError(error.response?.data?.error || "Gagal mengelola wishlist");
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.post("/api/wishlist", { productId });
      setWishlistItems((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      showSuccess("Produk dihapus dari wishlist");
    } catch (error) {
      showError("Gagal menghapus dari wishlist");
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product.id === productId);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistCount,
    fetchWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export { WishlistContext };
