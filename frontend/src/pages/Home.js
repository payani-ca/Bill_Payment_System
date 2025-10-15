// src/pages/Home.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Grid, Typography, Button, Card, CardContent, Avatar, Stack
} from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'

export default function Home() {
  const navigate = useNavigate()

  // image paths in public/assets/
  const hero = '/assets/aa.jpg'      // large hero illustration
  const pay1 = '/assets/pay-1.png'
  const pay2 = '/assets/pay-2.png'
  const pay3 = '/assets/pay-3.png'

  return (
    <Box sx={{ background: 'linear-gradient(180deg,#f6f9ff,#ffffff)', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="lg">
        {/* HERO */}
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ px: { xs: 2, md: 4 } }}>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1.02, mb: 2 }}>
                TrackonPay
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
                One place to manage—pay bills, top up wallets and track spending effortlessly.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" onClick={() => navigate('/login')}>Get Started</Button>
                <Button variant="outlined" size="large" onClick={() => navigate('/register')}>Create Account</Button>
              </Stack>

              <Typography sx={{ mb: 2, color: 'text.secondary' }}>
                Trusted by thousands — secure payments with instant receipts and helpful reminders.
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Card sx={{ minWidth: 160, p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#eef2ff', color: '#4f46e5' }}>
                    <CreditCardIcon />
                  </Avatar>
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Fast Payments</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Complete payments in under 30 seconds.</Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 160, p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#fff7ed', color: '#f59e0b' }}>
                    <ReceiptLongIcon />
                  </Avatar>
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Smart Receipts</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Automatic receipts & transaction history.</Typography>
                  </CardContent>
                </Card>

                <Card sx={{ minWidth: 160, p: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: '#ecfeff', color: '#0891b2' }}>
                    <NotificationsActiveIcon />
                  </Avatar>
                  <CardContent sx={{ p: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Reminders</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Never miss a bill with smart reminders.</Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                component="img"
                src={hero}
                alt="TrackonPay hero"
                sx={{
                  width: { xs: '90%', md: '100%' },
                  borderRadius: 2,
                  boxShadow: 6,
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Payment Images Gallery */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>Payments & Features</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Box component="img" src={pay1} alt="payment 1" sx={{ width: '100%', maxHeight: 140, objectFit: 'contain' }} />
                <Typography sx={{ mt: 1, fontWeight: 700 }}>Unified Wallet</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Add money, store balance, and pay instantly.</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Box component="img" src={pay2} alt="payment 2" sx={{ width: '100%', maxHeight: 140, objectFit: 'contain' }} />
                <Typography sx={{ mt: 1, fontWeight: 700 }}>Bill Insights</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Analytics to understand and reduce recurring costs.</Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Card sx={{ p: 2, textAlign: 'center' }}>
                <Box component="img" src={pay3} alt="payment 3" sx={{ width: '100%', maxHeight: 140, objectFit: 'contain' }} />
                <Typography sx={{ mt: 1, fontWeight: 700 }}>Secure Checkout</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Encrypted payments & instant confirmations.</Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* About & Insights */}
        <Box sx={{ mt: 6 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>About TrackonPay</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                TrackonPay simplifies how you pay and track your bills. Designed for speed and clarity—manage all utilities, subscriptions,
                and one-off payments in a single place. We prioritize security and clear transaction history so you can focus on what matters.
              </Typography>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Why people love it</Typography>
                <ul>
                  <li>Easy onboarding and quick fund transfers</li>
                  <li>Smart reminders to avoid late fees</li>
                  <li>Clear analytics to find and reduce recurring expenses</li>
                </ul>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Insights & Tips</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                TrackonPay delivers actionable insights directly in your dashboard:
              </Typography>

              <ul>
                <li><strong>Monthly Summary:</strong> See how your spending changes month-to-month.</li>
                <li><strong>Top Subscriptions:</strong> Quickly identify subscriptions that can be paused or cancelled.</li>
                <li><strong>Auto-pay Recommendations:</strong> Use scheduled payments for recurring bills and avoid late fees.</li>
              </ul>

              <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={() => navigate('/register')}>Create free account</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Footer CTA */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Ready to simplify bill payments?</Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" size="large" onClick={() => navigate('/login')}>Login</Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/register')}>Sign up</Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}
