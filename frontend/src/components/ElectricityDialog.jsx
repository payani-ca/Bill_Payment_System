// src/components/ElectricityDialog.jsx
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
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";

/**
 * Local fallback map used only if backend does not provide providers list.
 * Backend exposes UTILITIES["electricity"] so front-end may optionally GET /electricity/providers
 * (If you don't have such endpoint, this local map will be used.)
 */
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
  const { user, fetchWithAuth } = useAuth();

  const [mapping, setMapping] = useState(ELECTRICITY_MAP); // state -> [providers]
  const [state, setState] = useState("");
  const [provider, setProvider] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [billAmount, setBillAmount] = useState(null);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const states = useMemo(() => Object.keys(mapping), [mapping]);
  const providerOptions = state ? mapping[state] || [] : [];

  useEffect(() => {
    if (!open) {
      // reset on close
      setState("");
      setProvider("");
      setServiceNo("");
      setBillAmount(null);
      setMpin("");
      setError(null);
      setSuccess(null);
    } else {
      // when opening: try to load mapping & wallet balance
      loadMapping();
      fetchWalletBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Try to fetch providers mapping from backend (/electricity/providers)
  const loadMapping = async () => {
    setLoadingMapping(true);
    try {
      // If your backend provides an endpoint to list utilities, try it.
      // If not present, fetchWithAuth will likely throw and we fallback to local map.
      const res = await fetchWithAuth("/electricity/providers", { method: "GET" });
      // Expecting res.data like { "State1": ["P1","P2"], ... }
      const data = res?.data;
      if (data && typeof data === "object") {
        setMapping(data);
      } else {
        setMapping(ELECTRICITY_MAP);
      }
    } catch (err) {
      // fallback silently to local map
      setMapping(ELECTRICITY_MAP);
    } finally {
      setLoadingMapping(false);
    }
  };

  // Load wallet balance (same pattern as your Gas dialog)
  const fetchWalletBalance = async () => {
    if (!user?.UserID) return;
    setLoadingWallet(true);
    try {
      const res = await fetchWithAuth(`/wallets/${user.UserID}`, { method: "GET" });
      setWalletBalance(res.data?.Amount ?? null);
    } catch {
      setWalletBalance(null);
    } finally {
      setLoadingWallet(false);
    }
  };

  // Fetch bill from backend
  const fetchBill = async () => {
    setError(null);
    setSuccess(null);

    if (!state || !provider) return setError("Select state and provider.");
    setLoading(true);

    try {
      const payload = { state, provider };
      const res = await fetchWithAuth("/api/electricity/bill", { method: "POST", data: payload });
      // backend returns { bill_amount, userID, ServiceNo }
      setBillAmount(res.data?.bill_amount ?? null);
      if (res.data?.ServiceNo) setServiceNo(res.data.ServiceNo);
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || "Failed to fetch bill.");
      setBillAmount(null);
      setServiceNo("");
    } finally {
      setLoading(false);
    }
  };

  // Ask backend to create service number (if user left blank)
  const generateServiceNo = async () => {
    if (!provider) return;
    try {
      const res = await fetchWithAuth("/api/electricity/service_no", { method: "POST", data: { provider } });
      if (res.data?.service_no) setServiceNo(res.data.service_no);
    } catch {
      // ignore if endpoint not supported
    }
  };

  // Pay bill via backend
  const payBill = async () => {
    setError(null);
    setSuccess(null);

    // ensure serviceNo exists (generate if empty)
    if (!serviceNo) {
      await generateServiceNo();
      if (!serviceNo) return setError("Service number required.");
    }
    if (billAmount === null) return setError("Fetch the bill before paying.");
    if (!/^\d{4}$/.test(mpin)) return setError("Enter a valid 4-digit MPIN.");

    setLoading(true);
    try {
      const payload = {
        state,
        provider,
        mobile: user?.Mobile || "",
        bill_amount: billAmount,
        mpin,
        service_no: serviceNo,
      };
      const res = await fetchWithAuth("/api/electricity/pay", { method: "POST", data: payload });
      // backend returns { msg, vendor, new_balance }
      setSuccess(res.data?.msg ? `${res.data.msg}` : "Payment successful!");
      if (res.data?.new_balance !== undefined) setWalletBalance(res.data.new_balance);
      setMpin("");
    } catch (err) {
      setError(err?.response?.data?.msg || err?.message || "Payment failed.");
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
      PaperProps={{ sx: { borderRadius: 2, minHeight: 600 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "#effaf6",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FlashOnIcon sx={{ color: "#059669" }} />
          <Typography variant="h6" fontWeight={700}>
            Electricity Bill Payment
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={<AccountBalanceWalletIcon />}
            label={loadingWallet ? "Fetching..." : walletBalance !== null ? `₹ ${walletBalance}` : "—"}
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
          <FormControl fullWidth>
            <InputLabel id="el-state-label">State</InputLabel>
            <Select
              labelId="el-state-label"
              value={state}
              label="State"
              onChange={(e) => {
                setState(e.target.value);
                setProvider("");
                setBillAmount(null);
              }}
            >
              {states.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="el-provider-label">Provider</InputLabel>
            <Select
              labelId="el-provider-label"
              value={provider}
              label="Provider"
              onChange={(e) => {
                setProvider(e.target.value);
                setBillAmount(null);
              }}
              disabled={!state || loadingMapping}
            >
              {state &&
                (providerOptions.length > 0 ? (
                  providerOptions.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">
                    <em>No providers</em>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Service Number"
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            helperText="Leave blank to auto-generate"
            size="small"
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              py: 1.8,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1.05rem",
              bgcolor: "#059669",
              "&:hover": { bgcolor: "#047857" },
            }}
            onClick={fetchBill}
            disabled={!state || !provider || loading}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : "Fetch Bill"}
          </Button>

          <AnimatePresence>
            {billAmount !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    bgcolor: "#ecfdf5",
                    border: "2px solid #bbf7d0",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1.2, mb: 1 }}>
                    Bill Amount
                  </Typography>
                  <Typography variant="h2" fontWeight={700} sx={{ my: 2, color: "#059669" }}>
                    ₹ {billAmount}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {provider} • {state}
                  </Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          <TextField
            fullWidth
            label="MPIN (4 digits)"
            type="password"
            value={mpin}
            onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputProps={{ inputMode: "numeric", maxLength: 4, autoComplete: "off" }}
            size="small"
          />

          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={payBill}
            disabled={!billAmount || loading || !mpin}
            sx={{ py: 1.8, fontWeight: 600, textTransform: "none", fontSize: "1.05rem" }}
          >
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : "Pay from Wallet"}
          </Button>

          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
