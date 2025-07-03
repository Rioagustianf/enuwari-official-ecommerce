"use client";
import { useState, useEffect, useContext } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  Paper,
} from "@mui/material";
import { Search, Person } from "@mui/icons-material";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Pagination from "@/components/common/Pagination";
import { NotificationContext } from "@/context/NotificationContext";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const { showError } = useContext(NotificationContext);

  useEffect(() => {
    fetchCustomers();
  }, [searchQuery, pagination.page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        role: "CUSTOMER",
      });

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error("Gagal fetch pelanggan");
      const data = await res.json();
      setCustomers(data.users);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      showError("Oops! Gagal ambil data pelanggan, coba refresh dulu 😅");
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Kelola Pelanggan
      </Typography>

      {/* Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Cari pelanggan berdasarkan nama atau email..."
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

      {/* Customers Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Pelanggan</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telepon</TableCell>
                    <TableCell>Bergabung</TableCell>
                    <TableCell>Total Pesanan</TableCell>
                    <TableCell>Total Belanja</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ mr: 2 }}>
                            {customer.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {customer.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {customer.id.slice(-8)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {customer.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {customer.phone || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(customer.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={customer._count?.orders || 0}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          Rp{" "}
                          {(customer.totalSpent || 0).toLocaleString("id-ID")}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {!loading && customers.length > 0 && (
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
          {!loading && customers.length === 0 && (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Tidak ada pelanggan ditemukan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? "Coba ubah kata kunci pencarian"
                  : "Belum ada pelanggan yang terdaftar"}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
