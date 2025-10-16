import axios from 'axios'


const API_BASE = ""


const axiosClient = axios.create({
baseURL: API_BASE,
headers: { 'Content-Type': 'application/json' },
// withCredentials: true, // enable if using cookies
})


export default axiosClient