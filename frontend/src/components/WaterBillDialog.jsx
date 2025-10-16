// src/components/WaterBillDialog.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";

const WATER_MAP = {
  "Delhi": ["Delhi Jal Board"],
  "Mumbai": ["BMC Water"],
  "Hyderabad": ["HMWSSB"],
  "Bangalore": ["BWSSB"],
  "Chennai": ["CMWSSB"],
  "Kolkata": ["KMC Water Supply"],
  "Pune": ["PMC Water Department"],
  "Lucknow": ["LUWSS"],
  "Ahmedabad": ["AMC Water Works"],
  "Jaipur": ["JMC Water Supply"],
  "Indore": ["IMC Water"],
  "Surat": ["SMC Water"],
  "Patna": ["PMC Water Supply"],
  "Bhubaneswar": ["BWSS"],
  "Nagpur": ["OCW Water Supply"],
};

export default function WaterBillDialog({ open, onClose }) {
  const { user, fetchWithAuth } = useAuth();

  const [city, setCity] = useState("");
  const [provider, setProvider] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [billAmount, setBillAmount] = useState(null);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  const cities = useMemo(() => Object.keys(WATER_MAP), []);

  useEffect(() => {
    if (!open) {
      setCity("");
      setProvider("");
      setServiceNo("");
      setBillAmount(null);
      setMpin("");
      setError(null);
      setSuccess(null);
    } else {
      fetchWalletBalance();
    }
  }, [open]);

  const fetchWalletBalance = async () => {
    if (!user?.UserID) return;
    setLoadingWallet(true);
    try {
      const res = await fetchWithAuth(`/wallets/${user.UserID}`, { method: "GET" });
      const data = res.data || {};
      setWalletBalance(data.Amount ?? null);
    } catch {
      setWalletBalance(null);
    } finally {
      setLoadingWallet(false);
    }
  };

  const providerOptions = city ? WATER_MAP[city] : [];

  const fetchBill = async () => {
    setError(null);
    setSuccess(null);
    if (!city) return setError("Please select a city.");
    if (!provider) return setError("Please select a provider.");

    setLoading(true);
    try {
      const res = await fetchWithAuth("/water/bill", {
        method: "POST",
        data: { city, provider },
      });
      const data = res.data;
      setBillAmount(data.bill_amount);
      if (data.ServiceNo) setServiceNo(data.ServiceNo);
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to fetch bill.");
      setBillAmount(null);
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    setError(null);
    setSuccess(null);

    if (!serviceNo || billAmount === null) return setError("Fetch the bill before paying.");
    if (!/^\d{4}$/.test(mpin)) return setError("Enter a valid 4-digit MPIN.");

    setLoading(true);
    try {
      const payload = {
        city,
        provider,
        mobile: user?.Mobile || "",
        bill_amount: billAmount,
        mpin,
        service_no: serviceNo,
      };
      const res = await fetchWithAuth("/water/pay", {
        method: "POST",
        data: payload,
      });
      const data = res.data;
      let msg = data.msg || "Payment successful.";
      if (data.new_balance !== undefined) msg += ` New balance: ₹ ${data.new_balance}`;
      setSuccess(msg);
      setMpin("");
      setWalletBalance(data.new_balance ?? walletBalance);
    } catch (err) {
      setError(err?.response?.data?.msg || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '600px',
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#f0f9ff",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WaterDropIcon color="info" />
          <Typography variant="h6" fontWeight={700}>
            Water Bill Payment
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={<AccountBalanceWalletIcon />}
            label={
              loadingWallet
                ? "Fetching..."
                : walletBalance !== null
                ? `₹ ${walletBalance}`
                : "—"
            }
            color="primary"
            variant="outlined"
            size="small"
          />
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3, px: 4 }}>
        <Stack spacing={3}>
          {/* City Select */}
          <FormControl fullWidth>
            <InputLabel id="city-label">City</InputLabel>
            <Select
              labelId="city-label"
              id="city-select"
              value={city}
              label="City"
              onChange={(e) => {
                setCity(e.target.value);
                setProvider("");
                setBillAmount(null);
              }}
            >
              {cities.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Provider Autocomplete */}
          <Autocomplete
            fullWidth
            options={providerOptions}
            value={provider || null}
            onChange={(e, val) => {
              setProvider(val || "");
              setBillAmount(null);
            }}
            disabled={!city}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Water Supply Provider"
              />
            )}
          />

          {/* Service Number */}
          <TextField
            fullWidth
            label="Service No. / Consumer ID"
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            helperText="Leave blank if system should generate automatically."
          />

          {/* Fetch Bill Button */}
          <Button
            fullWidth
            variant="contained"
            color="info"
            onClick={fetchBill}
            disabled={loading || !provider}
            sx={{ py: 1.8, fontWeight: 600, textTransform: 'none', fontSize: '1.1rem' }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Fetching...
              </>
            ) : (
              "Fetch Bill"
            )}
          </Button>

          {/* Bill Amount Display */}
          <AnimatePresence>
            {billAmount !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "#f0f9ff",
                    border: "2px solid #dbeafe",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>
                    Bill Amount
                  </Typography>
                  <Typography variant="h2" fontWeight={700} color="info.main" sx={{ my: 2 }}>
                    ₹ {billAmount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {provider} • {city}
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MPIN */}
          <TextField
            fullWidth
            label="MPIN (4 digits)"
            type="password"
            value={mpin}
            onChange={(e) =>
              setMpin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            inputProps={{ 
              inputMode: "numeric", 
              maxLength: 4,
              autoComplete: "off"
            }}
          />

          {/* Pay Button */}
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={pay}
            disabled={!billAmount || loading || !mpin}
            sx={{ py: 1.8, fontWeight: 600, textTransform: 'none', fontSize: '1.1rem' }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              "Pay from Wallet"
            )}
          </Button>

          {/* Alerts */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}