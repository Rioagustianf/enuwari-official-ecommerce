"use client";
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Tambahkan timeout dan error handling yang lebih baik
      const response = await axios.get("/api/auth/me", {
        timeout: 10000, // 10 detik timeout
        validateStatus: (status) => {
          // Anggap 401 sebagai response valid (user belum login)
          return status < 500;
        },
      });

      if (response.status === 200 && response.data.success) {
        setUser(response.data.user);
      } else if (response.status === 401) {
        // User belum login, ini normal
        setUser(null);
      } else {
        console.warn(
          "Unexpected auth response:",
          response.status,
          response.data
        );
        setUser(null);
        console.warn(
          "User set to null karena response status:",
          response.status
        );
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        console.error("Auth check timeout");
      } else if (error.response?.status === 401) {
        // User belum login, ini normal
        setUser(null);
      } else {
        console.error("Auth check error:", error.message);
        setUser(null);
        console.warn("User set to null karena error:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Validasi input
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: "Email dan password harus diisi",
        };
      }

      const loginData = {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      };

      const response = await axios.post("/api/auth/login", loginData, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return {
          success: false,
          error: "Response tidak valid dari server",
        };
      }
    } catch (error) {
      let errorMessage = "Login gagal";

      if (error.code === "ECONNABORTED") {
        errorMessage = "Koneksi timeout, coba lagi";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = "Data login tidak valid";
      } else if (error.response?.status === 401) {
        errorMessage = "Email atau password salah";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server sedang bermasalah, coba lagi nanti";
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registrasi gagal",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { timeout: 5000 });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/");
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
