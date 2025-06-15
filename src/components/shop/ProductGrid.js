"use client";
import { Box, Typography } from "@mui/material";
import { ShoppingBag } from "@mui/icons-material";
import ProductCard from "./ProductCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return (
      <Box sx={{ py: 8 }}>
        <LoadingSpinner message="Memuat produk..." />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 3,
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Oops! Terjadi Kesalahan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 3,
        }}
      >
        <ShoppingBag
          sx={{
            fontSize: 64,
            color: "text.disabled",
            mb: 2,
          }}
        />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Tidak Ada Produk Ditemukan
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Coba ubah filter atau kata kunci pencarian Anda
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
        },
        gap: 3,
      }}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Box>
  );
}
