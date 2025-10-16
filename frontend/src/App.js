// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";
import { AuthProvider, useAuth } from "./auth/AuthProvider";

/*
  HeaderBar is separated so it can use hooks (useLocation/useNavigate/useAuth).
  It is rendered inside Router (below), but above Routes so it updates with location changes.
*/
function HeaderBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isHome = location.pathname === "/";
  const isDashboard = location.pathname.startsWith("/dashboard");

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      // always navigate back to home after logout
      navigate("/");
    }
  };

  return (
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
        {/* Brand / Logo */}
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

        {/* Right-side buttons: conditional by route */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {isHome && (
            <>
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
            </>
          )}

          {isDashboard && (
            <Button
              onClick={handleLogout}
              variant="outlined"
              size="small"
              color="error"
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <HeaderBar />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
