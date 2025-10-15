// src/components/FeatureCards.jsx
import React, { useState } from 'react'
import { Grid } from '@mui/material'
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
  { key: 'electricity', title: 'Electricity Bill', subtitle: 'Pay electricity bills', image: '/assets/pay-1.png' },
  { key: 'dth', title: 'DTH Recharge', subtitle: 'Recharge your DTH', image: '/assets/pay-2.png' },
  { key: 'mobile', title: 'Mobile Recharge', subtitle: 'Prepaid & Postpaid', image: '/assets/pay-3.png' },
  { key: 'water', title: 'Water Bill', subtitle: 'Pay water bill', image: '/assets/pay-1.png' },
  { key: 'gas', title: 'Gas Bill', subtitle: 'Pay gas bill', image: '/assets/pay-2.png' },
  // { key: 'internet', title: 'Internet', subtitle: 'ISP payments', image: '/assets/pay-3.png' },
  { key: 'loan', title: 'Loan Repayment', subtitle: 'Pay your loans', image: '/assets/pay-4.png' },
  { key: 'fasttag', title: 'Fastag', subtitle: 'Recharge your Fastag', image: '/assets/pay-5.png' },
  { key: 'creditcard', title: 'Credit Card', subtitle: 'Pay credit card bills', image: '/assets/pay-6.png' },


]


export default function FeatureCards() {
  const [openElectricity, setOpenElectricity] = useState(false)
  const [openDTH, setOpenDTH] = useState(false)
  const [openMobile, setOpenMobile] = useState(false)
  const [openWater, setOpenWater] = useState(false)
  const [openLoan, setOpenLoan] = useState(false)
  const [openGas, setOpenGas] = useState(false)
  const [openFasttag, setOpenFasttag] = useState(false)
  const [openCreditCard, setOpenCreditCard] = useState(false)


  const onCardClick = (key) => {
    if (key === 'electricity') {
      setOpenElectricity(true)
    } else if (key === 'dth') {
      setOpenDTH(true)
    } else if (key === 'mobile') {
      setOpenMobile(true)
    } else if (key === 'water') {
      setOpenWater(true)
    } else if (key === 'loan') { 
      setOpenLoan(true)
    } else if (key === 'gas') { 
      setOpenGas(true)
    } else if (key === 'fasttag') { 
      setOpenFasttag(true)
    } else if (key === 'creditcard') { 
      setOpenCreditCard(true)
    } else {
      // TODO: handle other features (open modal, route, etc.)
      alert(`${key} clicked — implement action.`)
    }
  }

  return (
    <>
      <Grid container spacing={3}>
        {FEATURES.map(f => (
          <Grid item xs={12} sm={6} md={4} key={f.key}>
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
      <ElectricityDialog open={openElectricity} onClose={() => setOpenElectricity(false)} />
      <DTHDialog open={openDTH} onClose={() => setOpenDTH(false)} />
      <MobileRechargeDialog open={openMobile} onClose={() => setOpenMobile(false)} />
      <WaterBillDialog open={openWater} onClose={() => setOpenWater(false)} />
      <LoanRepaymentDialog open={openLoan} onClose={() => setOpenLoan(false)} />
      <GasBillDialog open={openGas} onClose={() => setOpenGas(false)} />
      <CreditCardDialog open={openCreditCard} onClose={() => setOpenCreditCard(false)} />
      <FastTagDialog open={openFasttag} onClose={() => setOpenFasttag(false)} />
    </>
  )
}