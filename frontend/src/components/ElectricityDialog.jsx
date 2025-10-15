// src/components/ElectricityDialog.jsx
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
  Divider,
  IconButton,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../auth/AuthProvider";

// Inline electricity map (move to constants if you prefer)
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
  "Chhattisgarh": ["CSPDCL"],
  Goa: ["Goa Electricity Department"],
  Assam: ["APDCL"],
  Jharkhand: ["JUVNL", "JBVNL"],
  "Himachal Pradesh": ["HPSEB"],
  "Jammu & Kashmir": ["JPDCL", "KPDCL"],
  Meghalaya: ["MePDCL"],
};

export default function ElectricityDialog({ open, onClose }) {
  const { user, fetchWithAuth } = useAuth();

  const [state, setState] = useState("");
  const [provider, setProvider] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [billAmount, setBillAmount] = useState(null);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);

  const states = useMemo(() => Object.keys(ELECTRICITY_MAP), []);

  useEffect(() => {
    if (!open) {
      // reset when closing
      setState("");
      setProvider("");
      setServiceNo("");
      setBillAmount(null);
      setMpin("");
      setError(null);
      setSuccess(null);
      setLoading(false);
      setWalletBalance(null);
    } else {
      // fetch wallet balance to show in header (best-effort)
      fetchWalletBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const fetchWalletBalance = async () => {
    if (!user?.UserID) return;
    setLoadingWallet(true);
    try {
      const res = await fetchWithAuth(`/wallets/${user.UserID}`, { method: "GET" });
      // if backend returns object with Amount
      const data = res.data || {};
      if (data.Amount !== undefined) setWalletBalance(data.Amount);
      else setWalletBalance(null);
    } catch (err) {
      // ignore — wallet info is optional
      setWalletBalance(null);
    } finally {
      setLoadingWallet(false);
    }
  };

  const providerOptions = state ? ELECTRICITY_MAP[state] : [];

  const fetchBill = async () => {
    setError(null);
    setSuccess(null);
    if (!state) return setError("Please select a state.");
    if (!provider) return setError("Please select a provider.");

    setLoading(true);
    try {
      const res = await fetchWithAuth("/electricity/bill", {
        method: "POST",
        data: { state, provider },
      });
      const data = res.data;
      setBillAmount(data.bill_amount);
      if (data.ServiceNo) setServiceNo(data.ServiceNo);
      setSuccess(null);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || "Failed to fetch bill.");
      setBillAmount(null);
      setServiceNo("");
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    setError(null);
    setSuccess(null);

    if (!serviceNo || billAmount === null) {
      setError("Please fetch the bill before paying.");
      return;
    }
    if (!/^\d{4}$/.test(mpin)) {
      setError("Enter a valid 4-digit MPIN.");
      return;
    }

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
      const res = await fetchWithAuth("/electricity/pay", {
        method: "POST",
        data: payload,
      });
      const data = res.data;
      let msg = data.msg || "Payment successful.";
      if (data.new_balance !== undefined) msg += ` New balance: ₹ ${data.new_balance}`;
      setSuccess(msg);
      setError(null);
      setMpin("");
      // update wallet balance shown
      if (data.new_balance !== undefined) setWalletBalance(data.new_balance);
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6">Electricity Bill Payment</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose state & provider then fetch the current bill.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceWalletIcon color="primary" />
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Wallet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loadingWallet ? <CircularProgress size={14} /> : walletBalance !== null ? `₹ ${walletBalance}` : "—"}
            </Typography>
          </Box>

          <IconButton onClick={onClose} size="small" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "#fbfdff" }}>
            <Typography variant="body2" color="text.secondary">
              Please enter the details below. Service number will be generated by the system if left blank.
            </Typography>
          </Paper>
        </Box>

        <Grid container spacing={2}>
          {/* 1) State - full width */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small">
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                label="State"
                value={state}
                onChange={(e) => {
                  const v = e.target.value;
                  setState(v);
                  setProvider("");
                  setServiceNo("");
                  setBillAmount(null);
                  setError(null);
                  setSuccess(null);
                }}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Choose state</em>
                </MenuItem>
                {states.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 2) Provider - full width */}
          <Grid item xs={12}>
            <Autocomplete
              options={providerOptions}
              value={provider || null}
              onChange={(e, value) => {
                setProvider(value || "");
                setServiceNo("");
                setBillAmount(null);
                setError(null);
                setSuccess(null);
              }}
              disabled={!state}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Service Provider"
                  size="small"
                  placeholder={state ? "Select provider" : "Select state first"}
                />
              )}
              fullWidth
            />
          </Grid>

          {/* 3) Service No. */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Service No."
              size="small"
              value={serviceNo}
              onChange={(e) => setServiceNo(e.target.value)}
              helperText="Optional. Leave blank to let the system generate it when fetching the bill."
            />
          </Grid>

          {/* 4) Fetch Bill button */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={fetchBill}
              disabled={!state || !provider || loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ py: 1.25, fontWeight: 700 }}
            >
              {loading ? "Fetching..." : "Fetch Bill"}
            </Button>
          </Grid>

          {/* 5) Bill amount */}
          <Grid item xs={12}>
            {billAmount !== null ? (
              <Paper elevation={0} sx={{ p: 2, borderRadius: 1, bgcolor: "#f6fbf9", border: "1px solid #e6f4ea" }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Bill Amount
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, mt: 0.5 }}>
                  ₹ {billAmount}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Provider: {provider} • State: {state}
                </Typography>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No bill fetched yet.
              </Typography>
            )}
          </Grid>

          {/* 6) MPIN */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="MPIN (4 digits)"
              size="small"
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              inputProps={{ inputMode: "numeric", maxLength: 4 }}
            />
          </Grid>

          {/* Pay */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={pay}
              disabled={loading || billAmount === null}
              sx={{ py: 1.25, fontWeight: 700 }}
            >
              {loading ? <CircularProgress size={16} color="inherit" /> : "Pay from Wallet"}
            </Button>
          </Grid>
          {/* feedback */}
          <Grid item xs={12}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
