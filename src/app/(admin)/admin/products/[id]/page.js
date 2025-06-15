"use client";
import { useState, useEffect, use } from "react";
import { Typography, Box } from "@mui/material";
import ProductForm from "@/components/admin/ProductForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import axios from "axios";

export default function EditProductPage({ params }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${resolvedParams.id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Edit Produk
      </Typography>
      <ProductForm product={product} isEdit={true} />
    </Box>
  );
}
