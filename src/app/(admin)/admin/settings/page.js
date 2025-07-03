"use client";
import { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import { NotificationContext } from "@/context/NotificationContext";

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const { showSuccess, showError } = useContext(NotificationContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setProfile({ name: data.name || "" });
    } catch (error) {
      showError("Gagal mengambil data admin");
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name }),
      });
      if (!res.ok) throw new Error();
      showSuccess("Profil admin berhasil diupdate!");
    } catch {
      showError("Gagal update profil admin");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      showError("Semua field password wajib diisi");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showError("Password baru dan konfirmasi tidak sama");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwords.new,
          oldPassword: passwords.old,
        }),
      });
      if (!res.ok) throw new Error();
      showSuccess("Password admin berhasil diganti!");
      setPasswords({ old: "", new: "", confirm: "" });
    } catch {
      showError("Gagal ganti password admin");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 6 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Pengaturan Admin
      </Typography>
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ubah Profil
          </Typography>
          <form onSubmit={handleProfileSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nama Admin"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleProfileChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Divider sx={{ my: 4 }} />
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ganti Password
          </Typography>
          <form onSubmit={handlePasswordSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Password Lama"
                  name="old"
                  value={passwords.old}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Password Baru"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Konfirmasi Password Baru"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  fullWidth
                  required
                  type="password"
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" disabled={pwLoading}>
                  {pwLoading ? "Menyimpan..." : "Ganti Password"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
