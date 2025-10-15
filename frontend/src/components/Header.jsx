// import React from 'react'
// import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material'
// import { useAuth } from '../auth/AuthProvider'
// import { useNavigate } from 'react-router-dom'

// export default function Header() {
//   const { logout, user } = useAuth()
//   const navigate = useNavigate()

//   const onLogout = async () => {
//     await logout()
//     navigate('/login')
//   }

//   return (
//     <AppBar position="static" color="transparent" elevation={1} sx={{ borderBottom: '1px solid #eee' }}>
//       <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Typography variant="h6" sx={{ fontWeight: 800, color: '#3b3b98' }}>
//             TrackonPay
//           </Typography>
//         </Box>

//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>{user?.Name}</Typography>
//           <Button variant="outlined" color="primary" size="small" onClick={onLogout}>
//             Logout
//           </Button>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   )
// }
