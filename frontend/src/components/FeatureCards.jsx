// src/components/FeatureCards.jsx
import React, { useState } from 'react'
import { Grid } from '@mui/material'
import StyledCard from './StyledCard'
import ElectricityDialog from './ElectricityDialog'

const FEATURES = [
  { key: 'electricity', title: 'Electricity Bill', subtitle: 'Pay electricity bills', image: '/assets/pay-1.png' },
  { key: 'dth', title: 'DTH Recharge', subtitle: 'Recharge your DTH', image: '/assets/pay-2.png' },
  { key: 'mobile', title: 'Mobile Recharge', subtitle: 'Prepaid & Postpaid', image: '/assets/pay-3.png' },
  { key: 'water', title: 'Water Bill', subtitle: 'Pay water bill', image: '/assets/pay-1.png' },
  { key: 'gas', title: 'Gas Bill', subtitle: 'Pay gas bill', image: '/assets/pay-2.png' },
  { key: 'internet', title: 'Internet', subtitle: 'ISP payments', image: '/assets/pay-3.png' },
]

export default function FeatureCards() {
  const [openElectricity, setOpenElectricity] = useState(false)

  const onCardClick = (key) => {
    if (key === 'electricity') setOpenElectricity(true)
    else {
      // TODO: handle other features (open modal, route, etc.)
      alert(`${key} clicked — implement action.`)
    }
  }

  return (
    <>
      <Grid container spacing={3}>
        {FEATURES.map(f => (
          <Grid item xs={12} sm={6} md={4} key={f.key}>
            <StyledCard image={f.image} title={f.title} subtitle={f.subtitle} onClick={() => onCardClick(f.key)} />
          </Grid>
        ))}
      </Grid>

      <ElectricityDialog open={openElectricity} onClose={() => setOpenElectricity(false)} />
    </>
  )
}
