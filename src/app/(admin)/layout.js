"use client";

import { useContext, useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
} from "@mui/material";
import { AuthContext } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import theme from "@/styles/theme";
import MenuIcon from "@mui/icons-material/Menu";
import { NotificationProvider } from "@/context/NotificationContext";

const drawerWidth = 280;

export default function AdminLayout({ children }) {
  const { user, loading, checkAuth } = useContext(AuthContext);
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  useEffect(() => {
    const initAuth = async () => {
      if (!authChecked) {
        await checkAuth();
        setAuthChecked(true);
      }
    };
    initAuth();
  }, [checkAuth, authChecked]);

  useEffect(() => {
    if (authChecked && !loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, loading, authChecked, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (loading || !authChecked) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <NotificationProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          {/* AppBar for Mobile */}
          {isMobile && (
            <AppBar
              position="fixed"
              color="inherit"
              elevation={1}
              sx={{ zIndex: 1301 }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
                  variant="h6"
                  noWrap
                  sx={{ flexGrow: 1, fontWeight: 700 }}
                >
                  Admin Panel
                </Typography>
              </Toolbar>
            </AppBar>
          )}

          {/* Sidebar */}
          <AdminSidebar
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
            user={user}
            isMobile={isMobile}
          />

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              width: {
                xs: "100%",
                md: `calc(100% - ${drawerWidth}px)`,
              },
              marginLeft: {
                xs: 0,
                md: `${drawerWidth}px`,
              },
              marginTop: {
                xs: isMobile ? "64px" : 0,
                md: 0,
              },
              minHeight: "100vh",
              backgroundColor: "#f8fafc",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                overflow: "auto",
                p: { xs: 2, sm: 3 },
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </NotificationProvider>
  );
}
