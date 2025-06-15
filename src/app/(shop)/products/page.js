"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Divider,
  Stack,
  Chip,
  Button,
  IconButton,
} from "@mui/material";
import { Home, FilterList, GridView, Close } from "@mui/icons-material";
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
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
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

  const clearFilters = () => {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) => filters[key]
  ).length;

  return (
    <>
      <Header />

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "grey.50",
          py: { xs: 3, md: 4 },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="small" />
              Beranda
            </Link>
            <Typography color="text.primary" fontWeight="medium">
              Produk
            </Typography>
          </Breadcrumbs>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: "1.75rem", md: "2.125rem" },
                }}
              >
                Semua Produk
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Temukan produk terbaik dengan kualitas premium
              </Typography>
            </Box>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              mb: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              display: { xs: "block", md: "none" },
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" fontWeight="600">
                Filter Produk
              </Typography>
              <IconButton
                size="small"
                onClick={() => setMobileFilterOpen(false)}
              >
                <Close />
              </IconButton>
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <CategoryFilter
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
          </Paper>
        )}

        {/* Main Content Layout */}
        <Box
          sx={{
            display: "flex",
            gap: 4,
            alignItems: "flex-start",
          }}
        >
          {/* Sidebar Filter - Desktop Only */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              display: { xs: "none", md: "block" },
            }}
          >
            <Box sx={{ position: "sticky", top: 24 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h6" fontWeight="600">
                    Filter Produk
                  </Typography>
                  {activeFiltersCount > 0 && (
                    <Button
                      size="small"
                      onClick={clearFilters}
                      sx={{ textTransform: "none" }}
                    >
                      Reset
                    </Button>
                  )}
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <CategoryFilter
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                />
              </Paper>
            </Box>
          </Box>

          {/* Products Section */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Results Header */}
            <Box sx={{ mb: 3 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    {loading
                      ? "Memuat..."
                      : `${pagination.total} Produk Ditemukan`}
                  </Typography>
                  {activeFiltersCount > 0 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Filter aktif:
                      </Typography>
                      {Object.entries(filters).map(
                        ([key, value]) =>
                          value && (
                            <Chip
                              key={key}
                              label={`${key}: ${value}`}
                              size="small"
                              onDelete={() =>
                                handleFilterChange({ ...filters, [key]: "" })
                              }
                              color="primary"
                              variant="outlined"
                            />
                          )
                      )}
                    </Stack>
                  )}
                </Box>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <GridView color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Halaman {pagination.page} dari {pagination.totalPages}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* Products Grid */}
            <ProductGrid products={products} loading={loading} error={error} />

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <Footer />
    </>
  );
}
