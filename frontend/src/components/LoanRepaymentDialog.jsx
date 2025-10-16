// src/components/LoanRepaymentDialog.jsx
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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../auth/AuthProvider";

const LOAN_PROVIDERS = [
  "HDFC",
  "ICICI",
  "Bajaj Finance",
  "Tata Capital",
  "Axis Bank",
  "Kotak Mahindra",
  "IDFC First",
  "IndusInd Bank",
  "Home Credit",
  "Mahindra Finance"
];

export default function LoanRepaymentDialog({ open, onClose }) {
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
      const res = await fetchWithAuth(`/wallets/${user.UserID}`, { method: "GET" });
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
      const res = await fetchWithAuth("/loanrepayment/bill", {
        method: "POST",
        data: { provider },
      });
      const data = res.data;
      setBillAmount(data.bill_amount);
      if (data.ServiceNo) setServiceNo(data.ServiceNo);
    } catch (err) {
      setError(err?.response?.data?.msg || "Failed to fetch loan amount.");
      setBillAmount(null);
    } finally {
      setLoading(false);
    }
  };

  const pay = async () => {
    setError(null);
    setSuccess(null);

    if (!serviceNo || billAmount === null) return setError("Fetch the loan amount before paying.");
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
      const res = await fetchWithAuth("/loanrepayment/pay", {
        method: "POST",
        data: payload,
      });
      const data = res.data;
      let msg = data.msg || "Repayment successful.";
      if (data.new_balance !== undefined) msg += ` New balance: ₹ ${data.new_balance}`;
      setSuccess(msg);
      setMpin("");
      setWalletBalance(data.new_balance ?? walletBalance);
    } catch (err) {
      setError(err?.response?.data?.msg || "Repayment failed.");
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
          bgcolor: "#fefce8",
          borderBottom: "1px solid #eaeaea",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceIcon sx={{ color: "#ca8a04" }} />
          <Typography variant="h6" fontWeight={700}>
            Loan Repayment
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
            <InputLabel id="provider-label">Loan Provider / Bank</InputLabel>
            <Select
              labelId="provider-label"
              id="provider-select"
              value={provider}
              label="Loan Provider / Bank"
              onChange={(e) => {
                setProvider(e.target.value);
                setBillAmount(null);
              }}
            >
              {LOAN_PROVIDERS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Service Number / Loan Account Number */}
          <TextField
            fullWidth
            label="Loan Account Number"
            value={serviceNo}
            onChange={(e) => setServiceNo(e.target.value)}
            helperText="Leave blank if system should generate automatically."
          />

          {/* Fetch Bill Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{ 
              py: 1.8, 
              fontWeight: 600, 
              textTransform: 'none', 
              fontSize: '1.1rem',
              bgcolor: '#ca8a04',
              '&:hover': {
                bgcolor: '#a16207'
              }
            }}
            onClick={fetchBill}
            disabled={loading || !provider}
          >
            {loading ? (
              <>
                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                Fetching...
              </>
            ) : (
              "Fetch EMI/Loan Amount"
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
                    bgcolor: "#fefce8",
                    border: "2px solid #fef3c7",
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, mb: 1 }}>
                    Repayment Amount
                  </Typography>
                  <Typography variant="h2" fontWeight={700} sx={{ my: 2, color: '#ca8a04' }}>
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