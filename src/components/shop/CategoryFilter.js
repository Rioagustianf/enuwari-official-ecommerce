"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Chip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { ExpandMore, FilterList } from "@mui/icons-material";
import axios from "axios";

export default function CategoryFilter({
  onFilterChange,
  currentFilters = {},
}) {
  const [categories, setCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.category || ""
  );
  const [sortBy, setSortBy] = useState(currentFilters.sort || "newest");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    onFilterChange({ ...currentFilters, category: categorySlug });
  };

  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    onFilterChange({ ...currentFilters, sort: newSort });
  };

  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const applyPriceFilter = () => {
    onFilterChange({
      ...currentFilters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    });
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 1000000]);
    setSortBy("newest");
    onFilterChange({});
  };

  const sortOptions = [
    { value: "newest", label: "Terbaru" },
    { value: "price-low", label: "Harga Terendah" },
    { value: "price-high", label: "Harga Tertinggi" },
    { value: "name", label: "Nama A-Z" },
    { value: "popular", label: "Terpopuler" },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      {/* Sort */}
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Urutkan</InputLabel>
          <Select value={sortBy} label="Urutkan" onChange={handleSortChange}>
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Categories */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography
            variant="subtitle1"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <FilterList sx={{ mr: 1 }} />
            Kategori
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Chip
              label="Semua Kategori"
              variant={selectedCategory === "" ? "filled" : "outlined"}
              onClick={() => handleCategoryChange("")}
              sx={{ justifyContent: "flex-start" }}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                variant={
                  selectedCategory === category.slug ? "filled" : "outlined"
                }
                onClick={() => handleCategoryChange(category.slug)}
                sx={{ justifyContent: "flex-start" }}
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Price Range */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="subtitle1">Rentang Harga</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ px: 1 }}>
            <Slider
              value={priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              min={0}
              max={1000000}
              step={10000}
              valueLabelFormat={(value) =>
                `Rp ${value.toLocaleString("id-ID")}`
              }
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="body2">
                Rp {priceRange[0].toLocaleString("id-ID")}
              </Typography>
              <Typography variant="body2">
                Rp {priceRange[1].toLocaleString("id-ID")}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={applyPriceFilter}
            >
              Terapkan
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Clear Filters */}
      <Box sx={{ mt: 3 }}>
        <Button variant="outlined" fullWidth onClick={clearFilters}>
          Hapus Semua Filter
        </Button>
      </Box>
    </Box>
  );
}
