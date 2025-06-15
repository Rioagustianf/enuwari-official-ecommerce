"use client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { SearchProvider } from "@/context/SearchContext";
import theme from "@/styles/theme";
import Script from "next/script";
import "@/app/globals.css";
// Import axios config untuk debugging
import "@/lib/axios";

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <title>Enuwari Official - Fashion Store</title>
        <meta name="description" content="Toko fashion online terpercaya" />
      </head>
      <body>
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        />
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            <AuthProvider>
              <SearchProvider>
                <CartProvider>
                  <WishlistProvider>{children}</WishlistProvider>
                </CartProvider>
              </SearchProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
