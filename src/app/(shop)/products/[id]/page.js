"use client";
import { useState, useEffect, useContext, use } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Rating,
  Chip,
  Divider,
  Card,
  CardContent,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Breadcrumbs,
  Link,
  ImageList,
  ImageListItem,
  Paper,
  Skeleton,
  Badge,
  Stack,
} from "@mui/material";
import {
  ShoppingCart,
  Favorite,
  FavoriteBorder,
  Share,
  Home,
  WhatsApp,
  LocalShipping,
  Security,
  Verified,
  Star,
  RateReview,
} from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import { WishlistContext } from "@/context/WishlistContext";
import { NotificationContext } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ProductDetailPage({ params }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const { user, loading } = useContext(AuthContext);
  const { addToWishlist, isInWishlist } = useContext(WishlistContext);
  const { showSuccess, showError } = useContext(NotificationContext);

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsData, setReviewsData] = useState({
    canReview: false,
    hasReviewed: false,
    pagination: {},
  });
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
  }, [resolvedParams.id, user]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${resolvedParams.id}`);
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching product:", error);
      showError("Gagal memuat detail produk");
    } finally {
      setProductLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        productId: resolvedParams.id,
      });

      if (user) {
        params.append("userId", user.id);
      }

      const response = await axios.get(`/api/reviews?${params}`);
      setReviews(response.data.reviews);
      setReviewsData({
        canReview: response.data.canReview,
        hasReviewed: response.data.hasReviewed,
        pagination: response.data.pagination,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleAddToCart = () => {
    if (product.productSizes.length > 0 && !selectedSize) {
      showError("Pilih ukuran terlebih dahulu");
      return;
    }

    if (quantity > product.stock) {
      showError("Jumlah melebihi stok yang tersedia");
      return;
    }

    addToCart(product, quantity, selectedSize);
    showSuccess("Produk berhasil ditambahkan ke keranjang");
  };

  const handleWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    await addToWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    if (!newReview.comment.trim()) {
      showError("Mohon tulis komentar ulasan");
      return;
    }

    setReviewLoading(true);
    try {
      console.log("Submitting review from product page:", {
        productId: product?.id,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      if (!product?.id) {
        showError("Product ID tidak ditemukan. Silakan refresh halaman.");
        setReviewLoading(false);
        return;
      }

      const response = await axios.post(
        "/api/reviews",
        {
          productId: product.id,
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
        setNewReview({ rating: 5, comment: "" });
        fetchReviews();
        fetchProduct(); // Refresh product untuk update rating
        showSuccess("Ulasan berhasil ditambahkan");
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

  const handleWhatsAppContact = () => {
    const message = `Halo, saya tertarik dengan produk ${product.name}. Bisa minta info lebih lanjut?`;
    const url = `https://wa.me/${
      process.env.NEXT_PUBLIC_ADMIN_WHATSAPP
    }?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess("Link produk berhasil disalin");
    }
  };

  if (productLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ borderRadius: 2 }}
              />
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                {[...Array(4)].map((_, index) => (
                  <Skeleton
                    key={index}
                    variant="rectangular"
                    width={80}
                    height={80}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="100%" height={60} />
              <Skeleton variant="text" width="40%" height={40} />
              <Box sx={{ my: 3 }}>
                <Skeleton variant="rectangular" height={100} />
              </Box>
              <Skeleton variant="rectangular" height={50} />
            </Grid>
          </Grid>
        </Container>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <Container sx={{ py: 8, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom>
            Produk tidak ditemukan
          </Typography>
          <Button variant="contained" onClick={() => router.push("/products")}>
            Kembali ke Produk
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const currentPrice = product.salePrice || product.price;
  const discountPercentage = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Beranda
          </Link>
          <Link href="/products" sx={{ textDecoration: "none" }}>
            Produk
          </Link>
          <Link
            href={`/products/category/${product.category.slug}`}
            sx={{ textDecoration: "none" }}
          >
            {product.category.name}
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box sx={{ position: "relative" }}>
                <img
                  src={images[selectedImage] || "/placeholder.jpg"}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "500px",
                    objectFit: "cover",
                  }}
                />

                {discountPercentage > 0 && (
                  <Chip
                    label={`-${discountPercentage}%`}
                    color="error"
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      fontWeight: "bold",
                    }}
                  />
                )}

                {product.stock < 10 && product.stock > 0 && (
                  <Chip
                    label={`Stok terbatas: ${product.stock}`}
                    color="warning"
                    size="small"
                    sx={{ position: "absolute", top: 16, right: 16 }}
                  />
                )}
              </Box>
            </Paper>

            {images.length > 1 && (
              <Box sx={{ mt: 2, display: "flex", gap: 1, overflowX: "auto" }}>
                {images.map((image, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      cursor: "pointer",
                      border: 2,
                      borderColor:
                        selectedImage === index
                          ? "primary.main"
                          : "transparent",
                      borderRadius: 1,
                      overflow: "hidden",
                      minWidth: 80,
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
                    />
                  </Paper>
                ))}
              </Box>
            )}
          </Grid>

          {/* Product Info */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ position: "sticky", top: 100 }}>
              {/* Category & SKU */}
              <Box
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
              >
                <Chip
                  label={product.category.name}
                  color="primary"
                  size="small"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  SKU: {product.sku}
                </Typography>
              </Box>

              {/* Product Name */}
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                fontWeight="bold"
              >
                {product.name}
              </Typography>

              {/* Rating & Reviews */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Rating
                  value={product.averageRating}
                  readOnly
                  precision={0.5}
                />
                <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>
                  ({product.reviewCount} ulasan)
                </Typography>
                {product.totalSold > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    {product.totalSold} terjual
                  </Typography>
                )}
              </Box>

              {/* Price */}
              <Paper
                elevation={0}
                sx={{ p: 3, mb: 3, bgcolor: "grey.50", borderRadius: 2 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    Rp {currentPrice.toLocaleString("id-ID")}
                  </Typography>
                  {product.salePrice && (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: "line-through",
                          color: "text.secondary",
                        }}
                      >
                        Rp {product.price.toLocaleString("id-ID")}
                      </Typography>
                      <Chip
                        label={`Hemat ${discountPercentage}%`}
                        color="error"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                    </>
                  )}
                </Box>
              </Paper>

              {/* Size Selection */}
              {product.productSizes.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="medium"
                  >
                    Pilih Ukuran:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {product.productSizes.map((size) => (
                      <Chip
                        key={size.id}
                        label={size.size}
                        variant={
                          selectedSize === size.size ? "filled" : "outlined"
                        }
                        color={
                          selectedSize === size.size ? "primary" : "default"
                        }
                        disabled={size.stock === 0}
                        onClick={() => setSelectedSize(size.size)}
                        sx={{
                          minWidth: 50,
                          cursor: size.stock > 0 ? "pointer" : "not-allowed",
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Quantity */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  fontWeight="medium"
                >
                  Jumlah:
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TextField
                    type="number"
                    size="small"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    inputProps={{ min: 1, max: product.stock }}
                    sx={{ width: 100 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Stok tersedia: <strong>{product.stock}</strong>
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  sx={{ py: 1.5 }}
                >
                  {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                </Button>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleWishlist}
                    startIcon={
                      isInWishlist(product.id) ? (
                        <Favorite color="error" />
                      ) : (
                        <FavoriteBorder />
                      )
                    }
                    sx={{ flex: 1 }}
                  >
                    Wishlist
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleShare}
                    startIcon={<Share />}
                    sx={{ flex: 1 }}
                  >
                    Bagikan
                  </Button>
                </Box>

                <Button
                  variant="outlined"
                  color="success"
                  size="large"
                  startIcon={<WhatsApp />}
                  onClick={handleWhatsAppContact}
                  sx={{ py: 1.5 }}
                >
                  Tanya via WhatsApp
                </Button>
              </Stack>

              {/* Trust Badges */}
              <Paper
                elevation={0}
                sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <LocalShipping color="primary" />
                      <Typography variant="caption" display="block">
                        Gratis Ongkir
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Security color="primary" />
                      <Typography variant="caption" display="block">
                        Pembayaran Aman
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Verified color="primary" />
                      <Typography variant="caption" display="block">
                        Kualitas Terjamin
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Product Details */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Detail Produk
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
              {product.description}
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Spesifikasi:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {product.weight && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">Berat:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {product.weight}g
                      </Typography>
                    </Box>
                  )}
                  {product.dimensions && (
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">Dimensi:</Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {product.dimensions} cm
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Divider sx={{ my: 6 }} />

        {/* Reviews Section */}
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Ulasan Produk ({reviews.length})
          </Typography>

          {/* Add Review Form - Only show if user can review */}
          {!loading && user && reviewsData.canReview && (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 4,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <RateReview sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h6">Tulis Ulasan Anda</Typography>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Anda dapat memberikan ulasan karena sudah membeli dan menerima
                produk ini.
              </Alert>
              <Box component="form" onSubmit={handleReviewSubmit}>
                <Box sx={{ mb: 2 }}>
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
                  placeholder="Bagikan pengalaman Anda dengan produk ini..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  sx={{ mb: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={reviewLoading}
                  startIcon={<RateReview />}
                >
                  {reviewLoading ? "Mengirim..." : "Kirim Ulasan"}
                </Button>
              </Box>
            </Paper>
          )}

          {/* Show message if user has already reviewed */}
          {!loading && user && reviewsData.hasReviewed && (
            <Alert severity="success" sx={{ mb: 4 }}>
              Terima kasih! Anda sudah memberikan ulasan untuk produk ini.
            </Alert>
          )}

          {/* Show message if user hasn't bought the product */}
          {!loading &&
            user &&
            !reviewsData.canReview &&
            !reviewsData.hasReviewed && (
              <Alert severity="info" sx={{ mb: 4 }}>
                Anda dapat memberikan ulasan setelah membeli dan menerima produk
                ini.
              </Alert>
            )}

          {/* Reviews List */}
          {reviews.length > 0 ? (
            <Grid container spacing={3}>
              {reviews.map((review) => (
                <Grid size={{ xs: 12 }} key={review.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {review.user.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 1,
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight="bold">
                            {review.user.name}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                          <Chip
                            label="Pembeli Terverifikasi"
                            color="success"
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{ mb: 1, lineHeight: 1.6 }}
                        >
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Star sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Belum ada ulasan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Jadilah yang pertama memberikan ulasan untuk produk ini
              </Typography>
            </Paper>
          )}
        </Box>
      </Container>
      <Footer />
    </>
  );
}
