"use client";
import { useState, useEffect, useContext, useRef } from "react";
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
  Grid,
  Switch,
  FormControlLabel,
  Avatar,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ViewCarousel,
  ArrowUpward,
  ArrowDownward,
  Visibility,
} from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { NotificationContext } from "@/context/NotificationContext";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    order: 0,
    isActive: true,
  });
  const { showError } = useContext(NotificationContext);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error("Gagal fetch banner");
      const data = await res.json();
      setBanners(data);
    } catch (error) {
      showError("Oops! Gagal ambil data banner, coba refresh dulu 😅");
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, banner = null) => {
    setDialog({ open: true, mode, data: banner });
    if (banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        image: banner.image,
        link: banner.link || "",
        order: banner.order,
        isActive: banner.isActive,
      });
    } else {
      setFormData({
        title: "",
        subtitle: "",
        image: "",
        link: "",
        order: banners.length,
        isActive: true,
      });
    }
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, mode: "create", data: null });
  };

  const handleSubmit = async () => {
    try {
      if (dialog.mode === "create") {
        const res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Gagal simpan banner");
      } else {
        const res = await fetch(`/api/banners/${dialog.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Gagal update banner");
      }
      fetchBanners();
      handleCloseDialog();
    } catch (error) {
      showError("Yah, gagal simpan banner. Coba lagi bentar ya!");
      console.error("Error saving banner:", error);
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus banner ini?")) {
      try {
        const res = await fetch(`/api/banners/${bannerId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal hapus banner");
        fetchBanners();
      } catch (error) {
        showError("Gagal hapus banner, servernya lagi ngambek 😭");
        console.error("Error deleting banner:", error);
      }
    }
  };

  const moveOrder = async (bannerId, direction) => {
    try {
      const res = await fetch(`/api/banners/${bannerId}/order`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error("Gagal update urutan");
      fetchBanners();
    } catch (error) {
      showError("Update urutan gagal, coba refresh!");
      console.error("Error updating banner order:", error);
    }
  };

  // Handler upload gambar banner
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("File harus berupa gambar!");
      return;
    }
    setUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("images", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload gambar");
      setFormData((prev) => ({ ...prev, image: data.files?.[0] || "" }));
    } catch (error) {
      showError("Gagal upload gambar banner!");
      console.error("Upload banner error:", error);
    } finally {
      setUploading(false);
    }
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
          Kelola Banner
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog("create")}
        >
          Tambah Banner
        </Button>
      </Box>

      {/* Banners Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Banner</TableCell>
                    <TableCell>Judul</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell>Urutan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id} hover>
                      <TableCell>
                        <Avatar
                          src={banner.image}
                          variant="rounded"
                          sx={{ width: 80, height: 45 }}
                        >
                          <ViewCarousel />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {banner.title}
                        </Typography>
                        {banner.subtitle && (
                          <Typography variant="body2" color="text.secondary">
                            {banner.subtitle}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {banner.link || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="body2">
                            {banner.order}
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexDirection: "column" }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => moveOrder(banner.id, "up")}
                              disabled={banner.order === 0}
                            >
                              <ArrowUpward fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => moveOrder(banner.id, "down")}
                              disabled={banner.order === banners.length - 1}
                            >
                              <ArrowDownward fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={banner.isActive ? "Aktif" : "Tidak Aktif"}
                          color={banner.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => window.open(banner.image, "_blank")}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenDialog("edit", banner)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(banner.id)}
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
          {!loading && banners.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <ViewCarousel
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Belum ada banner
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog("create")}
              >
                Tambah Banner Pertama
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Banner Dialog */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {dialog.mode === "create" ? "Tambah Banner" : "Edit Banner"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Judul Banner"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                disabled={uploading}
                startIcon={<ViewCarousel />}
              >
                {uploading
                  ? "Mengupload..."
                  : formData.image
                  ? "Ganti Gambar"
                  : "Upload Gambar"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </Button>
              {formData.image && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview:
                  </Typography>
                  <img
                    src={formData.image}
                    alt="Banner preview"
                    style={{
                      width: "100%",
                      maxHeight: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </Box>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link Tujuan"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                helperText="URL yang akan dibuka ketika banner diklik"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Urutan"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
                helperText="Urutan tampil banner (0 = paling atas)"
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
                label="Banner Aktif"
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
