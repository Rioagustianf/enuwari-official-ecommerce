"use client";
import { useState, useContext } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  Rating,
  Chip,
  Badge,
  Paper,
  Stack,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Visibility,
  LocalOffer,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import { WishlistContext } from "@/context/WishlistContext";
import { NotificationContext } from "@/context/NotificationContext";

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { addToWishlist, isInWishlist } = useContext(WishlistContext);
  const { showSuccess, showError } = useContext(NotificationContext);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) {
      showError("Produk sedang habis stok");
      return;
    }
    addToCart(product, 1);
    showSuccess("Produk ditambahkan ke keranjang");
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    await addToWishlist(product);
  };

  const handleViewProduct = () => {
    router.push(`/products/${product.id}`);
  };

  const discountPercentage = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const currentPrice = product.salePrice || product.price;
  const images = product.images ? JSON.parse(product.images) : [];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "all 0.3s ease-in-out",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: (theme) => theme.shadows[8],
          borderColor: "primary.main",
        },
        position: "relative",
        overflow: "hidden",
      }}
      onClick={handleViewProduct}
    >
      {/* Image Container */}
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <CardMedia
          component="img"
          height="240"
          image={images[0] || "/placeholder.jpg"}
          alt={product.name}
          onLoad={() => setImageLoading(false)}
          sx={{
            transition: "transform 0.3s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
            },
          }}
        />

        {/* Overlay on hover */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s ease-in-out",
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <Button
            variant="contained"
            startIcon={<Visibility />}
            sx={{
              bgcolor: "white",
              color: "primary.main",
              "&:hover": {
                bgcolor: "grey.100",
              },
            }}
          >
            Lihat Detail
          </Button>
        </Box>

        {/* Badges */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {discountPercentage > 0 && (
            <Chip
              label={`-${discountPercentage}%`}
              color="error"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          )}
          {product.isFeatured && (
            <Chip
              label="Unggulan"
              color="primary"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          )}
          {product.stock < 10 && product.stock > 0 && (
            <Chip label="Stok Terbatas" color="warning" size="small" />
          )}
          {product.stock === 0 && (
            <Chip label="Habis" color="error" size="small" />
          )}
        </Box>

        {/* Wishlist Button */}
        <IconButton
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "rgba(255,255,255,0.9)",
            "&:hover": {
              bgcolor: "white",
              transform: "scale(1.1)",
            },
          }}
          onClick={handleWishlist}
        >
          {isInWishlist(product.id) ? (
            <Favorite color="error" />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
      </Box>

      {/* Content */}
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 2 }}
      >
        {/* Category */}
        <Typography
          variant="caption"
          color="primary"
          fontWeight="medium"
          gutterBottom
        >
          {product.category.name}
        </Typography>

        {/* Product Name */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "3.2em",
          }}
        >
          {product.name}
        </Typography>

        {/* Rating & Reviews */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Rating
            value={product.averageRating || 0}
            readOnly
            size="small"
            precision={0.5}
          />
          <Typography variant="body2" sx={{ ml: 1, color: "text.secondary" }}>
            ({product.reviewCount || 0})
          </Typography>
          {product.totalSold > 0 && (
            <Typography
              variant="body2"
              sx={{ ml: "auto", color: "text.secondary" }}
            >
              {product.totalSold} terjual
            </Typography>
          )}
        </Box>

        {/* Price Section */}
        <Box sx={{ mt: "auto" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Rp {currentPrice.toLocaleString("id-ID")}
            </Typography>
            {product.salePrice && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: "text.secondary",
                }}
              >
                Rp {product.price.toLocaleString("id-ID")}
              </Typography>
            )}
          </Stack>

          {/* Action Button */}
          <Button
            variant="contained"
            fullWidth
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            sx={{
              py: 1,
              fontWeight: 600,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
