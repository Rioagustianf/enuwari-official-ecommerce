"use client";
import { Typography, Box } from "@mui/material";
import ProductForm from "@/components/admin/ProductForm";

export default function CreateProductPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Tambah Produk Baru
      </Typography>
      <ProductForm />
    </Box>
  );
}
