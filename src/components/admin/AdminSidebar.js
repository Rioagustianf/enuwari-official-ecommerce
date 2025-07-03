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
  Chip,
  useTheme,
  alpha,
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
} from "@mui/icons-material";
import { useRouter, usePathname } from "next/navigation";

const drawerWidth = 280;

export default function AdminSidebar({
  user,
  mobileOpen = false,
  onMobileClose = () => {},
  isMobile = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
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
  };

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          open
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRight: "none",
              boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
            },
            display: { xs: "none", md: "block" },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "white", mb: 1 }}
            >
              Enuwari
            </Typography>
            <Chip
              label="Admin Panel"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: "white",
                fontWeight: 500,
              }}
            />
          </Box>

          {/* User Info */}
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                bgcolor: alpha(theme.palette.common.white, 0.1),
                borderRadius: 3,
                backdropFilter: "blur(10px)",
              }}
            >
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {user?.name?.charAt(0) || "A"}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {user?.name || "Admin"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: alpha(theme.palette.common.white, 0.8) }}
                >
                  Administrator
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Menu Items */}
          <List sx={{ px: 2, py: 1, flex: 1 }}>
            {menuItems.map((item) => (
              <Box key={item.text} sx={{ mb: 0.5 }}>
                {item.submenu ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => setProductMenuOpen(!productMenuOpen)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.common.white, 0.1),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: "white",
                          }}
                        />
                        {productMenuOpen ? (
                          <ExpandLess sx={{ color: "white" }} />
                        ) : (
                          <ExpandMore sx={{ color: "white" }} />
                        )}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={productMenuOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.submenu.map((subItem) => (
                          <ListItem key={subItem.text} disablePadding>
                            <ListItemButton
                              onClick={() => handleNavigation(subItem.path)}
                              selected={isActive(subItem.path)}
                              sx={{
                                pl: 6,
                                borderRadius: 2,
                                mb: 0.5,
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.common.white,
                                    0.1
                                  ),
                                },
                                "&.Mui-selected": {
                                  bgcolor: alpha(
                                    theme.palette.common.white,
                                    0.2
                                  ),
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.common.white,
                                      0.25
                                    ),
                                  },
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{ color: "white", minWidth: 36 }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                primaryTypographyProps={{
                                  fontWeight: isActive(subItem.path)
                                    ? 600
                                    : 500,
                                  color: "white",
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
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
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 600 : 500,
                          color: "white",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </Box>
            ))}
          </List>

          {/* Footer */}
          <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                },
              }}
              onClick={() => handleNavigation("/admin/settings")}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Pengaturan"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: "white",
                }}
              />
            </ListItemButton>

            <ListItemButton
              sx={{
                borderRadius: 2,
                mt: 0.5,
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
              onClick={() => {
                // Handle logout
                router.push("/login");
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Keluar"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: "white",
                }}
              />
            </ListItemButton>
          </Box>
        </Drawer>
      )}
      {/* Sidebar for Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRight: "none",
              boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
            },
            display: { xs: "block", md: "none" },
            zIndex: 1302,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "white", mb: 1 }}
            >
              Enuwari
            </Typography>
            <Chip
              label="Admin Panel"
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: "white",
                fontWeight: 500,
              }}
            />
          </Box>

          {/* User Info */}
          <Box sx={{ p: 3, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                bgcolor: alpha(theme.palette.common.white, 0.1),
                borderRadius: 3,
                backdropFilter: "blur(10px)",
              }}
            >
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: theme.palette.primary.main,
                  width: 48,
                  height: 48,
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                }}
              >
                {user?.name?.charAt(0) || "A"}
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "white" }}
                >
                  {user?.name || "Admin"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: alpha(theme.palette.common.white, 0.8) }}
                >
                  Administrator
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Menu Items */}
          <List sx={{ px: 2, py: 1, flex: 1 }}>
            {menuItems.map((item) => (
              <Box key={item.text} sx={{ mb: 0.5 }}>
                {item.submenu ? (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => setProductMenuOpen(!productMenuOpen)}
                        sx={{
                          borderRadius: 2,
                          mb: 0.5,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.common.white, 0.1),
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontWeight: 500,
                            color: "white",
                          }}
                        />
                        {productMenuOpen ? (
                          <ExpandLess sx={{ color: "white" }} />
                        ) : (
                          <ExpandMore sx={{ color: "white" }} />
                        )}
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={productMenuOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding>
                        {item.submenu.map((subItem) => (
                          <ListItem key={subItem.text} disablePadding>
                            <ListItemButton
                              onClick={() => handleNavigation(subItem.path)}
                              selected={isActive(subItem.path)}
                              sx={{
                                pl: 6,
                                borderRadius: 2,
                                mb: 0.5,
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.common.white,
                                    0.1
                                  ),
                                },
                                "&.Mui-selected": {
                                  bgcolor: alpha(
                                    theme.palette.common.white,
                                    0.2
                                  ),
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.common.white,
                                      0.25
                                    ),
                                  },
                                },
                              }}
                            >
                              <ListItemIcon
                                sx={{ color: "white", minWidth: 36 }}
                              >
                                {subItem.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={subItem.text}
                                primaryTypographyProps={{
                                  fontWeight: isActive(subItem.path)
                                    ? 600
                                    : 500,
                                  color: "white",
                                }}
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </>
                ) : (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive(item.path)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
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
                      <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isActive(item.path) ? 600 : 500,
                          color: "white",
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
              </Box>
            ))}
          </List>

          {/* Footer */}
          <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                },
              }}
              onClick={() => handleNavigation("/admin/settings")}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary="Pengaturan"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: "white",
                }}
              />
            </ListItemButton>

            <ListItemButton
              sx={{
                borderRadius: 2,
                mt: 0.5,
                "&:hover": {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                },
              }}
              onClick={() => {
                // Handle logout
                router.push("/login");
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Keluar"
                primaryTypographyProps={{
                  fontWeight: 500,
                  color: "white",
                }}
              />
            </ListItemButton>
          </Box>
        </Drawer>
      )}
    </>
  );
}
