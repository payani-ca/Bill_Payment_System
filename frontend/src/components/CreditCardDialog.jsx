// src/components/CreditCardDialog.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, CircularProgress,
  Alert, Paper, FormControl, InputLabel, Select, MenuItem,
  TextField, IconButton, Chip, Stack
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";

const CREDITCARD_PROVIDERS = [
  "HDFC Bank", "SBI Card", "ICICI Bank", "Axis Bank", "Kotak",
  "IndusInd Bank", "Yes Bank", "RBL Bank", "Bank of Baroda", "HSBC"
];

export default function CreditCardDialog({ open, onClose }) {
  const { user, fetchWithAuth } = useAuth();
  const [provider, setProvider] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [serviceNo, setServiceNo] = useState("");
  const [billAmount, setBillAmount] = useState(null);
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!open) {
      setProvider(""); setCardNumber(""); setServiceNo(""); setBillAmount(null);
      setMpin(""); setError(null); setSuccess(null);
    } else fetchWalletBalance();
  }, [open]);

  const fetchWalletBalance = async () => {
    if (!user?.UserID) return;
    setLoadingWallet(true);
    try { const res = await fetchWithAuth(`/api/wallets/${user.UserID}`, { method: "GET" }); setWalletBalance(res.data?.Amount ?? null); } 
    catch { setWalletBalance(null); } finally { setLoadingWallet(false); }
  };

  const fetchBill = async () => {
    if (!provider) return setError("Select provider.");
    setError(null); setSuccess(null); setLoading(true);
    try {
      const res = await fetchWithAuth("/api/creditcard/bill", { method: "POST", data: { provider } });
      setBillAmount(res.data.bill_amount);
      setServiceNo(res.data.ServiceNo);
    } catch (err) { setError(err?.response?.data?.msg || "Failed to fetch bill."); setBillAmount(null); }
    finally { setLoading(false); }
  };

  const payBill = async () => {
    if (!serviceNo || billAmount === null) return setError("Fetch bill first.");
    if (!/^\d{4}$/.test(mpin)) return setError("Enter valid 4-digit MPIN.");
    if (!cardNumber) return setError("Enter card number.");

    setLoading(true); setError(null); setSuccess(null);
    try {
      const payload = { provider, card_number: cardNumber, bill_amount: billAmount, mpin, service_no: serviceNo };
      const res = await fetchWithAuth("/api/creditcard/pay", { method: "POST", data: payload });
      setSuccess(`Payment successful! New balance: ₹ ${res.data.RemainingBalance}`);
      setWalletBalance(res.data.RemainingBalance);
      setMpin(""); setCardNumber("");
    } catch (err) { setError(err?.response?.data?.msg || "Payment failed."); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 2, minHeight: 600 } }}>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: "#fefce8", borderBottom: "1px solid #eaeaea" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CreditCardIcon sx={{ color: "#ca8a04" }} />
          <Typography variant="h6" fontWeight={700}>Credit Card Payment</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip icon={<AccountBalanceWalletIcon />} label={loadingWallet ? "Fetching..." : walletBalance !== null ? `₹ ${walletBalance}` : "—"} color="primary" variant="outlined" size="small" />
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 3, px: 4 }}>
        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel id="provider-label">Provider</InputLabel>
            <Select labelId="provider-label" value={provider} label="Provider" onChange={(e) => { setProvider(e.target.value); setBillAmount(null); }}>
              {CREDITCARD_PROVIDERS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField fullWidth label="Card Number" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />

          <TextField fullWidth label="Service Number" value={serviceNo} onChange={e => setServiceNo(e.target.value)} helperText="Leave blank to auto-generate" />

          <Button fullWidth variant="contained" sx={{ py: 1.8, fontWeight: 600, textTransform: "none", fontSize: "1.1rem", bgcolor: "#ca8a04", '&:hover': { bgcolor: '#a16207' } }} onClick={fetchBill} disabled={!provider || loading}>
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : "Fetch Bill"}
          </Button>

          <AnimatePresence>
            {billAmount !== null && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <Paper elevation={0} sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "#fefce8", border: "2px solid #fef3c7" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>Bill Amount</Typography>
                  <Typography variant="h2" fontWeight={700} sx={{ my: 2, color: '#ca8a04' }}>₹ {billAmount}</Typography>
                  <Typography variant="body1" color="text.secondary">{provider}</Typography>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          <TextField fullWidth label="MPIN (4 digits)" type="password" value={mpin} onChange={e => setMpin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputProps={{ inputMode: "numeric", maxLength: 4, autoComplete: "off" }} />

          <Button fullWidth variant="contained" color="success" onClick={payBill} disabled={!billAmount || loading || !mpin || !cardNumber} sx={{ py: 1.8, fontWeight: 600, textTransform: "none", fontSize: "1.1rem" }}>
            {loading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : "Pay from Wallet"}
          </Button>

          {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ textTransform: "none" }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
