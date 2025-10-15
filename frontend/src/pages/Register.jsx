import React, { useState } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Paper,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { v4 as uuidv4 } from "uuid";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    password: "",
    mobile: "",
    dob: "",
    city: "",
    country: "",
    mpin: "",
    pan: "",
    aadhar: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Australia",
    "Canada",
    "Singapore",
    "Germany",
  ];

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.name) return "Name required";
    if (!/^[0-9]{7,15}$/.test(form.mobile)) return "Invalid mobile";
    if (!form.password || form.password.length < 4)
      return "Password too short";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase()))
      return "Invalid PAN format";
    if (!/^[0-9]{12}$/.test(form.aadhar))
      return "Invalid Aadhaar (12 digits)";
    if (!/^[0-9]{4}$/.test(form.mpin))
      return "MPIN should be 4 digits";
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) return setError(v);

    setLoading(true);
    try {
      const payload = {
        userID: uuidv4(),
        name: form.name,
        password: form.password,
        mobile: form.mobile,
        dob: form.dob,
        city: form.city,
        country: form.country,
        mpin: form.mpin,
        pan: form.pan,
        aadhar: form.aadhar,
      };

      const res = await axiosClient.post("/register", payload);
      setLoading(false);
      if (res.status === 201) {
        alert("Registered successfully. Please login.");
        navigate("/login");
      } else {
        setError(res?.data?.msg || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      const msg = err?.response?.data?.msg || err.message;
      setError(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg,#eef2ff,#f8fafc)",
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={8}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            boxShadow: "0 12px 30px rgba(2,6,23,0.1)",
          }}
        >
          {/* Left Info Section */}
          <Box
            sx={{
              flex: 1,
              background: "linear-gradient(180deg,#4f46e5,#7c3aed)",
              color: "#fff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              p: { xs: 4, md: 6 },
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
              Join TrackonPay
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              Manage your bills, payments, and wallet securely — all in one
              place. Quick, easy, and safe.
            </Typography>
            <Divider sx={{ width: "60px", background: "#fff", mb: 3 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              • Instant digital wallet creation <br />
              • Pay & track all your bills <br />
              • Smart reminders and insights
            </Typography>
          </Box>

          {/* Right Register Form */}
          <Box sx={{ flex: 1, p: { xs: 3, md: 6 }, backgroundColor: "#fff" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, mb: 1, color: "#4f46e5" }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Fill out your details below to get started.
            </Typography>

            {error && (
              <Paper
                variant="outlined"
                sx={{
                  bgcolor: "#fff3f3",
                  color: "#b91c1c",
                  p: 1.5,
                  mb: 2,
                  borderColor: "#fecaca",
                }}
              >
                {error}
              </Paper>
            )}

            <Box component="form" onSubmit={submit} noValidate>
              <Grid container spacing={2}>
                {/* First Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    value={form.mobile}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    required
                    inputProps={{ inputMode: "numeric" }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="PAN"
                    name="pan"
                    value={form.pan.toUpperCase()}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Aadhaar (12 digits)"
                    name="aadhar"
                    value={form.aadhar}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    inputProps={{ maxLength: 12, inputMode: "numeric" }}
                    required
                  />
                </Grid>

                {/* Second Column */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={form.dob}
                    onChange={onChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    required
                  />
                  <TextField
                    select
                    fullWidth
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    required
                  >
                    {countries.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="MPIN (4 digits)"
                    name="mpin"
                    value={form.mpin}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    inputProps={{ maxLength: 4, inputMode: "numeric" }}
                    required
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      mt: 3,
                      py: 1.4,
                      fontSize: 16,
                      fontWeight: 700,
                      borderRadius: 2,
                      background:
                        "linear-gradient(90deg,#4f46e5,#7c3aed)",
                      boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(90deg,#4338ca,#6d28d9)",
                      },
                    }}
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 2,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    Already have an account?{" "}
                    <Button
                      variant="text"
                      sx={{
                        color: "#4f46e5",
                        fontWeight: 700,
                        textTransform: "none",
                      }}
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </Button>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
