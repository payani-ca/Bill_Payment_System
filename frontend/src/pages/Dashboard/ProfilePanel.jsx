import React from 'react'
import { Paper, Typography, Box } from '@mui/material'

export default function ProfilePanel({ user }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Profile</Typography>
      <Box sx={{ display: 'grid', gap: 1 }}>
        <Typography><strong>Name:</strong> {user?.Name}</Typography>
        <Typography><strong>Mobile:</strong> {user?.Mobile}</Typography>
        <Typography><strong>Role:</strong> {user?.role}</Typography>
      </Box>
    </Paper>
  )
}
