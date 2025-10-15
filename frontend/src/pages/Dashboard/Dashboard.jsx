import React, { useEffect, useState } from 'react'
import { Grid, Container, Box } from '@mui/material'
// import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import FeatureCards from '../../components/FeatureCards'
import WalletPanel from './WalletPanel'
import TransactionsPanel from './TransactionsPanel'
import ProfilePanel from './ProfilePanel'
import { useAuth } from '../../auth/AuthProvider'
import axiosClient from '../../api/axiosClient'

export default function Dashboard() {
  const { user, accessToken } = useAuth()
  const [selected, setSelected] = useState('wallet')
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Load wallet & transactions from backend (example endpoints). Adjust as needed.
    async function loadData() {
      try {
        const userID = user?.UserID
        if (!userID) return

        // Wallet
        try {
          const wRes = await axiosClient.get(`/wallets/${userID}`, { headers: { Authorization: `Bearer ${accessToken}` } })
          setWallet(wRes.data)
        } catch (e) {
          // fallback: mock wallet
          setWallet({ Amount: 5000, name: user?.Name, userInitials: user?.Name?.split(' ').map(s=>s[0]).join('').slice(0,2), LastModified: new Date().toISOString() })
        }

        // Transactions
        try {
          const tRes = await axiosClient.get(`/transactions/${userID}`, { headers: { Authorization: `Bearer ${accessToken}` } })
          setTransactions(tRes.data.transactions || [])
        } catch (e) {
          setTransactions([])
        }
      } catch (err) {
        console.error(err)
      }
    }
    loadData()
  }, [user, accessToken])

  return (
    <Box>
     
      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <Sidebar selected={selected} setSelected={setSelected} wallet={wallet} />
          </Grid>

          {/* Main content */}
          <Grid item xs={12} md={9}>
            {/* Top quick panels */}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {selected === 'wallet' && <WalletPanel wallet={wallet} />}
                {selected === 'transactions' && <TransactionsPanel transactions={transactions} />}
                {selected === 'profile' && <ProfilePanel user={user} />}
              </Grid>

              <Grid item xs={12}>
                <FeatureCards />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
