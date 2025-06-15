"use client";
import { useState, useEffect, use } from "react";
import {
  Container,
  Typography,
  Breadcrumbs,
  Link,
  Grid,
  Paper,
  Box,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import { Home, Category as CategoryIcon } from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import ProductGrid from "@/components/shop/ProductGrid";
import CategoryFilter from "@/components/shop/CategoryFilter";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import axios from "axios";

export default function CategoryProductsPage({ params }) {
  const resolvedParams = use(params);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: resolvedParams.slug });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchCategory();
  }, [filters, pagination.page, resolvedParams.slug]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        category: resolvedParams.slug,
        ...filters,
      });

      const response = await axios.get(`/api/products?${queryParams}`);
      setProducts(response.data.products);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async () => {
    try {
      const response = await axios.get("/api/categories");
      const foundCategory = response.data.find(
        (cat) => cat.slug === resolvedParams.slug
      );
      setCategory(foundCategory);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, category: resolvedParams.slug });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading && !category) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" width={300} height={40} />
          </Box>
          <Box sx={{ mb: 4 }}>
            <Skeleton variant="text" width={200} height={60} />
            <Skeleton variant="text" width={400} height={30} />
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Skeleton variant="rectangular" height={400} />
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Grid container spacing={3}>
                {[...Array(6)].map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Skeleton variant="rectangular" height={300} />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-separator": {
              color: "text.secondary",
            },
          }}
        >
          <Link
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Beranda
          </Link>
          <Link
            href="/products"
            sx={{
              textDecoration: "none",
              color: "text.secondary",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            Produk
          </Link>
          <Typography color="primary" fontWeight="medium">
            {category?.name || "Kategori"}
          </Typography>
        </Breadcrumbs>

        {/* Category Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CategoryIcon sx={{ mr: 2, color: "primary.main", fontSize: 32 }} />
            <Typography variant="h3" component="h1" fontWeight="bold">
              {category?.name || "Produk Kategori"}
            </Typography>
          </Box>

          {category?.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 800,
                lineHeight: 1.6,
              }}
            >
              {category.description}
            </Typography>
          )}

          {/* Category Stats */}
          <Box sx={{ mt: 3 }}>
            <Card variant="outlined" sx={{ display: "inline-block" }}>
              <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                <Typography variant="body2" color="text.secondary">
                  {loading ? (
                    <Skeleton width={100} />
                  ) : (
                    `${pagination.total} produk ditemukan`
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        <Grid container spacing={4}>
          {/* Sidebar Filter */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                position: "sticky",
                top: 100,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <CategoryFilter
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </Paper>
          </Grid>

          {/* Products Grid */}
          <Grid size={{ xs: 12, md: 9 }}>
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={handlePageChange}
                />
              </Box>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <Card sx={{ textAlign: "center", py: 8 }}>
                <CardContent>
                  <CategoryIcon
                    sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" gutterBottom>
                    Tidak ada produk ditemukan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coba ubah filter pencarian atau kembali ke halaman produk
                    utama
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
