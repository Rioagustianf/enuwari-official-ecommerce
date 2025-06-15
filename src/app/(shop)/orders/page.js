"use client";
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from "@mui/material";
import {
  Home,
  Visibility,
  LocalShipping,
  RateReview,
  Star,
} from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AuthContext } from "@/context/AuthContext";
import { NotificationContext } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    product: null,
    orderId: null,
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  const statusTabs = [
    { label: "Semua", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Dikonfirmasi", value: "CONFIRMED" },
    { label: "Diproses", value: "PROCESSING" },
    { label: "Dikirim", value: "SHIPPED" },
    { label: "Selesai", value: "DELIVERED" },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, loading, activeTab]);

  const fetchOrders = async () => {
    try {
      const status = statusTabs[activeTab].value;
      const params = status ? `?status=${status}` : "";
      const response = await axios.get(`/api/orders${params}`);
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: "warning",
      PAID: "success",
      FAILED: "error",
      CANCELLED: "error",
    };
    return colors[status] || "default";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleOpenReviewDialog = (product, orderId) => {
    setReviewDialog({
      open: true,
      product,
      orderId,
    });
    setNewReview({ rating: 5, comment: "" });
  };

  const handleCloseReviewDialog = () => {
    setReviewDialog({
      open: false,
      product: null,
      orderId: null,
    });
    setNewReview({ rating: 5, comment: "" });
  };

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) {
      showError("Mohon tulis komentar ulasan");
      return;
    }

    setReviewLoading(true);
    try {
      console.log("Submitting review:", {
        product: reviewDialog.product,
        productId: reviewDialog.product?.id || reviewDialog.product?.productId,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      const productId =
        reviewDialog.product?.id || reviewDialog.product?.productId;
      if (!productId) {
        showError(
          "Product ID tidak ditemukan pada data produk. Silakan refresh halaman atau hubungi admin."
        );
        setReviewLoading(false);
        return;
      }

      const response = await axios.post(
        "/api/reviews",
        {
          productId,
          rating: newReview.rating,
          comment: newReview.comment,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Review response:", response.data);

      if (response.data.success) {
        showSuccess("Ulasan berhasil ditambahkan");
        handleCloseReviewDialog();
        fetchOrders(); // Refresh orders to update review status
      } else {
        showError("Gagal menambahkan ulasan");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Gagal menambahkan ulasan";
      showError(errorMessage);
    } finally {
      setReviewLoading(false);
    }
  };

  const checkIfCanReview = async (productId) => {
    try {
      const response = await axios.get(
        `/api/reviews?productId=${productId}&userId=${user.id}`
      );
      return response.data.canReview;
    } catch (error) {
      return false;
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
          <Typography color="text.primary">Pesanan Saya</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Pesanan Saya
        </Typography>

        {/* Status Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {statusTabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {orders.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                Belum ada pesanan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Anda belum memiliki pesanan. Mulai berbelanja sekarang!
              </Typography>
              <Button
                variant="contained"
                onClick={() => router.push("/products")}
              >
                Mulai Belanja
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {orders.map((order) => (
              <Grid size={{ xs: 12 }} key={order.id}>
                <Card>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Order #{order.orderNumber}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                        <Chip
                          label={order.paymentStatus}
                          color={getPaymentStatusColor(order.paymentStatus)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Order Items */}
                    <Box sx={{ mb: 2 }}>
                      {order.orderItems.map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 2,
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                          }}
                        >
                          <Avatar
                            src={
                              item.product.images
                                ? JSON.parse(item.product.images)[0]
                                : ""
                            }
                            variant="rounded"
                            sx={{ mr: 2, width: 60, height: 60 }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {item.product.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.quantity} x {formatCurrency(item.price)}
                            </Typography>
                            {item.size && (
                              <Typography
                                variant="caption"
                                display="block"
                                color="text.secondary"
                              >
                                Ukuran: {item.size}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(item.price * item.quantity)}
                            </Typography>
                            {/* Show review button only for delivered orders */}
                            {order.status === "DELIVERED" &&
                              order.paymentStatus === "PAID" && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<RateReview />}
                                  onClick={() =>
                                    handleOpenReviewDialog(
                                      item.product,
                                      order.id
                                    )
                                  }
                                  sx={{ mt: 1 }}
                                >
                                  Beri Ulasan
                                </Button>
                              )}
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Pesanan
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {formatCurrency(order.total)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          Detail
                        </Button>
                        {order.trackingNumber && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<LocalShipping />}
                            onClick={() => {
                              window.open(
                                `https://cekresi.com/?noresi=${order.trackingNumber}`,
                                "_blank"
                              );
                            }}
                          >
                            Lacak
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={handleCloseReviewDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Star sx={{ mr: 1, color: "primary.main" }} />
            Beri Ulasan Produk
          </Box>
        </DialogTitle>
        <DialogContent>
          {reviewDialog.product && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  src={
                    reviewDialog.product.images
                      ? JSON.parse(reviewDialog.product.images)[0]
                      : ""
                  }
                  variant="rounded"
                  sx={{ mr: 2, width: 60, height: 60 }}
                />
                <Typography variant="subtitle1" fontWeight="bold">
                  {reviewDialog.product.name}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Rating:
                </Typography>
                <Rating
                  value={newReview.rating}
                  onChange={(e, value) =>
                    setNewReview({ ...newReview, rating: value })
                  }
                  size="large"
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Tulis ulasan Anda"
                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>Batal</Button>
          <Button
            onClick={handleSubmitReview}
            variant="contained"
            disabled={reviewLoading}
          >
            {reviewLoading ? "Mengirim..." : "Kirim Ulasan"}
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
}
