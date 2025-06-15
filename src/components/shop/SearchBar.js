"use client";
import { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
} from "@mui/material";
import { Search, Clear, History } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function SearchBar({
  onSearch,
  suggestions = [],
  recentSearches = [],
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      // Simpan ke recent searches
      const recent = JSON.parse(localStorage.getItem("recentSearches") || "[]");
      const updated = [
        searchQuery,
        ...recent.filter((item) => item !== searchQuery),
      ].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(updated));

      onSearch(searchQuery);
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  return (
    <Box sx={{ position: "relative", width: "100%", maxWidth: 600 }}>
      <TextField
        fullWidth
        placeholder="Cari produk, kategori, atau brand..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setShowSuggestions(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={clearSearch}>
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
      />

      {showSuggestions && (query || recentSearches.length > 0) && (
        <Paper
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: "auto",
            mt: 1,
          }}
        >
          {query && suggestions.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                Saran Pencarian
              </Typography>
              <List dense>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Search sx={{ mr: 2, color: "text.secondary" }} />
                    <ListItemText primary={suggestion} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {!query && recentSearches.length > 0 && (
            <>
              <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                Pencarian Terakhir
              </Typography>
              <List dense>
                {recentSearches.map((search, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <History sx={{ mr: 2, color: "text.secondary" }} />
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* Popular Categories */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Kategori Populer
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {["Pakaian Pria", "Pakaian Wanita", "Sepatu", "Aksesoris"].map(
                (category) => (
                  <Chip
                    key={category}
                    label={category}
                    size="small"
                    onClick={() => handleSuggestionClick(category)}
                    sx={{ cursor: "pointer" }}
                  />
                )
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
