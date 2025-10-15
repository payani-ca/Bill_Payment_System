import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";

function App() {
  return (
    <Router>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ borderBottom: "1px solid #eee" }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {/* ✅ Clickable TrackonPay Logo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontWeight: 800,
                color: "#3b3b98",
                textDecoration: "none",
                "&:hover": { color: "#4f46e5", textShadow: "0 0 4px #c7d2fe" },
                cursor: "pointer",
              }}
            >
              TrackonPay
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined" size="small">
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              size="small"
              sx={{
                background: "linear-gradient(90deg,#4f46e5,#7c3aed)",
                color: "#fff",
                "&:hover": { background: "linear-gradient(90deg,#4338ca,#6d28d9)" },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
