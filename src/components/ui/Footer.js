"use client";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Twitter,
  WhatsApp,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.main",
        color: "white",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Enuwari Official
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Toko fashion online terpercaya dengan koleksi terlengkap dan
              kualitas terbaik.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton color="inherit" size="small">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" size="small">
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                size="small"
                onClick={() =>
                  window.open(
                    `https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP}`,
                    "_blank"
                  )
                }
              >
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Kategori
            </Typography>
            <Link
              href="/products/category/pakaian-pria"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Pakaian Pria
            </Link>
            <Link
              href="/products/category/pakaian-wanita"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Pakaian Wanita
            </Link>
            <Link
              href="/products/category/aksesoris"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Aksesoris
            </Link>
            <Link
              href="/products/category/sepatu"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Sepatu
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Layanan
            </Typography>
            <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>
              Tentang Kami
            </Link>
            <Link
              href="/shipping-info"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Info Pengiriman
            </Link>
            <Link
              href="/return-policy"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Kebijakan Pengembalian
            </Link>
            <Link
              href="/privacy-policy"
              color="inherit"
              display="block"
              sx={{ mb: 1 }}
            >
              Kebijakan Privasi
            </Link>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Kontak
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <LocationOn sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">
                Jl. Fashion Street No. 123, Jakarta
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Phone sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">+62 812-3456-7890</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="body2">info@enuwari.com</Typography>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.3)" }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2">
            © 2025 Enuwari Official. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
