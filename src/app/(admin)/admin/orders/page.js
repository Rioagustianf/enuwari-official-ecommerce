"use client";
import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Paper,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import OrderTable from "@/components/admin/OrderTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import axios from "axios";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const statusTabs = [
    { label: "Semua", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Dikonfirmasi", value: "CONFIRMED" },
    { label: "Diproses", value: "PROCESSING" },
    { label: "Dikirim", value: "SHIPPED" },
    { label: "Selesai", value: "DELIVERED" },
  ];

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchQuery, pagination.page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (statusTabs[activeTab].value) {
        params.append("status", statusTabs[activeTab].value);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await axios.get(`/api/orders?${params}`);
      setOrders(response.data.orders);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Kelola Pesanan
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Cari berdasarkan nomor pesanan atau nama pelanggan..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Status Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {statusTabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <OrderTable orders={orders} onOrderUpdate={fetchOrders} />

              {/* Pagination */}
              {orders.length > 0 && (
                <Box sx={{ p: 3 }}>
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                  />
                </Box>
              )}

              {/* Empty State */}
              {orders.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                  <Typography variant="h6" gutterBottom>
                    Tidak ada pesanan ditemukan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {statusTabs[activeTab].value
                      ? `Tidak ada pesanan dengan status ${statusTabs[
                          activeTab
                        ].label.toLowerCase()}`
                      : "Belum ada pesanan masuk"}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
