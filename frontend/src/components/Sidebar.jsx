import React from 'react'
import { Box, Avatar, Typography, List, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import HistoryIcon from '@mui/icons-material/History'

export default function Sidebar({ selected, setSelected, wallet }) {
  return (
    <Box sx={{ width: '100%', maxWidth: 280, p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ width: 64, height: 64, bgcolor: '#4f46e5' }}>
          {wallet?.userInitials || 'U'}
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{wallet?.name || 'User Name'}</Typography>
          <Typography variant="body2" color="text.secondary">Member since 2025</Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2, p: 1, borderRadius: 2, background: '#f8fafc' }}>
        <Typography variant="caption" color="text.secondary">Wallet Balance</Typography>
        <Typography sx={{ fontWeight: 800, mt: 0.5 }}>{wallet ? `₹ ${wallet.Amount}` : '—'}</Typography>
      </Box>

      <Divider sx={{ mb: 1 }} />

      <List>
        <ListItemButton selected={selected === 'profile'} onClick={() => setSelected('profile')}>
          <ListItemIcon><AccountCircleIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItemButton>

        <ListItemButton selected={selected === 'wallet'} onClick={() => setSelected('wallet')}>
          <ListItemIcon><AccountBalanceWalletIcon /></ListItemIcon>
          <ListItemText primary="Wallet" />
        </ListItemButton>

        <ListItemButton selected={selected === 'transactions'} onClick={() => setSelected('transactions')}>
          <ListItemIcon><HistoryIcon /></ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItemButton>
      </List>
    </Box>
  )
}
