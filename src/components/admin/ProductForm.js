"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Typography,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import { Add, Delete, CloudUpload } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProductForm({ product = null, isEdit = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    salePrice: "",
    sku: "",
    stock: "",
    weight: "",
    dimensions: "",
    categoryId: "",
    isActive: true,
    isFeatured: false,
    images: [],
    sizes: [],
  });
  const [newSize, setNewSize] = useState({ size: "", stock: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        salePrice: product.salePrice || "",
        sku: product.sku || "",
        stock: product.stock || "",
        weight: product.weight || "",
        dimensions: product.dimensions || "",
        categoryId: product.categoryId || "",
        isActive: product.isActive || true,
        isFeatured: product.isFeatured || false,
        images: product.images ? JSON.parse(product.images) : [],
        sizes: product.productSizes || [],
      });
    }
  }, [product]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    // Simulate image upload - in real app, upload to cloud storage
    const imageUrls = files.map((file) => URL.createObjectURL(file));
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const addSize = () => {
    if (newSize.size && newSize.stock) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, { ...newSize, stock: parseInt(newSize.stock) }],
      }));
      setNewSize({ size: "", stock: "" });
    }
  };

  const removeSize = (index) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stock: parseInt(formData.stock),
        weight: formData.weight ? parseInt(formData.weight) : null,
        images: JSON.stringify(formData.images),
      };

      if (isEdit) {
        await axios.put(`/api/products/${product.id}`, submitData);
      } else {
        await axios.post("/api/products", submitData);
      }

      router.push("/admin/products");
    } catch (error) {
      setError(error.response?.data?.error || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>
                Informasi Dasar
              </Typography>
            </Grid>

            <Grid size={12} md={8}>
              <TextField
                fullWidth
                label="Nama Produk"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </Grid>

            <Grid size={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Deskripsi"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </Grid>

            <Grid size={12} md={4}>
              <TextField
                fullWidth
                label="SKU"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                required
              />
            </Grid>

            <Grid size={12} md={4}>
              <TextField
                fullWidth
                label="Harga"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                required
              />
            </Grid>

            <Grid size={12} md={4}>
              <TextField
                fullWidth
                label="Harga Diskon"
                type="number"
                value={formData.salePrice}
                onChange={(e) => handleInputChange("salePrice", e.target.value)}
              />
            </Grid>

            <Grid size={12} md={4}>
              <TextField
                fullWidth
                label="Stok"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                required
              />
            </Grid>

            <Grid size={12} md={4}>
              <TextField
                fullWidth
                label="Berat (gram)"
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
              />
            </Grid>

            <Grid size={12} md={4}>
              <TextField
                fullWidth
                label="Dimensi (cm)"
                placeholder="P x L x T"
                value={formData.dimensions}
                onChange={(e) =>
                  handleInputChange("dimensions", e.target.value)
                }
              />
            </Grid>

            {/* Product Images */}
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>
                Gambar Produk
              </Typography>

              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 2 }}
              >
                Upload Gambar
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Button>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {formData.images.map((image, index) => (
                  <Box key={index} sx={{ position: "relative" }}>
                    <img
                      src={image}
                      alt={`Product ${index + 1}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(index)}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        color: "white",
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Product Sizes */}
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>
                Ukuran Produk
              </Typography>

              <Box
                sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}
              >
                <TextField
                  label="Ukuran"
                  value={newSize.size}
                  onChange={(e) =>
                    setNewSize({ ...newSize, size: e.target.value })
                  }
                  size="small"
                />
                <TextField
                  label="Stok"
                  type="number"
                  value={newSize.stock}
                  onChange={(e) =>
                    setNewSize({ ...newSize, stock: e.target.value })
                  }
                  size="small"
                />
                <Button
                  variant="outlined"
                  onClick={addSize}
                  startIcon={<Add />}
                >
                  Tambah
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {formData.sizes.map((size, index) => (
                  <Chip
                    key={index}
                    label={`${size.size} (${size.stock})`}
                    onDelete={() => removeSize(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            {/* Settings */}
            <Grid size={12}>
              <Typography variant="subtitle1" gutterBottom>
                Pengaturan
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                  />
                }
                label="Produk Aktif"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      handleInputChange("isFeatured", e.target.checked)
                    }
                  />
                }
                label="Produk Unggulan"
                sx={{ ml: 3 }}
              />
            </Grid>

            {/* Submit Buttons */}
            <Grid size={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push("/admin/products")}
                >
                  Batal
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading
                    ? "Menyimpan..."
                    : isEdit
                    ? "Update Produk"
                    : "Simpan Produk"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
