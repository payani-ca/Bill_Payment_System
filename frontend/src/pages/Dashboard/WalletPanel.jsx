import React from 'react'
import { Paper, Typography, Box, Button } from '@mui/material'

export default function WalletPanel({ wallet }) {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">Wallet Balance</Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>₹ {wallet?.Amount ?? 0}</Typography>
        </Box>
        <Box>
          <Button variant="contained" sx={{ mr: 1 }}>Add Money</Button>
          <Button variant="outlined">Withdraw</Button>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Last Updated: {wallet?.LastModified ? new Date(wallet.LastModified).toLocaleString() : '—'}
        </Typography>
      </Box>
    </Paper>
  )
}
