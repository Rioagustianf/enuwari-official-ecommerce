"use client";
import { useState, useEffect, use } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import { ArrowBack, Print, LocalShipping, Payment } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import axios from "axios";

export default function AdminOrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    paymentStatus: "",
    trackingNumber: "",
  });

  useEffect(() => {
    fetchOrder();
  }, [resolvedParams.id]);

  const fetchOrder = async () => {
    try {
      const response = await axios.get(`/api/orders/${resolvedParams.id}`);
      setOrder(response.data);
      setUpdateData({
        status: response.data.status,
        paymentStatus: response.data.paymentStatus,
        trackingNumber: response.data.trackingNumber || "",
      });
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await axios.put(`/api/orders/${order.id}`, updateData);
      fetchOrder();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setUpdating(false);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!order) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6">Pesanan tidak ditemukan</Typography>
        <Button onClick={() => router.push("/admin/orders")} sx={{ mt: 2 }}>
          Kembali ke Daftar Pesanan
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push("/admin/orders")}
        >
          Kembali
        </Button>
        <Typography variant="h4" fontWeight="bold">
          Detail Pesanan #{order.orderNumber}
        </Typography>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Chip label={order.status} color={getStatusColor(order.status)} />
          <Chip
            label={order.paymentStatus}
            color={getPaymentStatusColor(order.paymentStatus)}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={8}>
          {/* Customer Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informasi Pelanggan
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ mr: 2 }}>{order.user.name.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {order.user.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.user.email}
                  </Typography>
                  {order.user.phone && (
                    <Typography variant="body2" color="text.secondary">
                      {order.user.phone}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Alamat Pengiriman:
              </Typography>
              <Typography variant="body2">{order.shippingAddress}</Typography>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produk yang Dipesan
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produk</TableCell>
                      <TableCell>Harga</TableCell>
                      <TableCell>Jumlah</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={
                                item.product.images
                                  ? JSON.parse(item.product.images)[0]
                                  : ""
                              }
                              variant="rounded"
                              sx={{ mr: 2 }}
                            />
                            <Box>
                              <Typography variant="subtitle2">
                                {item.product.name}
                              </Typography>
                              {item.size && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Ukuran: {item.size}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.price * item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Actions */}
        <Grid item xs={12} md={4}>
          {/* Update Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Update Status Pesanan
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status Pesanan</InputLabel>
                <Select
                  value={updateData.status}
                  onChange={(e) =>
                    setUpdateData({ ...updateData, status: e.target.value })
                  }
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                  <MenuItem value="PROCESSING">Processing</MenuItem>
                  <MenuItem value="SHIPPED">Shipped</MenuItem>
                  <MenuItem value="DELIVERED">Delivered</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status Pembayaran</InputLabel>
                <Select
                  value={updateData.paymentStatus}
                  onChange={(e) =>
                    setUpdateData({
                      ...updateData,
                      paymentStatus: e.target.value,
                    })
                  }
                >
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="FAILED">Failed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Nomor Resi"
                value={updateData.trackingNumber}
                onChange={(e) =>
                  setUpdateData({
                    ...updateData,
                    trackingNumber: e.target.value,
                  })
                }
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                fullWidth
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? "Mengupdate..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ringkasan Pesanan
              </Typography>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2">
                  {formatCurrency(order.subtotal)}
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2">Ongkos Kirim:</Typography>
                <Typography variant="body2">
                  {formatCurrency(order.shippingCost)}
                </Typography>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  {formatCurrency(order.total)}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Tanggal Pesanan: {formatDate(order.createdAt)}
                </Typography>
                {order.courier && (
                  <Typography variant="body2" color="text.secondary">
                    Kurir: {order.courier.toUpperCase()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aksi
              </Typography>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<Print />}
                sx={{ mb: 2 }}
                onClick={() => window.print()}
              >
                Cetak Invoice
              </Button>

              {order.trackingNumber && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LocalShipping />}
                  onClick={() => {
                    window.open(
                      `https://cekresi.com/?noresi=${order.trackingNumber}`,
                      "_blank"
                    );
                  }}
                >
                  Lacak Pengiriman
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
