"use client";
import { useState, useContext } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  Avatar,
  Divider,
  TextField,
  Alert,
} from "@mui/material";
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout,
} from "@mui/icons-material";
import { CartContext } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function Cart({ open, onClose }) {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } =
    useContext(CartContext);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    onClose();
    router.push("/checkout");
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const total = getCartTotal();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">
            Keranjang Belanja ({cartItems.length})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <Divider />

        {/* Cart Items */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {cartItems.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="body1" color="text.secondary">
                Keranjang belanja kosong
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => {
                  onClose();
                  router.push("/products");
                }}
              >
                Mulai Belanja
              </Button>
            </Box>
          ) : (
            <List>
              {cartItems.map((item) => (
                <ListItem
                  key={item.id}
                  sx={{ flexDirection: "column", alignItems: "stretch" }}
                >
                  <Box sx={{ display: "flex", width: "100%", mb: 1 }}>
                    <Avatar
                      src={item.image}
                      variant="rounded"
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" noWrap>
                        {item.name}
                      </Typography>
                      {item.size && (
                        <Typography variant="body2" color="text.secondary">
                          Ukuran: {item.size}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight="bold"
                      >
                        Rp {item.price.toLocaleString("id-ID")}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        size="small"
                        value={item.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 1;
                          handleQuantityChange(item.id, newQty);
                        }}
                        inputProps={{
                          style: { textAlign: "center", width: "40px" },
                          min: 1,
                          max: item.stock,
                        }}
                        type="number"
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </Typography>
                  </Box>

                  {item.quantity >= item.stock && (
                    <Alert severity="warning" sx={{ mt: 1 }}>
                      Stok terbatas: {item.stock} item
                    </Alert>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {cartItems.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  Rp {total.toLocaleString("id-ID")}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<ShoppingCartCheckout />}
                onClick={handleCheckout}
              >
                Checkout
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
