"use client";
import { useState, useContext } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    console.log("Form submit with data:", {
      email: formData.email,
      password: "***",
    });

    // Validasi client-side
    if (!formData.email || !formData.password) {
      setError("Email dan password harus diisi");
      setLoading(false);
      return;
    }

    if (!formData.email.includes("@")) {
      setError("Format email tidak valid");
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData);

      console.log("Login result:", result);

      if (result.success) {
        const redirect = searchParams.get("redirect") || "/";
        if (result.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push(redirect);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error("Login form error:", error);
      setError("Terjadi kesalahan yang tidak terduga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Masuk ke Akun
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selamat datang kembali di Enuwari Official
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="email"
            autoFocus
            disabled={loading}
            error={error && error.includes("email")}
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            autoComplete="current-password"
            disabled={loading}
            error={error && error.includes("password")}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Masuk...
              </>
            ) : (
              "Masuk"
            )}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">
              Belum punya akun?{" "}
              <Link href="/register" variant="body2">
                Daftar sekarang
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Debug info (hapus di production) */}
        {process.env.NODE_ENV === "development" && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="caption" display="block">
              Debug - Test Account:
            </Typography>
            <Typography variant="caption" display="block">
              Email: admin@enuwari.com
            </Typography>
            <Typography variant="caption" display="block">
              Password: admin123
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
