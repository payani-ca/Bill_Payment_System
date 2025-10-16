// src/pages/Login.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FacebookIcon from "@mui/icons-material/Facebook";
import AppleIcon from "@mui/icons-material/Apple";
import { SvgIcon } from "@mui/material";

/* Small Google-like svg so social button looks nicer */
function GoogleSvg(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path
        fill="#EA4335"
        d="M12 11v2.4h4.6c-.2 1.4-1.4 4.1-4.6 4.1-2.8 0-5-2.3-5-5s2.2-5 5-5c1.6 0 2.6.7 3.2 1.2l1.9-1.9C16.7 4.5 14.6 3.5 12 3.5 7.6 3.5 4 7.1 4 11.5S7.6 19.5 12 19.5c6.3 0 6.9-5.9 6.9-6.4 0-.4-.1-.7-.1-1h-6.8z"
      />
    </SvgIcon>
  );
}

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // form state
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);

  // simple math captcha state
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  function generateCaptcha() {
    const x = Math.floor(Math.random() * 12) + 1;
    const y = Math.floor(Math.random() * 12) + 1;
    setA(x);
    setB(y);
    setCaptchaAnswer("");
  }

  function validateInputs() {
    if (!/^[0-9]{7,15}$/.test(mobile)) return "Enter a valid mobile number (7–15 digits).";
    if (!password || password.length < 4) return "Enter your password (min 4 characters).";
    if (Number(captchaAnswer) !== a + b) return "Captcha answer is incorrect — try again.";
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const v = validateInputs();
    if (v) return setError(v);

    const resp = await login({ mobile, password });
    if (!resp.ok) {
      setError(resp.message || "Login failed");
      // refresh captcha on failure
      generateCaptcha();
    } else {
      // optional: handle remember flag if you want different persistence
      navigate("/dashboard");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(180deg,#eef2ff,#f8fafc)", py: 6 }}>
      <Container maxWidth="lg">
        <Paper elevation={6} sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Grid container>
            {/* Left visual column */}
            <Grid
              item
              xs={12}
              md={5}
              sx={{
                background: "linear-gradient(180deg,#5267f7,#7c3aed)",
                color: "#fff",
                p: { xs: 4, md: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.14)", width: 56, height: 56 }}>TP</Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    TrackonPay
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.95 }}>
                    Pay bills simply • securely • fast
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.02 }}>
                Adventure start here
              </Typography>
              <Typography sx={{ opacity: 0.95 }}>Create an account to join our community.</Typography>

              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>Features</Typography>
                <Stack spacing={1}>
                  <Typography sx={{ fontSize: 14 }}>• Instant wallet payments</Typography>
                  <Typography sx={{ fontSize: 14 }}>• Bill reminders & history</Typography>
                </Stack>
              </Box>
            </Grid>

            {/* Right form column */}
            <Grid item xs={12} md={7} sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ maxWidth: 520, mx: "auto" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: "center" }}>
                  Hello! Welcome back
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
                  {error && (
                    <Paper variant="outlined" sx={{ bgcolor: "#fff3f2", color: "#7f1d1d", p: 1.5, mb: 2 }}>
                      {error}
                    </Paper>
                  )}

                  <TextField
                    label="Mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\s+/g, ""))}
                    fullWidth
                    margin="normal"
                    required
                  />

                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                    <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} />} label="Remember me" />
                    <Link href="#" onClick={(e) => e.preventDefault()} underline="hover">
                      Reset Password!
                    </Link>
                  </Box>

                  {/* Simple math captcha */}
                  <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
                    <Paper variant="outlined" sx={{ px: 2, py: 1, borderRadius: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{a} + {b} = ?</Typography>
                    </Paper>

                    <TextField
                      placeholder="Answer"
                      value={captchaAnswer}
                      onChange={(e) => setCaptchaAnswer(e.target.value)}
                      sx={{ width: 140 }}
                      inputProps={{ inputMode: "numeric" }}
                      required
                    />

                    <Button variant="outlined" onClick={generateCaptcha} sx={{ ml: 1 }}>
                      Refresh
                    </Button>
                  </Box>

                  <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.5 }} disabled={loading}>
                    {loading ? "Signing in..." : "Login"}
                  </Button>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 3, mb: 2 }}>
                    <Divider sx={{ flex: 1 }} />
                    <Typography sx={{ color: "text.secondary", mx: 1 }}>or</Typography>
                    <Divider sx={{ flex: 1 }} />
                  </Box>

                  <Box sx={{ textAlign: "center", mt: 3 }}>
                    <Typography variant="body2">
                      Don’t have an account?{" "}
                      <Link onClick={() => navigate("/register")} sx={{ cursor: "pointer" }}>
                        Create Account
                      </Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
