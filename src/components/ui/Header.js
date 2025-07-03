"use client";
import { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  ShoppingCart,
  AccountCircle,
  Search,
  Favorite,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { CartContext } from "@/context/CartContext";

export default function Header() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const cartItemCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ cursor: "pointer", mr: 4 }}
          onClick={() => router.push("/")}
        >
          Enuwari Official
        </Typography>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ flexGrow: 1, mx: 2 }}
        >
          <TextField
            size="small"
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end">
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: "white",
              borderRadius: 1,
              width: "100%",
              maxWidth: 400,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {user && (
            <>
              <IconButton
                color="inherit"
                onClick={() => router.push("/wishlist")}
              >
                <Favorite />
              </IconButton>
              <IconButton color="inherit" onClick={() => router.push("/cart")}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </>
          )}
          {user ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    router.push("/profile");
                    handleMenuClose();
                  }}
                >
                  Profil
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    router.push("/orders");
                    handleMenuClose();
                  }}
                >
                  Pesanan Saya
                </MenuItem>
                {user.role === "ADMIN" && (
                  <MenuItem
                    onClick={() => {
                      router.push("/admin");
                      handleMenuClose();
                    }}
                  >
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => {
                    clearCart();
                    logout();
                    handleMenuClose();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => router.push("/login")}>
                Login
              </Button>
              <Button color="inherit" onClick={() => router.push("/register")}>
                Daftar
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
