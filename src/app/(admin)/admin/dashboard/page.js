"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Button,
  Alert,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  People,
  Inventory,
  AttachMoney,
  Visibility,
  Refresh,
  ArrowUpward,
  MoreVert,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function AdminDashboard() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("/api/admin/dashboard", {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.data.success) {
        setDashboardData(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        error.response?.data?.error || error.message || "Gagal memuat dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={fetchDashboardData}
          fullWidth={isMobile}
        >
          Coba Lagi
        </Button>
      </Box>
    );
  }

  if (!dashboardData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Tidak ada data dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={fetchDashboardData}
          fullWidth={isMobile}
        >
          Muat Ulang
        </Button>
      </Box>
    );
  }

  const { stats, recentOrders, topProducts, monthlyStats } = dashboardData;

  const statCards = [
    {
      title: "Total Pesanan",
      value: stats.totalOrders,
      icon: <ShoppingCart />,
      color: theme.palette.primary.main,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      change: "+12%",
      changeType: "increase",
    },
    {
      title: "Total Produk",
      value: stats.totalProducts,
      icon: <Inventory />,
      color: theme.palette.success.main,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      change: "+5%",
      changeType: "increase",
    },
    {
      title: "Total Pelanggan",
      value: stats.totalCustomers,
      icon: <People />,
      color: theme.palette.warning.main,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      change: "+8%",
      changeType: "increase",
    },
    {
      title: "Total Pendapatan",
      value: `Rp ${Number(stats.totalRevenue).toLocaleString("id-ID")}`,
      icon: <AttachMoney />,
      color: theme.palette.info.main,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      change: "+15%",
      changeType: "increase",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(Number(amount));
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      CONFIRMED: "info",
      PROCESSING: "primary",
      SHIPPED: "secondary",
      DELIVERED: "success",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: "bold", mb: 1 }}
          >
            Dashboard Admin
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Selamat datang kembali! Berikut adalah ringkasan bisnis Anda hari
            ini.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            minWidth: { xs: "100%", sm: "auto" },
          }}
        >
          Refresh Data
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                background: stat.gradient,
                color: "white",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
                height: { xs: 120, sm: 140 },
              }}
            >
              <CardContent
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        opacity: 0.9,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant={isMobile ? "h5" : "h4"}
                      sx={{
                        fontWeight: "bold",
                        mt: 1,
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      borderRadius: 2,
                      p: { xs: 1, sm: 1.5 },
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <ArrowUpward sx={{ fontSize: "1rem" }} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {stat.change}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts and Tables */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Monthly Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              height: { xs: 300, sm: 400 },
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{ fontWeight: "bold", mb: 1 }}
            >
              Pendapatan Bulanan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Grafik pendapatan 6 bulan terakhir
            </Typography>
            {monthlyStats && monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} />
                  <YAxis
                    tickFormatter={(value) => `${value / 1000}k`}
                    fontSize={isMobile ? 10 : 12}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Pendapatan"]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: "none",
                      borderRadius: "8px",
                      boxShadow: theme.shadows[8],
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={theme.palette.primary.main}
                    fill={alpha(theme.palette.primary.main, 0.1)}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80%",
                }}
              >
                <Typography color="text.secondary">
                  Tidak ada data untuk ditampilkan
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              height: { xs: "auto", lg: 400 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ fontWeight: "bold" }}
                >
                  Pesanan Terbaru
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  5 pesanan terakhir
                </Typography>
              </Box>
              <Button
                variant="text"
                onClick={() => router.push("/admin/orders")}
                sx={{
                  textTransform: "none",
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              >
                Lihat Semua
              </Button>
            </Box>

            <Box
              sx={{
                maxHeight: { xs: 300, lg: 280 },
                overflow: "auto",
              }}
            >
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      mb: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      {order.user.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {order.orderNumber}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "block",
                        }}
                      >
                        {order.user.name}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {formatCurrency(order.total)}
                      </Typography>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                        size="small"
                        sx={{
                          fontSize: { xs: "0.625rem", sm: "0.75rem" },
                          height: { xs: 20, sm: 24 },
                        }}
                      />
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 4 }}
                >
                  Tidak ada pesanan terbaru
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12}>
          <Paper
            sx={{
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{ fontWeight: "bold" }}
                >
                  Produk Terlaris
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  5 produk dengan penjualan tertinggi
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => router.push("/admin/products")}
                sx={{
                  textTransform: "none",
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                Kelola Produk
              </Button>
            </Box>

            {topProducts && topProducts.length > 0 ? (
              <TableContainer sx={{ maxHeight: { xs: 400, md: 500 } }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Produk</TableCell>
                      {!isMobile && (
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Kategori
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: "bold" }}>Terjual</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Pendapatan
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              src={product.images?.[0]}
                              sx={{
                                width: { xs: 32, sm: 40 },
                                height: { xs: 32, sm: 40 },
                              }}
                            >
                              {product.name.charAt(0)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 500,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                }}
                              >
                                {product.name}
                              </Typography>
                              <Chip
                                label={`#${index + 1} Terlaris`}
                                color="primary"
                                size="small"
                                sx={{
                                  fontSize: { xs: "0.625rem", sm: "0.75rem" },
                                  height: { xs: 16, sm: 20 },
                                }}
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Typography variant="body2">
                              {product.category?.name || "-"}
                            </Typography>
                          </TableCell>
                        )}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.totalSold}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.success.main,
                            }}
                          >
                            {formatCurrency(product.totalRevenue)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(`/admin/products/${product.id}`)
                            }
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.2),
                              },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  p: 4,
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">
                  Tidak ada data produk terlaris
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
