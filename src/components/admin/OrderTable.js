"use client";
import { useState, useContext } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import {
  MoreVert,
  Visibility,
  Edit,
  LocalShipping,
  Payment,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { NotificationContext } from "@/context/NotificationContext";

export default function OrderTable({ orders, onOrderUpdate }) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    paymentStatus: "",
    trackingNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const { showError } = useContext(NotificationContext);

  const handleMenuOpen = (event, order) => {
    if (!order || !order.id) {
      showError && showError("Order tidak valid (ID kosong)");
      return;
    }
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    if (!updateDialog) setSelectedOrder(null);
  };

  const handleViewOrder = () => {
    router.push(`/admin/orders/${selectedOrder.id}`);
    handleMenuClose();
  };

  const handleUpdateOrder = () => {
    if (!selectedOrder || !selectedOrder.id) {
      showError && showError("Order tidak valid (ID kosong)");
      return;
    }
    setUpdateData({
      status: selectedOrder.status,
      paymentStatus: selectedOrder.paymentStatus,
      trackingNumber: selectedOrder.trackingNumber || "",
    });
    setUpdateDialog(true);
    handleMenuClose();
  };

  const submitUpdate = async () => {
    if (!selectedOrder || !selectedOrder.id) {
      showError && showError("Order tidak valid untuk update");
      console.error("[DEBUG] selectedOrder null/invalid:", selectedOrder);
      return;
    }
    setLoading(true);
    try {
      console.log("[DEBUG] submitUpdate: selectedOrder", selectedOrder);
      console.log("[DEBUG] submitUpdate: updateData", updateData);
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      console.log("[DEBUG] submitUpdate: response", res, data);
      if (!res.ok) {
        showError && showError(data.error || "Gagal update order");
        throw new Error(data.error || "Gagal update order");
      }
      onOrderUpdate();
      setUpdateDialog(false);
    } catch (error) {
      console.error("[DEBUG] Error updating order:", error);
    } finally {
      setLoading(false);
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Pelanggan</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pembayaran</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {order.orderNumber}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                      {order.user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{order.user.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(order.total)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.orderItems.length} item(s)
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={order.status}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={order.paymentStatus}
                    color={getPaymentStatusColor(order.paymentStatus)}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {formatDate(order.createdAt)}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, order)}
                    size="small"
                  >
                    <MoreVert />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewOrder}>
          <Visibility sx={{ mr: 1 }} />
          Lihat Detail
        </MenuItem>
        <MenuItem onClick={handleUpdateOrder}>
          <Edit sx={{ mr: 1 }} />
          Update Status
        </MenuItem>
      </Menu>

      {/* Update Order Dialog */}
      <Dialog
        open={updateDialog && !!selectedOrder}
        onClose={() => {
          setUpdateDialog(false);
          setSelectedOrder(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Status Pesanan</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
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

            <FormControl fullWidth sx={{ mb: 3 }}>
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
                setUpdateData({ ...updateData, trackingNumber: e.target.value })
              }
              placeholder="Masukkan nomor resi pengiriman"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setUpdateDialog(false);
              setSelectedOrder(null);
            }}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={submitUpdate}
            variant="contained"
            disabled={loading || !selectedOrder}
          >
            {loading ? "Menyimpan..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
