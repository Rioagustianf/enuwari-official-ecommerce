"use client";
import { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Avatar,
  Divider,
  Breadcrumbs,
  Link,
  Alert,
  Tab,
  Tabs,
} from "@mui/material";
import {
  Home,
  Edit,
  Save,
  Cancel,
  Person,
  Security,
  History,
} from "@mui/icons-material";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser, loading } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, loading]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });
      if (!res.ok) throw new Error("Gagal update profil");
      const data = await res.json();
      updateUser(data.user);
      setEditing(false);
      setMessage("Profil berhasil diperbarui");
    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("Password baru tidak cocok");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      if (!res.ok) throw new Error("Gagal update password");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setMessage("Password berhasil diperbarui");
    } catch (error) {
      setMessage(error.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  if (!user) {
    return null;
  }

  const renderProfileTab = () => (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, fontSize: "2rem" }}>
            {user.name?.charAt(0) || "U"}
          </Avatar>
          <Box>
            <Typography variant="h5">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member sejak{" "}
              {new Date(user.createdAt).toLocaleDateString("id-ID")}
            </Typography>
          </Box>
        </Box>

        {message && (
          <Alert
            severity={message.includes("berhasil") ? "success" : "error"}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handleProfileUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                disabled={!editing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={!editing}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nomor Telepon"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                disabled={!editing}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            {editing ? (
              <>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Save />}
                  disabled={loading}
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={() => {
                    setEditing(false);
                    setProfileData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || "",
                    });
                  }}
                >
                  Batal
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditing(true)}
              >
                Edit Profil
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderSecurityTab = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Ubah Password
        </Typography>

        {message && (
          <Alert
            severity={message.includes("berhasil") ? "success" : "error"}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        <Box component="form" onSubmit={handlePasswordUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password Saat Ini"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password Baru"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Konfirmasi Password Baru"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? "Mengupdate..." : "Update Password"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

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
          <Typography color="text.primary">Profil</Typography>
        </Breadcrumbs>

        <Typography variant="h4" gutterBottom>
          Profil Saya
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
          >
            <Tab icon={<Person />} label="Profil" />
            <Tab icon={<Security />} label="Keamanan" />
            <Tab icon={<History />} label="Aktivitas" />
          </Tabs>
        </Box>

        {activeTab === 0 && renderProfileTab()}
        {activeTab === 1 && renderSecurityTab()}
        {activeTab === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aktivitas Terakhir
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fitur ini akan segera tersedia
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
      <Footer />
    </>
  );
}
