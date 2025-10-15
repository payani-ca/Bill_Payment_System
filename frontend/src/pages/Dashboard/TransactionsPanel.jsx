import React from 'react'
import { Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

export default function TransactionsPanel({ transactions = [] }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Recent Transactions</Typography>

      <Table size="small" aria-label="transactions table">
        <TableHead>
          <TableRow>
            <TableCell>TxID</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Spent On</TableCell>
            <TableCell>Timestamp</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">No transactions yet</TableCell>
            </TableRow>
          )}
          {transactions.map(tx => (
            <TableRow key={tx.TxID}>
              <TableCell>{tx.TxID.slice(0,8)}...</TableCell>
              <TableCell>₹ {tx.Amount}</TableCell>
              <TableCell>{tx.SpentOn}</TableCell>
              <TableCell>{new Date(tx.Timestamp).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
