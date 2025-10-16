// src/components/MobileRechargeDialog.jsx
import React, { useEffect, useState } from "react";
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
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";

const RECHARGE_PROVIDERS = [
  "Airtel",
  "Jio",
  "Vi",
  "BSNL",
  "MTNL",
  "Tata Docomo",
  "Reliance GSM",
  "Idea"
];

export default function MobileRechargeDialog({ open, onClose }) {
  const { user, fetchWithAuth } = useAuth();

  const [provider, setProvider] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [billAmount, setBillAmount] = useState(null);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  useEffect(() => {
    if (!open) {
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
      const res = await fetchWithAuth(`/api/wallets/${user.UserID}`, { method: "GET" });
      const data = res.data || {};
      setWalletBalance(data.Amount ?? null);
    } catch {
      setWalletBalance(null);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchBill = async () => {
    setError(null);
    setSuccess(null);
    if (!provider) return setError("Please select a provider.");

    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/recharge/bill", {
        method: "POST",
        data: { provider },
      });
      const data = res.data;
      setBillAmount(data.bill_amount);
      if (data.ServiceNo) setServiceNo(data.ServiceNo);
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to fetch recharge amount.");
      setBillAmount(null);
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    setError(null);
    setSuccess(null);

    if (!serviceNo || billAmount === null) return setError("Fetch the recharge amount before paying.");
    if (!/^\d{4}$/.test(mpin)) return setError("Enter a valid 4-digit MPIN.");

    setLoading(true);
    try {
      const payload = {
        provider,
        mobile: user?.Mobile || "",
        bill_amount: billAmount,
        mpin,
        service_no: serviceNo,
      };
      const res = await fetchWithAuth("/api/recharge/pay", {
        method: "POST",
        data: payload,
      });
      const data = res.data;
      let msg = data.msg || "Recharge successful.";
      if (data.new_balance !== undefined) msg += ` New balance: ₹ ${data.new_balance}`;
      setSuccess(msg);
      setMpin("");
      setWalletBalance(data.new_balance ?? walletBalance);
    } catch (err) {
      setError(err?.response?.data?.msg || "Recharge failed.");
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
          bgcolor: "#fff5f5",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PhoneAndroidIcon color="error" />
          <Typography variant="h6" fontWeight={700}>
            Mobile Recharge
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
          {/* Provider Select */}
          <FormControl fullWidth>
            <InputLabel id="provider-label">Mobile Operator</InputLabel>
            <Select
              labelId="provider-label"
              id="provider-select"
              value={provider}
              label="Mobile Operator"
              onChange={(e) => {
                setProvider(e.target.value);
                setBillAmount(null);
              }}
            >
              {RECHARGE_PROVIDERS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Service Number / Mobile Number */}
          <TextField
            fullWidth
            label="Mobile Number"
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            helperText="Leave blank if system should generate automatically."
            inputProps={{ 
              inputMode: "numeric",
              maxLength: 10
            }}
          />

          {/* Fetch Recharge Button */}
          <Button
            fullWidth
            variant="contained"
            color="error"
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
              "Fetch Recharge Amount"
            )}
          </Button>

          {/* Recharge Amount Display */}
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
                    bgcolor: "#fff5f5",
                    border: "2px solid #ffebee",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>
                    Recharge Amount
                  </Typography>
                  <Typography variant="h2" fontWeight={700} color="error.main" sx={{ my: 2 }}>
                    ₹ {billAmount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {provider}
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