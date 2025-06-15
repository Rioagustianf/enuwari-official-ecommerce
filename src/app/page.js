"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductCard from "@/components/shop/ProductCard";
import axios from "axios";

export default function HomePage() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
    fetchCategories();
    fetchBanners();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await axios.get("/api/products?featured=true&limit=8");
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      const response = await axios.get("/api/banners");
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <Box sx={{ mb: 4 }}>
        {banners.length > 0 && (
          <Card>
            <CardMedia
              component="img"
              height="400"
              image={banners[0].image}
              alt={banners[0].title}
            />
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h3" gutterBottom>
                {banners[0].title}
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {banners[0].subtitle}
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push("/products")}
              >
                Belanja Sekarang
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      <Container maxWidth="lg">
        {/* Categories Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            Kategori Produk
          </Typography>
          <Grid container spacing={3}>
            {categories.map((category) => (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={category.id}>
                <Card
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    router.push(`/products/category/${category.slug}`)
                  }
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={category.image || "/placeholder.jpg"}
                    alt={category.name}
                  />
                  <CardContent>
                    <Typography variant="h6" textAlign="center">
                      {category.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Products */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            Produk Unggulan
          </Typography>
          <Grid container spacing={3}>
            {featuredProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={product.id}>
                <ProductCard product={product} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push("/products")}
            >
              Lihat Semua Produk
            </Button>
          </Box>
        </Box>

        {/* WhatsApp Contact */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Butuh Bantuan?
          </Typography>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={() =>
              window.open(
                `https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP}`,
                "_blank"
              )
            }
          >
            Hubungi Admin via WhatsApp
          </Button>
        </Box>
      </Container>

      <Footer />
    </>
  );
}
