import React, { useEffect, useState } from 'react'
import { Box, Container } from '@mui/material'
import Sidebar from '../../components/Sidebar'
import FeatureCards from '../../components/FeatureCards'
import WalletPanel from './WalletPanel'
import TransactionsPanel from './TransactionsPanel'
import ProfilePanel from './ProfilePanel'
import { useAuth } from '../../auth/AuthProvider'
import axiosClient from '../../api/axiosClient'

export default function Dashboard() {
  const { user, accessToken } = useAuth()
  const [selected, setSelected] = useState('profile') // default
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    async function loadData() {
      try {
        const userID = user?.UserID
        if (!userID) return

        // Wallet
        try {
          const wRes = await axiosClient.get(`/api/wallets/${userID}`, { headers: { Authorization: `Bearer ${accessToken}` } })
          setWallet(wRes.data)
        } catch (e) {
          setWallet({
            Amount: 1000,
            name: user?.Name,
            userInitials: user?.Name?.split(' ').map(s => s[0]).join('').slice(0, 2),
            LastModified: new Date().toISOString()
          })
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
    <Box sx={{ width: '100%' }}>
      {/* put the content inside a centered container if you want maxWidth */}
      <Container maxWidth="xl" sx={{ p: 0 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 3,
            width: '100%',
            minHeight: 'calc(100vh - 72px)', // adjust header height if needed
            px: 3,
            py: 2
          }}
        >
          {/* LEFT column: fixed width sidebar + stacked panels below */}
          <Box
            sx={{
              width: 300,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: 'stretch',
              // allow sidebar to remain visible while scrolling
              // if you want it sticky:
              position: 'relative'
            }}
          >
            {/* Sidebar (top) */}
            <Sidebar selected={selected} setSelected={setSelected} wallet={wallet} />

            {/* Panels stacked below the sidebar */}
            <Box sx={{ display: selected === 'profile' ? 'block' : 'none' }}>
              <ProfilePanel user={user} />
            </Box>

            <Box sx={{ display: selected === 'wallet' ? 'block' : 'none' }}>
              <WalletPanel wallet={wallet} />
            </Box>

            <Box sx={{ display: selected === 'transactions' ? 'block' : 'none' }}>
              <TransactionsPanel transactions={transactions} />
            </Box>
          </Box>

          {/* RIGHT column: feature cards fill remaining space */}
          <Box
            sx={{
              flex: 1,
              // ensures cards fill the remaining vertical space if you like:
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              // allow cards area to scroll independently if content grows:
              minWidth: 0
            }}
          >
            <FeatureCards />
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
