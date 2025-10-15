// src/components/StyledCard.jsx
import React from 'react'
import { Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material'

export default function StyledCard({ image, title, subtitle, onClick }) {
  return (
    <Card
      sx={{
        maxWidth: 360,
        m: 'auto',
        borderRadius: 3,
        boxShadow: '0px 6px 20px rgba(2,6,23,0.08)',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        '&:hover': {
          transform: onClick ? 'translateY(-8px)' : undefined,
          boxShadow: onClick ? '0px 12px 36px rgba(2,6,23,0.16)' : undefined,
        },
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        cursor: onClick ? 'pointer' : 'default',
      }}
      role="article"
      aria-label={title}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          height: '100%',
        }}
      >
        <CardMedia
          component="img"
          height="180"
          image={image}
          alt={title}
          sx={{
            objectFit: 'contain',
            backgroundColor: '#f9fafb',
            width: '100%',
            borderBottom: '1px solid #f1f5f9',
          }}
        />
        <CardContent sx={{ textAlign: 'center', px: 3, pb: 3 }}>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              letterSpacing: 0.4,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {subtitle}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
