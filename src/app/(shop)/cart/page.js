"use client";
import { useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  IconButton,
  TextField,
  Divider,
  Avatar,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Add,
  Remove,
  Delete,
  ShoppingCartCheckout,
  Home,
  ArrowBack,
} from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } =
    useContext(CartContext);
  const { user, loading } = useContext(AuthContext);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }
    router.push("/checkout");
  };

  const total = getCartTotal();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link href="/" sx={{ display: "flex", alignItems: "center" }}>
            <Home sx={{ mr: 0.5 }} fontSize="inherit" />
            Beranda
          </Link>
          <Typography color="text.primary">Keranjang</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Keranjang Belanja
        </Typography>

        {cartItems.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" gutterBottom>
                Keranjang belanja kosong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Belum ada produk yang ditambahkan ke keranjang
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => router.push("/products")}
              >
                Mulai Belanja
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {/* Cart Items */}
            <Grid size={{ xs: 12, md: 8 }}>
              {cartItems.map((item) => (
                <Card key={item.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={item.image}
                        variant="rounded"
                        sx={{ width: 80, height: 80, mr: 2 }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {item.name}
                        </Typography>
                        {item.size && (
                          <Typography variant="body2" color="text.secondary">
                            Ukuran: {item.size}
                          </Typography>
                        )}
                        <Typography variant="h6" color="primary">
                          Rp {Number(item.price || 0).toLocaleString("id-ID")}
                        </Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: 2 }}
                      >
                        <IconButton
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
                            style: { textAlign: "center", width: "60px" },
                            min: 1,
                            max: item.stock,
                          }}
                          type="number"
                        />
                        <IconButton
                          onClick={() =>
                            handleQuantityChange(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.stock}
                        >
                          <Add />
                        </IconButton>
                      </Box>

                      <Box sx={{ textAlign: "right", mr: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Rp{" "}
                          {Number(item.price || 0) * item.quantity > 0
                            ? (
                                Number(item.price) * item.quantity
                              ).toLocaleString("id-ID")
                            : "0"}
                        </Typography>
                      </Box>

                      <IconButton
                        onClick={() => removeFromCart(item.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>

                    {item.quantity >= item.stock && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Stok terbatas: {item.stock} item tersedia
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Grid>

            {/* Order Summary */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ position: "sticky", top: 20 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Ringkasan Pesanan
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    {cartItems.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography variant="body2">
                          {item.name} x{item.quantity}
                        </Typography>
                        <Typography variant="body2">
                          Rp{" "}
                          {Number(item.price || 0) * item.quantity > 0
                            ? (
                                Number(item.price) * item.quantity
                              ).toLocaleString("id-ID")
                            : "0"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Typography variant="body1">Subtotal:</Typography>
                    <Typography variant="body1">
                      Rp {total.toLocaleString("id-ID")}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 3,
                    }}
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

                  <Button
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => router.push("/products")}
                  >
                    Lanjut Belanja
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
      <Footer />
    </>
  );
}
