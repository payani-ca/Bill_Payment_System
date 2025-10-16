import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
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
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

const ELECTRICITY_MAP = {
  "Andhra Pradesh": ["APEPDCL", "APSPDCL"],
  Telangana: ["TSSPDCL", "TSNPDCL"],
  Karnataka: ["BESCOM", "GESCOM", "MESCOM", "HESCOM"],
  Kerala: ["KSEB"],
  "Tamil Nadu": ["TNEB", "TANGEDCO"],
  Maharashtra: ["MSEDCL", "Adani Electricity", "BEST"],
  Gujarat: ["DGVCL", "MGVCL", "PGVCL", "UGVCL", "Torrent Power"],
  Delhi: ["BSES Rajdhani", "BSES Yamuna", "Tata Power-DDL"],
  "Uttar Pradesh": ["UPPCL", "DVVNL", "PVVNL", "MVVNL", "PuVVNL"],
  "Madhya Pradesh": ["MPEB", "MPMKVVCL", "MP Poorv Kshetra"],
  Rajasthan: ["Jaipur Vidyut", "Ajmer Vidyut", "Jodhpur Vidyut"],
  "West Bengal": ["WBSEDCL", "CESC Limited"],
  Bihar: ["NBPDCL", "SBPDCL"],
  Odisha: ["TPCODL", "TPWODL", "TPSODL", "TPNODL"],
  Punjab: ["PSPCL"],
  Haryana: ["DHBVN", "UHBVN"],
  Chhattisgarh: ["CSPDCL"],
  Goa: ["Goa Electricity Department"],
  Assam: ["APDCL"],
  Jharkhand: ["JUVNL", "JBVNL"],
  "Himachal Pradesh": ["HPSEB"],
  "Jammu & Kashmir": ["JPDCL", "KPDCL"],
  Meghalaya: ["MePDCL"],
};

export default function ElectricityDialog({ open, onClose }) {
  const [state, setState] = useState("");
  const [provider, setProvider] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [billAmount, setBillAmount] = useState(null);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(5000);

  const states = useMemo(() => Object.keys(ELECTRICITY_MAP), []);

  useEffect(() => {
    if (!open) {
      setState("");
      setProvider("");
      setServiceNo("");
      setBillAmount(null);
      setMpin("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const providerOptions = state ? ELECTRICITY_MAP[state] : [];

  const fetchBill = async () => {
    setError(null);
    setSuccess(null);
    if (!state) return setError("Please select a state.");
    if (!provider) return setError("Please select a provider.");

    setLoading(true);
    setTimeout(() => {
      setBillAmount(1250);
      setServiceNo(serviceNo || "SERV" + Math.floor(Math.random() * 100000));
      setLoading(false);
    }, 1000);
  };

  const pay = async () => {
    setError(null);
    setSuccess(null);

    if (!serviceNo || billAmount === null) return setError("Fetch the bill before paying.");
    if (!/^\d{4}$/.test(mpin)) return setError("Enter a valid 4-digit MPIN.");

    setLoading(true);
    setTimeout(() => {
      const newBalance = walletBalance - billAmount;
      setSuccess(`Payment successful. New balance: ₹ ${newBalance}`);
      setWalletBalance(newBalance);
      setMpin("");
      setLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#f9fbff",
          borderBottom: "1px solid #eaeaea",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FlashOnIcon color="warning" />
          <Typography variant="h6" fontWeight={700}>
            Electricity Bill Payment
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

      <DialogContent sx={{ mt: 3, px: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* State Select */}
          <FormControl fullWidth size="small">
            <InputLabel>State</InputLabel>
            <Select
              value={state}
              label="State"
              onChange={(e) => {
                setState(e.target.value);
                setProvider("");
                setBillAmount(null);
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              }}
            >
              {states.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Provider Autocomplete */}
          <Autocomplete
            options={providerOptions}
            value={provider || null}
            onChange={(e, val) => {
              setProvider(val || "");
              setBillAmount(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Service Provider"
                size="small"
                fullWidth
              />
            )}
            disabled={!state}
            fullWidth
            ListboxProps={{
              style: { maxHeight: 250 },
            }}
          />

          {/* Service Number */}
          <TextField
            label="Service No."
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            size="small"
            fullWidth
            helperText="Leave blank if system should generate automatically."
          />

          {/* Fetch Bill Button */}
          <Button
            fullWidth
            variant="contained"
            color="warning"
            onClick={fetchBill}
            disabled={loading || !provider}
            sx={{ py: 1.2, fontWeight: 700 }}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            {loading ? "Fetching..." : "Fetch Bill"}
          </Button>

          {/* Bill Amount Display */}
          <AnimatePresence>
            {billAmount !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Paper
                  sx={{
                    p: 2.5,
                    textAlign: "center",
                    borderRadius: 2,
                    bgcolor: "#f4faf7",
                    border: "1px solid #e0f0e6",
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Bill Amount
                  </Typography>
                  <Typography variant="h4" fontWeight={800} color="success.main" sx={{ my: 0.5 }}>
                    ₹ {billAmount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {provider} ({state})
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MPIN */}
          <TextField
            label="MPIN (4 digits)"
            value={mpin}
            onChange={(e) =>
              setMpin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            inputProps={{ inputMode: "numeric", maxLength: 4 }}
            fullWidth
            size="small"
            type="password"
          />

          {/* Pay Button */}
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={pay}
            disabled={!billAmount || loading || !mpin}
            sx={{ py: 1.2, fontWeight: 700 }}
            startIcon={loading && <CircularProgress size={16} color="inherit" />}
          >
            {loading ? "Processing..." : "Pay from Wallet"}
          </Button>

          {/* Alerts */}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}