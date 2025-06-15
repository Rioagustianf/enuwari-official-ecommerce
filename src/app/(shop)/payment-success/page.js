"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Container, Typography, Button, Box } from "@mui/material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const router = useRouter();

  return (
    <>
      <Header />
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" color="primary" gutterBottom>
            🎉 Terima Kasih!
          </Typography>
          <Typography variant="h5" gutterBottom>
            Pembayaran Anda berhasil.
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Pesanan Anda sedang diproses. Anda dapat melihat detail pesanan di
            halaman berikut.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push(`/orders/${orderId}`)}
          >
            Lihat Detail Pesanan
          </Button>
        </Box>
      </Container>
      <Footer />
    </>
  );
}
