"use client";
import { useState, useEffect, useContext } from "react";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocalOffer,
  ContentCopy,
} from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { NotificationContext } from "@/context/NotificationContext";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "PERCENTAGE",
    value: "",
    minPurchase: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
    isActive: true,
  });
  const { showError } = useContext(NotificationContext);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/promotions");
      if (!res.ok) throw new Error("Gagal fetch promosi");
      const data = await res.json();
      setPromotions(data);
    } catch (error) {
      showError("Oops! Gagal ambil data promosi, coba refresh dulu 😅");
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, promotion = null) => {
    setDialog({ open: true, mode, data: promotion });
    if (promotion) {
      setFormData({
        name: promotion.name,
        code: promotion.code,
        type: promotion.type,
        value: promotion.value.toString(),
        minPurchase: promotion.minPurchase?.toString() || "",
        maxDiscount: promotion.maxDiscount?.toString() || "",
        startDate: promotion.startDate.split("T")[0],
        endDate: promotion.endDate.split("T")[0],
        usageLimit: promotion.usageLimit?.toString() || "",
        isActive: promotion.isActive,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        type: "PERCENTAGE",
        value: "",
        minPurchase: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        isActive: true,
      });
    }
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, mode: "create", data: null });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : null,
        maxDiscount: formData.maxDiscount
          ? parseFloat(formData.maxDiscount)
          : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      };
      if (dialog.mode === "create") {
        const res = await fetch("/api/promotions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        if (!res.ok) throw new Error("Gagal simpan promosi");
      } else {
        const res = await fetch(`/api/promotions/${dialog.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });
        if (!res.ok) throw new Error("Gagal update promosi");
      }
      fetchPromotions();
      handleCloseDialog();
    } catch (error) {
      showError("Yah, gagal simpan promosi. Coba lagi bentar ya!");
      console.error("Error saving promotion:", error);
    }
  };

  const handleDelete = async (promotionId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus promosi ini?")) {
      try {
        const res = await fetch(`/api/promotions/${promotionId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal hapus promosi");
        fetchPromotions();
      } catch (error) {
        showError("Gagal hapus promosi, servernya lagi ngambek 😭");
        console.error("Error deleting promotion:", error);
      }
    }
  };

  const copyPromoCode = (code) => {
    navigator.clipboard.writeText(code);
    // Show toast notification
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID");
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Kelola Promosi
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog("create")}
        >
          Tambah Promosi
        </Button>
      </Box>

      {/* Promotions Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Promosi</TableCell>
                    <TableCell>Kode</TableCell>
                    <TableCell>Jenis</TableCell>
                    <TableCell>Nilai</TableCell>
                    <TableCell>Periode</TableCell>
                    <TableCell>Penggunaan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {promotion.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={promotion.code}
                            variant="outlined"
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={() => copyPromoCode(promotion.code)}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            promotion.type === "PERCENTAGE"
                              ? "Persentase"
                              : "Nominal"
                          }
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {promotion.type === "PERCENTAGE"
                          ? `${promotion.value}%`
                          : formatCurrency(promotion.value)}
                        {promotion.minPurchase && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="text.secondary"
                          >
                            Min: {formatCurrency(promotion.minPurchase)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(promotion.startDate)} -{" "}
                          {formatDate(promotion.endDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {promotion.usageCount} / {promotion.usageLimit || "∞"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={promotion.isActive ? "Aktif" : "Tidak Aktif"}
                          color={promotion.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog("edit", promotion)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(promotion.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Empty State */}
          {!loading && promotions.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <LocalOffer
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Belum ada promosi
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog("create")}
              >
                Tambah Promosi Pertama
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Promotion Dialog */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialog.mode === "create" ? "Tambah Promosi" : "Edit Promosi"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nama Promosi"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Kode Promosi"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Jenis Diskon</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <MenuItem value="PERCENTAGE">Persentase (%)</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Nominal (Rp)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={
                  formData.type === "PERCENTAGE"
                    ? "Nilai Persentase"
                    : "Nilai Nominal"
                }
                type="number"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimal Pembelian"
                type="number"
                value={formData.minPurchase}
                onChange={(e) =>
                  setFormData({ ...formData, minPurchase: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maksimal Diskon"
                type="number"
                value={formData.maxDiscount}
                onChange={(e) =>
                  setFormData({ ...formData, maxDiscount: e.target.value })
                }
                disabled={formData.type === "FIXED_AMOUNT"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tanggal Mulai"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tanggal Berakhir"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Batas Penggunaan"
                type="number"
                value={formData.usageLimit}
                onChange={(e) =>
                  setFormData({ ...formData, usageLimit: e.target.value })
                }
                helperText="Kosongkan untuk tidak terbatas"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Promosi Aktif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialog.mode === "create" ? "Tambah" : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
