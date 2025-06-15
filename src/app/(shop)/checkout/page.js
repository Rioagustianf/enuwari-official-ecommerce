"use client";
import { useContext, useEffect } from "react";
import { Container, Typography, Breadcrumbs, Link } from "@mui/material";
import { Home } from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import Checkout from "@/components/shop/Checkout";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems } = useContext(CartContext);
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }
  }, [user, loading, cartItems, router]);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" sx={{ display: "flex", alignItems: "center" }}>
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Beranda
          </Link>
          <Link href="/cart">Keranjang</Link>
          <Typography color="text.primary">Checkout</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        <Checkout />
      </Container>
      <Footer />
    </>
  );
}
