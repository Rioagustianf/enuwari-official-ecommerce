"use client";
import { useState, useEffect, useContext, use } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Avatar,
  Divider,
  Breadcrumbs,
  Link,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Paper,
} from "@mui/material";
import { Home, LocalShipping, WhatsApp, Receipt } from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function OrderDetailPage({ params }) {
  // Use React.use() to unwrap params
  const resolvedParams = use(params);
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);
  const [order, setOrder] = useState(null);

  const orderSteps = [
    "Pesanan Dibuat",
    "Pembayaran Dikonfirmasi",
    "Pesanan Diproses",
    "Pesanan Dikirim",
    "Pesanan Diterima",
  ];

  const getActiveStep = (status) => {
    const stepMap = {
      PENDING: 0,
      CONFIRMED: 1,
      PROCESSING: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };
    return stepMap[status] || 0;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetchOrder();
    }
  }, [user, loading, resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${resolvedParams.id}`);
      if (!res.ok) throw new Error("Gagal fetch pesanan");
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error("Error fetching order:", error);
      if (error.response?.status === 404) {
        router.push("/orders");
      }
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleWhatsAppContact = () => {
    const message = `Halo, saya ingin menanyakan tentang pesanan ${order.orderNumber}`;
    const url = `https://wa.me/${
      process.env.NEXT_PUBLIC_ADMIN_WHATSAPP
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return null;
  }

  if (!order) {
    return (
      <>
        <Header />
        <Container sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h4">Pesanan tidak ditemukan</Typography>
          <Button
            variant="contained"
            onClick={() => router.push("/orders")}
            sx={{ mt: 2 }}
          >
            Kembali ke Pesanan
          </Button>
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
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" sx={{ display: "flex", alignItems: "center" }}>
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Beranda
          </Link>
          <Link href="/orders">Pesanan Saya</Link>
          <Typography color="text.primary">Detail Pesanan</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Detail Pesanan #{order.orderNumber}
        </Typography>

        <Grid container spacing={3}>
          {/* Order Status */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">Status Pesanan</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                    />
                    <Chip
                      label={order.paymentStatus}
                      color={getPaymentStatusColor(order.paymentStatus)}
                    />
                  </Box>
                </Box>

                <Stepper
                  activeStep={getActiveStep(order.status)}
                  alternativeLabel
                >
                  {orderSteps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {order.trackingNumber && (
                  <Alert severity="info" sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      Nomor Resi: <strong>{order.trackingNumber}</strong>
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<LocalShipping />}
                      onClick={() => {
                        window.open(
                          `https://cekresi.com/?noresi=${order.trackingNumber}`,
                          "_blank"
                        );
                      }}
                      sx={{ mt: 1 }}
                    >
                      Lacak Pengiriman
                    </Button>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Order Items */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Produk yang Dipesan
                </Typography>

                {order.orderItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      pb: 2,
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <Avatar
                      src={
                        item.product.images
                          ? JSON.parse(item.product.images)[0]
                          : ""
                      }
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">
                        {item.product.name}
                      </Typography>
                      {item.size && (
                        <Typography variant="body2" color="text.secondary">
                          Ukuran: {item.size}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} x {formatCurrency(item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {formatCurrency(item.price * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary & Actions */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Ringkasan Pesanan
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Subtotal:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(order.subtotal)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">Ongkos Kirim:</Typography>
                    <Typography variant="body2">
                      {formatCurrency(order.shippingCost)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(order.total)}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Tanggal Pesanan: {formatDate(order.createdAt)}
                </Typography>

                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppContact}
                  sx={{ mb: 2 }}
                >
                  Hubungi Admin
                </Button>

                {order.paymentStatus === "PAID" && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Receipt />}
                    onClick={() => {
                      window.print();
                    }}
                  >
                    Cetak Invoice
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informasi Pengiriman
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Alamat Pengiriman:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {order.user.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {order.shippingAddress}
                </Typography>

                {order.courier && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Kurir: {order.courier.toUpperCase()}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Payment Information */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informasi Pembayaran
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      Status Pembayaran:
                    </Typography>
                    <Chip
                      label={order.paymentStatus}
                      color={getPaymentStatusColor(order.paymentStatus)}
                      sx={{ mt: 1 }}
                    />
                  </Grid>

                  {order.payments && order.payments.length > 0 && (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        Metode Pembayaran:
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {order.payments[0].method || "Transfer Bank"}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {order.paymentStatus === "PENDING" && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Pembayaran belum dikonfirmasi. Silakan lakukan pembayaran
                      sesuai instruksi yang diberikan.
                    </Typography>
                  </Alert>
                )}

                {order.paymentStatus === "FAILED" && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      Pembayaran gagal. Silakan hubungi admin untuk bantuan
                      lebih lanjut.
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
