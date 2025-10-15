import axios from 'axios'


const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000'


const axiosClient = axios.create({
baseURL: API_BASE,
headers: { 'Content-Type': 'application/json' },
// withCredentials: true, // enable if using cookies
})


export default axiosClient