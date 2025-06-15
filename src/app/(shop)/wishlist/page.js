"use client";
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  Breadcrumbs,
  Link,
  Alert,
} from "@mui/material";
import { Home, Delete, ShoppingCart, ArrowBack } from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ProductCard from "@/components/shop/ProductCard";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchWishlist();
    }
  }, [user, loading]);

  const fetchWishlist = async () => {
    try {
      const response = await axios.get("/api/wishlist");
      setWishlist(response.data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.post("/api/wishlist", { productId });
      setWishlist((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
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
          <Typography color="text.primary">Wishlist</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Wishlist Saya
        </Typography>

        {wishlist.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                Wishlist kosong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Belum ada produk yang ditambahkan ke wishlist
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => router.push("/products")}
              >
                Mulai Belanja
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {wishlist.length} produk dalam wishlist
            </Typography>

            <Grid container spacing={3}>
              {wishlist.map((item) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Box sx={{ position: "relative" }}>
                    <ProductCard product={item.product} />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "background.paper",
                        boxShadow: 1,
                        "&:hover": { bgcolor: "error.light", color: "white" },
                      }}
                      onClick={() => removeFromWishlist(item.product.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}
