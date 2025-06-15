"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import Pagination from "@/components/common/Pagination";
import axios from "axios";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      const response = await axios.get(`/api/products?${params}`);
      setProducts(response.data.products);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      setError("Gagal memuat produk");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <Typography color="text.primary">Produk</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Semua Produk
        </Typography>

        <Grid container spacing={3}>
          {/* Sidebar Filter */}
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
              <CategoryFilter
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </Paper>
          </Grid>

          {/* Products Grid */}
          <Grid item xs={12} md={9}>
            <ProductGrid products={products} loading={loading} error={error} />

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
