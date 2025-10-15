// import React, { useState } from "react";
// import {
//   Container,
//   Grid,
//   TextField,
//   Button,
//   Typography,
//   Box,
//   MenuItem,
//   Paper,
//   Divider,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import axiosClient from "../api/axiosClient";
// import { v4 as uuidv4 } from "uuid";

// export default function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     password: "",
//     mobile: "",
//     dob: "",
//     city: "",
//     country: "",
//     mpin: "",
//     pan: "",
//     aadhar: "",
//   });
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const countries = [
//     "India",
//     "United States",
//     "United Kingdom",
//     "Australia",
//     "Canada",
//     "Singapore",
//     "Germany",
//   ];

//   const onChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const validate = () => {
//     if (!form.name) return "Name required";
//     if (!/^[0-9]{7,15}$/.test(form.mobile)) return "Invalid mobile";
//     if (!form.password || form.password.length < 4)
//       return "Password too short";
//     if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.toUpperCase()))
//       return "Invalid PAN format";
//     if (!/^[0-9]{12}$/.test(form.aadhar))
//       return "Invalid Aadhaar (12 digits)";
//     if (!/^[0-9]{4}$/.test(form.mpin))
//       return "MPIN should be 4 digits";
//     return null;
//   };

//   const submit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     const v = validate();
//     if (v) return setError(v);

//     setLoading(true);
//     try {
//       const payload = {
//         userID: uuidv4(),
//         name: form.name,
//         password: form.password,
//         mobile: form.mobile,
//         dob: form.dob,
//         city: form.city,
//         country: form.country,
//         mpin: form.mpin,
//         pan: form.pan,
//         aadhar: form.aadhar,
//       };

//       const res = await axiosClient.post("/register", payload);
//       setLoading(false);
//       if (res.status === 201) {
//         alert("Registered successfully. Please login.");
//         navigate("/login");
//       } else {
//         setError(res?.data?.msg || "Registration failed");
//       }
//     } catch (err) {
//       setLoading(false);
//       const msg = err?.response?.data?.msg || err.message;
//       setError(msg);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         background: "linear-gradient(180deg,#eef2ff,#f8fafc)",
//         py: 6,
//       }}
//     >
//       <Container maxWidth="lg">
//         <Paper
//           elevation={8}
//           sx={{
//             borderRadius: 4,
//             overflow: "hidden",
//             display: "flex",
//             flexDirection: { xs: "column", md: "row" },
//             boxShadow: "0 12px 30px rgba(2,6,23,0.1)",
//           }}
//         >
//           {/* Left Info Section */}
//           <Box
//             sx={{
//               flex: 1,
//               background: "linear-gradient(180deg,#4f46e5,#7c3aed)",
//               color: "#fff",
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//               alignItems: "flex-start",
//               p: { xs: 4, md: 6 },
//             }}
//           >
//             <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
//               Join TrackonPay
//             </Typography>
//             <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
//               Manage your bills, payments, and wallet securely — all in one
//               place. Quick, easy, and safe.
//             </Typography>
//             <Divider sx={{ width: "60px", background: "#fff", mb: 3 }} />
//             <Typography variant="body2" sx={{ opacity: 0.8 }}>
//               • Instant digital wallet creation <br />
//               • Pay & track all your bills <br />
//               • Smart reminders and insights
//             </Typography>
//           </Box>

//           {/* Right Register Form */}
//           <Box sx={{ flex: 1, p: { xs: 3, md: 6 }, backgroundColor: "#fff" }}>
//             <Typography
//               variant="h4"
//               sx={{ fontWeight: 800, mb: 1, color: "#4f46e5" }}
//             >
//               Create Account
//             </Typography>
//             <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
//               Fill out your details below to get started.
//             </Typography>

//             {error && (
//               <Paper
//                 variant="outlined"
//                 sx={{
//                   bgcolor: "#fff3f3",
//                   color: "#b91c1c",
//                   p: 1.5,
//                   mb: 2,
//                   borderColor: "#fecaca",
//                 }}
//               >
//                 {error}
//               </Paper>
//             )}

//             <Box component="form" onSubmit={submit} noValidate>
//               <Grid container spacing={2}>
//                 {/* First Column */}
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     fullWidth
//                     label="Full Name"
//                     name="name"
//                     value={form.name}
//                     onChange={onChange}
//                     required
//                     variant="outlined"
//                   />
//                   <TextField
//                     fullWidth
//                     label="Mobile"
//                     name="mobile"
//                     value={form.mobile}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     required
//                     inputProps={{ inputMode: "numeric" }}
//                   />
//                   <TextField
//                     fullWidth
//                     type="password"
//                     label="Password"
//                     name="password"
//                     value={form.password}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     required
//                   />
//                   <TextField
//                     fullWidth
//                     label="PAN"
//                     name="pan"
//                     value={form.pan.toUpperCase()}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     inputProps={{ style: { textTransform: "uppercase" } }}
//                     required
//                   />
//                   <TextField
//                     fullWidth
//                     label="Aadhaar (12 digits)"
//                     name="aadhar"
//                     value={form.aadhar}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     inputProps={{ maxLength: 12, inputMode: "numeric" }}
//                     required
//                   />
//                 </Grid>

//                 {/* Second Column */}
//                 <Grid item xs={12} md={6}>
//                   <TextField
//                     fullWidth
//                     type="date"
//                     label="Date of Birth"
//                     name="dob"
//                     value={form.dob}
//                     onChange={onChange}
//                     InputLabelProps={{ shrink: true }}
//                     required
//                   />
//                   <TextField
//                     fullWidth
//                     label="City"
//                     name="city"
//                     value={form.city}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     required
//                   />
//                   <TextField
//                     select
//                     fullWidth
//                     label="Country"
//                     name="country"
//                     value={form.country}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     required
//                   >
//                     {countries.map((c) => (
//                       <MenuItem key={c} value={c}>
//                         {c}
//                       </MenuItem>
//                     ))}
//                   </TextField>
//                   <TextField
//                     fullWidth
//                     label="MPIN (4 digits)"
//                     name="mpin"
//                     value={form.mpin}
//                     onChange={onChange}
//                     sx={{ mt: 2 }}
//                     inputProps={{ maxLength: 4, inputMode: "numeric" }}
//                     required
//                   />

//                   <Button
//                     type="submit"
//                     variant="contained"
//                     fullWidth
//                     disabled={loading}
//                     sx={{
//                       mt: 3,
//                       py: 1.4,
//                       fontSize: 16,
//                       fontWeight: 700,
//                       borderRadius: 2,
//                       background:
//                         "linear-gradient(90deg,#4f46e5,#7c3aed)",
//                       boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
//                       "&:hover": {
//                         background:
//                           "linear-gradient(90deg,#4338ca,#6d28d9)",
//                       },
//                     }}
//                   >
//                     {loading ? "Registering..." : "Register"}
//                   </Button>

//                   <Typography
//                     variant="body2"
//                     sx={{
//                       mt: 2,
//                       textAlign: "center",
//                       color: "text.secondary",
//                     }}
//                   >
//                     Already have an account?{" "}
//                     <Button
//                       variant="text"
//                       sx={{
//                         color: "#4f46e5",
//                         fontWeight: 700,
//                         textTransform: "none",
//                       }}
//                       onClick={() => navigate("/login")}
//                     >
//                       Login
//                     </Button>
//                   </Typography>
//                 </Grid>
//               </Grid>
//             </Box>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// }

import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
  LinearProgress,
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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successPopup, setSuccessPopup] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
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

  // Password Strength Checker
  useEffect(() => {
    const pwd = form.password;
    if (!pwd) return setPasswordStrength("");
    if (pwd.length < 4) setPasswordStrength("Weak");
    else if (pwd.length < 8) setPasswordStrength("Medium");
    else if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd))
      setPasswordStrength("Strong");
    else setPasswordStrength("Good");
  }, [form.password]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear individual field error
  };

  // Inline validation for each field
  const validateField = (name, value) => {
    switch (name) {
      case "mobile":
        if (!/^[0-9]{7,15}$/.test(value)) return "Invalid mobile number";
        break;
      case "pan":
        if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase()))
          return "Invalid PAN format (e.g., ABCDE1234F)";
        break;
      case "aadhar":
        if (!/^[0-9]{12}$/.test(value)) return "Aadhaar must be 12 digits";
        break;
      case "mpin":
        if (!/^[0-9]{4}$/.test(value)) return "MPIN must be 4 digits";
        break;
      default:
        return "";
    }
  };

  const validateForm = () => {
    let newErrors = {};
    Object.entries(form).forEach(([key, value]) => {
      const err = validateField(key, value);
      if (err) newErrors[key] = err;
    });
    if (!form.name) newErrors.name = "Name is required";
    if (!form.password || form.password.length < 4)
      newErrors.password = "Password too short";
    if (!form.dob) newErrors.dob = "Date of birth required";
    if (!form.city) newErrors.city = "City required";
    if (!form.country) newErrors.country = "Country required";
    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) return setErrors(newErrors);

    setLoading(true);
    try {
      const payload = {
        userID: uuidv4(),
        ...form,
      };
      const res = await axiosClient.post("/register", payload);
      setLoading(false);
      if (res.status === 201) {
        setSuccessPopup(true);
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setLoading(false);
      setErrors({ global: err?.response?.data?.msg || "Registration failed" });
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak":
        return "error";
      case "Medium":
        return "warning";
      case "Good":
        return "info";
      case "Strong":
        return "success";
      default:
        return "inherit";
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
          elevation={10}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left section */}
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
              One wallet for all your bill payments — secure, simple, and fast.
            </Typography>
            <Divider sx={{ width: "60px", background: "#fff", mb: 3 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              ✓ Instant registration <br />
              ✓ Smart bill reminders <br />
              ✓ Secure transactions
            </Typography>
          </Box>

          {/* Right Form Section */}
          <Box sx={{ flex: 1, p: { xs: 3, md: 6 }, backgroundColor: "#fff" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, mb: 1, color: "#4f46e5" }}
            >
              Create Account
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Fill out your details to get started.
            </Typography>

            {errors.global && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.global}
              </Alert>
            )}

            <Box component="form" onSubmit={submit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    value={form.mobile}
                    onChange={(e) => {
                      onChange(e);
                      setErrors({
                        ...errors,
                        mobile: validateField("mobile", e.target.value),
                      });
                    }}
                    sx={{ mt: 2 }}
                    error={!!errors.mobile}
                    helperText={errors.mobile}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="Password"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    error={!!errors.password}
                    helperText={errors.password}
                  />
                  {passwordStrength && (
                    <Box sx={{ mt: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        color={getPasswordStrengthColor()}
                        value={
                          passwordStrength === "Weak"
                            ? 25
                            : passwordStrength === "Medium"
                            ? 50
                            : passwordStrength === "Good"
                            ? 75
                            : 100
                        }
                      />
                      <Typography
                        variant="caption"
                        color={`${getPasswordStrengthColor()}.main`}
                      >
                        Password Strength: {passwordStrength}
                      </Typography>
                    </Box>
                  )}
                  <TextField
                    fullWidth
                    label="PAN"
                    name="pan"
                    value={form.pan.toUpperCase()}
                    onChange={(e) => {
                      onChange(e);
                      setErrors({
                        ...errors,
                        pan: validateField("pan", e.target.value),
                      });
                    }}
                    sx={{ mt: 2 }}
                    error={!!errors.pan}
                    helperText={errors.pan}
                  />
                  <TextField
                    fullWidth
                    label="Aadhaar (12 digits)"
                    name="aadhar"
                    value={form.aadhar}
                    onChange={(e) => {
                      onChange(e);
                      setErrors({
                        ...errors,
                        aadhar: validateField("aadhar", e.target.value),
                      });
                    }}
                    sx={{ mt: 2 }}
                    error={!!errors.aadhar}
                    helperText={errors.aadhar}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    name="dob"
                    value={form.dob}
                    onChange={onChange}
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.dob}
                    helperText={errors.dob}
                    required
                  />
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    error={!!errors.city}
                    helperText={errors.city}
                  />
                  <TextField
                    select
                    fullWidth
                    label="Country"
                    name="country"
                    value={form.country}
                    onChange={onChange}
                    sx={{ mt: 2 }}
                    error={!!errors.country}
                    helperText={errors.country}
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
                    onChange={(e) => {
                      onChange(e);
                      setErrors({
                        ...errors,
                        mpin: validateField("mpin", e.target.value),
                      });
                    }}
                    sx={{ mt: 2 }}
                    error={!!errors.mpin}
                    helperText={errors.mpin}
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
                    }}
                  >
                    {loading ? "Registering..." : "Register"}
                  </Button>

                  <Typography
                    variant="body2"
                    sx={{ mt: 2, textAlign: "center", color: "text.secondary" }}
                  >
                    Already have an account?{" "}
                    <Button
                      variant="text"
                      sx={{ color: "#4f46e5", fontWeight: 700 }}
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

      {/* ✅ Success Snackbar */}
      <Snackbar
        open={successPopup}
        autoHideDuration={1500}
        onClose={() => setSuccessPopup(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Registration Successful! Redirecting to Login...
        </Alert>
      </Snackbar>
    </Box>
  );
}
