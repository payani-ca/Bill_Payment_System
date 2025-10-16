// src/components/FeatureCards.jsx
import React, { useState } from 'react'
import { Grid, Box } from '@mui/material'
import StyledCard from './StyledCard'
import ElectricityDialog from './ElectricityDialog'
import DTHDialog from './DTHDialog'
import MobileRechargeDialog from './MobileRechargeDialog'
import WaterBillDialog from './WaterBillDialog'
import LoanRepaymentDialog from './LoanRepaymentDialog'
import GasBillDialog from './GasBillDialog'
import CreditCardDialog from './CreditCardDialog'
import FastTagDialog from './FastTagDialog'

const FEATURES = [
  { key: 'electricity', title: 'Electricity Bill', subtitle: 'Pay electricity bills', image: '/assets/elect (1).jpg' },
  { key: 'dth', title: 'DTH Recharge', subtitle: 'Recharge your DTH', image: '/assets/dth_recharge (1).jpg' },
  { key: 'mobile', title: 'Mobile Recharge', subtitle: 'Prepaid & Postpaid', image: '/assets/mobile (1).jpg' },
  { key: 'water', title: 'Water Bill', subtitle: 'Pay water bill', image: '/assets/water-bill (1).jpg' },
  { key: 'gas', title: 'Gas Bill', subtitle: 'Pay gas bill', image: '/assets/gasbill (1).jpg' },
  { key: 'loan', title: 'Loan Repayment', subtitle: 'Pay your loans', image: '/assets/loan (1).jpg' },
  { key: 'fasttag', title: 'Fastag', subtitle: 'Recharge your Fastag', image: '/assets/fastag (1).jpg' },
  { key: 'creditcard', title: 'Credit Card', subtitle: 'Pay credit card bills', image: '/assets/credit (1).jpg' },
]

export default function FeatureCards() {
  const [openDialog, setOpenDialog] = useState({
    electricity: false,
    dth: false,
    mobile: false,
    water: false,
    gas: false,
    loan: false,
    fasttag: false,
    creditcard: false,
  })

  const onCardClick = (key) => {
    setOpenDialog(prev => ({ ...prev, [key]: true }))
  }

  const closeDialog = (key) => {
    setOpenDialog(prev => ({ ...prev, [key]: false }))
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        mt: 3,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Grid
        container
        spacing={3}
        sx={{
          width: '100%',
          maxWidth: '900px', // keeps nice centered layout
          justifyContent: 'center',
        }}
      >
        {FEATURES.map((f) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={6}
            key={f.key}
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <StyledCard
              image={f.image}
              title={f.title}
              subtitle={f.subtitle}
              onClick={() => onCardClick(f.key)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Dialogs */}
      <ElectricityDialog open={openDialog.electricity} onClose={() => closeDialog('electricity')} />
      <DTHDialog open={openDialog.dth} onClose={() => closeDialog('dth')} />
      <MobileRechargeDialog open={openDialog.mobile} onClose={() => closeDialog('mobile')} />
      <WaterBillDialog open={openDialog.water} onClose={() => closeDialog('water')} />
      <LoanRepaymentDialog open={openDialog.loan} onClose={() => closeDialog('loan')} />
      <GasBillDialog open={openDialog.gas} onClose={() => closeDialog('gas')} />
      <FastTagDialog open={openDialog.fasttag} onClose={() => closeDialog('fasttag')} />
      <CreditCardDialog open={openDialog.creditcard} onClose={() => closeDialog('creditcard')} />
    </Box>
  )
}
