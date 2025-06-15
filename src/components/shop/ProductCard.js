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
  Stack,
  Fade,
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  ShoppingCart,
  Visibility,
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
  const [isHovered, setIsHovered] = useState(false);

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
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          borderColor: "primary.main",
        },
        position: "relative",
      }}
      onClick={handleViewProduct}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Box sx={{ position: "relative", overflow: "hidden", height: 240 }}>
        <CardMedia
          component="img"
          height="100%"
          image={images[0] || "/placeholder.jpg"}
          alt={product.name}
          onLoad={() => setImageLoading(false)}
          sx={{
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            objectFit: "cover",
            width: "100%",
          }}
        />

        {/* Overlay Actions */}
        <Fade in={isHovered}>
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<Visibility />}
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": { bgcolor: "grey.100" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Lihat Detail
            </Button>
          </Box>
        </Fade>

        {/* Badges */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
          }}
        >
          {discountPercentage > 0 && (
            <Chip
              label={`-${discountPercentage}%`}
              color="error"
              size="small"
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                height: 20,
              }}
            />
          )}
          {product.isFeatured && (
            <Chip
              label="Unggulan"
              color="primary"
              size="small"
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                height: 20,
              }}
            />
          )}
          {product.stock < 10 && product.stock > 0 && (
            <Chip
              label="Stok Terbatas"
              color="warning"
              size="small"
              sx={{ fontSize: "0.75rem", height: 20 }}
            />
          )}
          {product.stock === 0 && (
            <Chip
              label="Habis"
              color="error"
              size="small"
              sx={{ fontSize: "0.75rem", height: 20 }}
            />
          )}
        </Box>

        {/* Wishlist Button */}
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(4px)",
            "&:hover": {
              bgcolor: "white",
              transform: "scale(1.1)",
            },
            transition: "all 0.2s",
          }}
          onClick={handleWishlist}
        >
          {isInWishlist(product.id) ? (
            <Favorite color="error" fontSize="small" />
          ) : (
            <FavoriteBorder fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* Content */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: 2,
          gap: 1,
        }}
      >
        {/* Category */}
        <Typography
          variant="caption"
          color="primary.main"
          fontWeight="600"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          {product.category.name}
        </Typography>

        {/* Product Name */}
        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.6em",
            fontSize: "0.95rem",
          }}
        >
          {product.name}
        </Typography>

        {/* Rating & Reviews */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ my: 0.5 }}>
          <Rating
            value={product.averageRating || 0}
            readOnly
            size="small"
            precision={0.5}
          />
          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
            ({product.reviewCount || 0})
          </Typography>
          {product.totalSold > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ ml: "auto" }}
              fontSize="0.8rem"
            >
              {product.totalSold} terjual
            </Typography>
          )}
        </Stack>

        {/* Price Section */}
        <Box sx={{ mt: "auto" }}>
          <Stack
            direction="row"
            alignItems="baseline"
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Typography
              variant="h6"
              color="primary.main"
              fontWeight="700"
              sx={{ fontSize: "1.1rem" }}
            >
              Rp {currentPrice.toLocaleString("id-ID")}
            </Typography>
            {product.salePrice && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: "text.secondary",
                  fontSize: "0.8rem",
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
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: "0.85rem",
              boxShadow: "none",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
