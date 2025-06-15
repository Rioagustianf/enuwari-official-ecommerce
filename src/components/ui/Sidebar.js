"use client";

import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Collapse,
  Avatar,
  useTheme,
  useMediaQuery,
  alpha,
  IconButton,
} from "@mui/material";
import {
  Dashboard,
  Inventory,
  Category,
  ShoppingCart,
  People,
  Assessment,
  LocalOffer,
  ViewCarousel,
  ExpandLess,
  ExpandMore,
  Add,
  List as ListIcon,
  Settings,
  ExitToApp,
  Close,
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 280;

export default function AdminSidebar({ mobileOpen, onMobileClose, user }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [productMenuOpen, setProductMenuOpen] = useState(false);

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/admin/dashboard",
    },
    {
      text: "Produk",
      icon: <Inventory />,
      submenu: [
        { text: "Semua Produk", icon: <ListIcon />, path: "/admin/products" },
        {
          text: "Tambah Produk",
          icon: <Add />,
          path: "/admin/products/create",
        },
      ],
    },
    {
      text: "Kategori",
      icon: <Category />,
      path: "/admin/categories",
    },
    {
      text: "Pesanan",
      icon: <ShoppingCart />,
      path: "/admin/orders",
    },
    {
      text: "Pelanggan",
      icon: <People />,
      path: "/admin/customers",
    },
    {
      text: "Laporan",
      icon: <Assessment />,
      path: "/admin/reports",
    },
    {
      text: "Promosi",
      icon: <LocalOffer />,
      path: "/admin/promotions",
    },
    {
      text: "Banner",
      icon: <ViewCarousel />,
      path: "/admin/banners",
    },
  ];

  const handleNavigation = (path) => {
    router.push(path);
    if (isMobile && onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (path) => {
    return pathname === path;
  };

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
            Admin Panel
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Enuwari Official
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={onMobileClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* User Info */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Avatar sx={{ bgcolor: "#3b82f6", width: 40, height: 40 }}>
          {user?.name?.charAt(0) || "A"}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              color: "white",
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.name || "Admin Enuwari"}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "rgba(255,255,255,0.7)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Administrator
          </Typography>
        </Box>
      </Box>

      {/* Menu Items */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <List sx={{ px: 2, py: 1 }}>
          {menuItems.map((item) => (
            <Box key={item.text}>
              {item.submenu ? (
                <>
                  <ListItemButton
                    onClick={() => setProductMenuOpen(!productMenuOpen)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      color: "white",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    />
                    {productMenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={productMenuOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu.map((subItem) => (
                        <ListItemButton
                          key={subItem.text}
                          onClick={() => handleNavigation(subItem.path)}
                          selected={isActive(subItem.path)}
                          sx={{
                            pl: 6,
                            borderRadius: 2,
                            mb: 0.5,
                            color: "white",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.common.white, 0.1),
                            },
                            "&.Mui-selected": {
                              bgcolor: alpha(theme.palette.common.white, 0.2),
                              "&:hover": {
                                bgcolor: alpha(
                                  theme.palette.common.white,
                                  0.25
                                ),
                              },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontSize: "0.875rem",
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={isActive(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: "white",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                    "&.Mui-selected": {
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.common.white, 0.25),
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              )}
            </Box>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <ListItemButton
          onClick={() => {
            router.push("/login");
            if (isMobile && onMobileClose) {
              onMobileClose();
            }
          }}
          sx={{
            borderRadius: 2,
            color: "white",
            "&:hover": {
              bgcolor: alpha(theme.palette.error.main, 0.1),
            },
          }}
        >
          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: drawerWidth },
        flexShrink: { md: 0 },
      }}
    >
      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            backgroundColor: "#1e293b",
            border: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            backgroundColor: "#1e293b",
            border: "none",
            position: "fixed",
            height: "100vh",
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
