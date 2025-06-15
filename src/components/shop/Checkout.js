"use client";
import { useState, useContext, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { CartContext } from "@/context/CartContext";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

const steps = [
  "Informasi Pengiriman",
  "Metode Pengiriman",
  "Pembayaran",
  "Konfirmasi",
];

export default function Checkout() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Shipping Information State
  const [shippingData, setShippingData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    province: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  // Shipping Options State
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    fetchProvinces();
  }, [user, cartItems, router]);

  // Update shipping data when user changes
  useEffect(() => {
    if (user) {
      setShippingData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const fetchProvinces = async () => {
    try {
      const response = await axios.get(
        "/api/shipping/rajaongkir?type=province"
      );
      if (response.data.rajaongkir?.results) {
        setProvinces(response.data.rajaongkir.results);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
    }
  };

  const fetchCities = async (provinceId) => {
    try {
      const response = await axios.get(
        `/api/shipping/rajaongkir?type=city&province=${provinceId}`
      );
      if (response.data.rajaongkir?.results) {
        setCities(response.data.rajaongkir.results);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const calculateShipping = async () => {
    if (!shippingData.city) {
      alert("Pilih kota tujuan terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const totalWeight = cartItems.reduce(
        (total, item) => total + (item.weight || 500) * item.quantity,
        0
      );

      console.log("Calculating shipping with:", {
        origin: "501",
        destination: shippingData.city,
        weight: totalWeight,
        courier: "jne",
      });

      const response = await axios.post("/api/shipping/rajaongkir", {
        origin: "501", // Jakarta (sesuaikan dengan lokasi toko)
        destination: shippingData.city,
        weight: totalWeight,
        courier: "jne",
      });

      console.log("Shipping response:", response.data);

      if (response.data.rajaongkir?.results) {
        const options = [];
        response.data.rajaongkir.results.forEach((courier) => {
          courier.costs.forEach((cost) => {
            options.push({
              courier: courier.code,
              courierName: courier.name,
              service: cost.service,
              description: cost.description,
              cost: cost.cost[0].value,
              etd: cost.cost[0].etd,
            });
          });
        });
        setShippingOptions(options);
      } else {
        throw new Error("Format response tidak valid");
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      alert(
        "Gagal menghitung ongkos kirim: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceChange = (provinceId) => {
    setShippingData((prev) => ({
      ...prev,
      province: provinceId,
      city: "",
    }));
    setCities([]);
    setShippingOptions([]);
    setSelectedShipping(null);
    fetchCities(provinceId);
  };

  const handleCityChange = (cityId) => {
    setShippingData((prev) => ({
      ...prev,
      city: cityId,
    }));
    setShippingOptions([]);
    setSelectedShipping(null);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate shipping info
      if (
        !shippingData.name ||
        !shippingData.phone ||
        !shippingData.address ||
        !shippingData.city
      ) {
        alert("Mohon lengkapi informasi pengiriman");
        return;
      }
      calculateShipping();
    } else if (activeStep === 1) {
      // Validate shipping method
      if (!selectedShipping) {
        alert("Pilih metode pengiriman");
        return;
      }
    } else if (activeStep === 2) {
      // Validate payment method
      if (!paymentMethod) {
        alert("Pilih metode pembayaran");
        return;
      }
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Create order
      const orderData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
        shippingAddress: `${shippingData.address}, ${getCityName(
          shippingData.city
        )}, ${getProvinceName(shippingData.province)} ${
          shippingData.postalCode
        }`,
        shippingCost: selectedShipping.cost,
        courier: selectedShipping.courier,
        service: selectedShipping.service,
      };

      const orderResponse = await axios.post("/api/orders", orderData);
      const order = orderResponse.data;

      // Process payment
      if (paymentMethod === "midtrans") {
        const paymentData = {
          orderId: order.id,
          customerDetails: {
            first_name: shippingData.name,
            phone: shippingData.phone,
            email: shippingData.email,
          },
          itemDetails: cartItems.map((item) => ({
            id: item.productId,
            price: parseInt(item.price),
            quantity: item.quantity,
            name: item.name,
          })),
          shippingCost: selectedShipping.cost,
        };

        const paymentResponse = await axios.post(
          "/api/payment/midtrans",
          paymentData
        );

        window.snap.pay(paymentResponse.data.token, {
          onSuccess: function (result) {
            clearCart();
            router.push(`/payment-success?order=${order.id}`);
          },
          onPending: function (result) {
            router.push(`/payment-success?order=${order.id}`);
          },
          onError: function (result) {
            console.error("Payment error:", result);
          },
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Terjadi kesalahan saat checkout");
    } finally {
      setLoading(false);
    }
  };

  const getCityName = (cityId) => {
    const city = cities.find((c) => c.city_id === cityId);
    return city ? city.city_name : "";
  };

  const getProvinceName = (provinceId) => {
    const province = provinces.find((p) => p.province_id === provinceId);
    return province ? province.province : "";
  };

  const subtotal = getCartTotal();
  const shippingCost = selectedShipping ? selectedShipping.cost : 0;
  const total = subtotal + shippingCost;

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={shippingData.name}
                onChange={(e) =>
                  setShippingData({ ...shippingData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nomor Telepon"
                value={shippingData.phone}
                onChange={(e) =>
                  setShippingData({ ...shippingData, phone: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={shippingData.email}
                onChange={(e) =>
                  setShippingData({ ...shippingData, email: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Alamat Lengkap"
                multiline
                rows={3}
                value={shippingData.address}
                onChange={(e) =>
                  setShippingData({ ...shippingData, address: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Provinsi</InputLabel>
                <Select
                  value={shippingData.province}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                >
                  {provinces.map((province) => (
                    <MenuItem
                      key={province.province_id}
                      value={province.province_id}
                    >
                      {province.province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Kota/Kabupaten</InputLabel>
                <Select
                  value={shippingData.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={!cities.length}
                >
                  {cities.map((city) => (
                    <MenuItem key={city.city_id} value={city.city_id}>
                      {city.city_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Kode Pos"
                value={shippingData.postalCode}
                onChange={(e) =>
                  setShippingData({
                    ...shippingData,
                    postalCode: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Catatan (Opsional)"
                multiline
                rows={2}
                value={shippingData.notes}
                onChange={(e) =>
                  setShippingData({ ...shippingData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Box>
            {loading ? (
              <Typography>Menghitung ongkos kirim...</Typography>
            ) : shippingOptions.length > 0 ? (
              <RadioGroup
                value={
                  selectedShipping
                    ? `${selectedShipping.courier}-${selectedShipping.service}`
                    : ""
                }
                onChange={(e) => {
                  const [courier, service] = e.target.value.split("-");
                  const option = shippingOptions.find(
                    (opt) => opt.courier === courier && opt.service === service
                  );
                  setSelectedShipping(option);
                }}
              >
                {shippingOptions.map((option, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <FormControlLabel
                        value={`${option.courier}-${option.service}`}
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="subtitle1">
                              {option.courierName} - {option.service}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {option.description}
                            </Typography>
                            <Typography variant="body2">
                              Estimasi: {option.etd} hari
                            </Typography>
                            <Typography variant="h6" color="primary">
                              Rp {option.cost.toLocaleString("id-ID")}
                            </Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                ))}
              </RadioGroup>
            ) : (
              <Alert severity="info">
                Silakan lengkapi informasi pengiriman terlebih dahulu
              </Alert>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Pilih Metode Pembayaran
            </Typography>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <FormControlLabel
                    value="midtrans"
                    control={<Radio />}
                    label={
                      <Box>
                        <Typography variant="subtitle1">
                          Pembayaran Online (Midtrans)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Kartu Kredit, Debit, E-Wallet, Bank Transfer
                        </Typography>
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </RadioGroup>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Konfirmasi Pesanan
            </Typography>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Informasi Pengiriman
                </Typography>
                <Typography variant="body2">
                  {shippingData.name} - {shippingData.phone}
                </Typography>
                <Typography variant="body2">{shippingData.address}</Typography>
                <Typography variant="body2">
                  {getCityName(shippingData.city)},{" "}
                  {getProvinceName(shippingData.province)}{" "}
                  {shippingData.postalCode}
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Metode Pengiriman
                </Typography>
                <Typography variant="body2">
                  {selectedShipping?.courierName} - {selectedShipping?.service}
                </Typography>
                <Typography variant="body2">
                  Estimasi: {selectedShipping?.etd} hari
                </Typography>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Ringkasan Pesanan
                </Typography>
                <List dense>
                  {cartItems.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={`${item.name} ${
                          item.size ? `(${item.size})` : ""
                        }`}
                        secondary={`${
                          item.quantity
                        } x Rp ${item.price.toLocaleString("id-ID")}`}
                      />
                      <Typography variant="body2">
                        Rp{" "}
                        {(item.price * item.quantity).toLocaleString("id-ID")}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal:</Typography>
                  <Typography>Rp {subtotal.toLocaleString("id-ID")}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Ongkos Kirim:</Typography>
                  <Typography>
                    Rp {shippingCost.toLocaleString("id-ID")}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    Rp {total.toLocaleString("id-ID")}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return "Unknown step";
    }
  };

  if (!user || cartItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 3, mb: 3 }}>{renderStepContent(activeStep)}</Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Kembali
        </Button>

        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? "Memproses..." : "Buat Pesanan"}
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            Lanjut
          </Button>
        )}
      </Box>
    </Box>
  );
}
