"use client";
import { Grid, Box, Typography } from "@mui/material";
import ProductCard from "./ProductCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProductGrid({ products, loading, error }) {
  if (loading) {
    return <LoadingSpinner message="Memuat produk..." />;
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Tidak ada produk ditemukan
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
          <ProductCard product={product} />
        </Grid>
      ))}
    </Grid>
  );
}
