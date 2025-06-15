"use client";
import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  TextField,
} from "@mui/material";
import {
  Assessment,
  TrendingUp,
  Download,
  DateRange,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import axios from "axios";

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [reportType, dateRange]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      const response = await axios.get(`/api/admin/reports?${params}`);
      setReportData(response.data);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const exportReport = () => {
    // Implement export functionality
    console.log("Exporting report...");
  };

  const renderSalesReport = () => {
    if (!reportData) return null;

    return (
      <Grid container spacing={3}>
        {/* Sales Summary Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Penjualan
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(reportData.totalSales)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Pesanan
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {reportData.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Rata-rata Pesanan
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(reportData.averageOrderValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Pertumbuhan
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                +12.5%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Sales Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Penjualan Harian
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Penjualan"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1976d2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Status */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Penjualan berdasarkan Status
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Jumlah</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.salesByStatus?.map((item) => (
                      <TableRow key={item.status}>
                        <TableCell>
                          <Chip label={item.status} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          {item._count.status}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item._sum.total || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderProductsReport = () => {
    if (!reportData) return null;

    return (
      <Grid container spacing={3}>
        {/* Top Selling Products */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Produk Terlaris
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produk</TableCell>
                      <TableCell align="right">Terjual</TableCell>
                      <TableCell align="right">Pendapatan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.topSellingProducts?.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                              src={
                                product.images
                                  ? JSON.parse(product.images)[0]
                                  : ""
                              }
                              variant="rounded"
                              sx={{ mr: 2 }}
                            />
                            <Typography variant="body2">
                              {product.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{product.totalSold}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(product.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Products */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stok Menipis
              </Typography>
              {reportData.lowStockProducts?.map((product) => (
                <Box
                  key={product.id}
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {product.name}
                  </Typography>
                  <Chip
                    label={`Stok: ${product.stock}`}
                    color="warning"
                    size="small"
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performa Kategori
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Kategori</TableCell>
                      <TableCell align="right">Total Produk</TableCell>
                      <TableCell align="right">Terjual</TableCell>
                      <TableCell align="right">Pendapatan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.categoryPerformance?.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell align="right">
                          {category.totalProducts}
                        </TableCell>
                        <TableCell align="right">
                          {category.totalSold}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(category.totalRevenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCustomersReport = () => {
    if (!reportData) return null;

    return (
      <Grid container spacing={3}>
        {/* Customer Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Pelanggan
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {reportData.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Pelanggan Baru
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {reportData.newCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pelanggan Terbaik
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pelanggan</TableCell>
                      <TableCell align="right">Total Pesanan</TableCell>
                      <TableCell align="right">Total Belanja</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.topCustomers?.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2 }}>
                              {customer.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {customer.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {customer.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {customer.totalOrders}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Customer Growth Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pertumbuhan Pelanggan
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={reportData.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newCustomers" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Laporan & Analitik
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={exportReport}
        >
          Export Laporan
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Jenis Laporan</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="sales">Penjualan</MenuItem>
                <MenuItem value="products">Produk</MenuItem>
                <MenuItem value="customers">Pelanggan</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Tanggal Mulai"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              type="date"
              label="Tanggal Akhir"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<Assessment />}
              onClick={fetchReportData}
            >
              Generate Laporan
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Report Content */}
      {loading ? (
        <LoadingSpinner message="Memuat laporan..." />
      ) : (
        <Box>
          {reportType === "sales" && renderSalesReport()}
          {reportType === "products" && renderProductsReport()}
          {reportType === "customers" && renderCustomersReport()}
        </Box>
      )}
    </Box>
  );
}
