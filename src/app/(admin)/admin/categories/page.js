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
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
  CloudUpload,
} from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { NotificationContext } from "@/context/NotificationContext";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({
    open: false,
    mode: "create",
    data: null,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });
  const { showError } = useContext(NotificationContext);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Gagal fetch kategori");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      showError("Oops! Gagal ambil data kategori, coba refresh dulu 😅");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode, category = null) => {
    setDialog({ open: true, mode, data: category });
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        isActive: true,
      });
    }
  };

  const handleCloseDialog = () => {
    setDialog({ open: false, mode: "create", data: null });
    setFormData({
      name: "",
      description: "",
      image: "",
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (dialog.mode === "create") {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Gagal simpan kategori");
      } else {
        const res = await fetch(`/api/categories/${dialog.data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Gagal update kategori");
      }
      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      showError("Yah, gagal simpan kategori. Coba lagi bentar ya!");
      console.error("Error saving category:", error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        const res = await fetch(`/api/categories/${categoryId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Gagal hapus kategori");
        fetchCategories();
      } catch (error) {
        showError("Gagal hapus kategori, servernya lagi ngambek 😭");
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append("images", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal upload gambar");
      }
      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.files[0] }));
    } catch (err) {
      const msg = err.message || "Gagal upload gambar";
      if (showError) showError(msg);
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
          Kelola Kategori
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog("create")}
        >
          Tambah Kategori
        </Button>
      </Box>

      {/* Categories Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Kategori</TableCell>
                    <TableCell>Deskripsi</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total Produk</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={category.image}
                            variant="rounded"
                            sx={{ mr: 2, width: 48, height: 48 }}
                          >
                            <CategoryIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {category.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {category.slug}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {category.description || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.isActive ? "Aktif" : "Tidak Aktif"}
                          color={category.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {category._count?.products || 0} produk
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog("edit", category)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(category.id)}
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
          {!loading && categories.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <CategoryIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                Belum ada kategori
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog("create")}
              >
                Tambah Kategori Pertama
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog
        open={dialog.open}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialog.mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nama Kategori"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deskripsi"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ my: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                  sx={{ mb: 1 }}
                >
                  Upload Gambar
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {formData.image && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                }
                label="Kategori Aktif"
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
