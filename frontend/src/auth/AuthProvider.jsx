// src/auth/AuthProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosClient from '../api/axiosClient' // make sure this file exists

const AuthContext = createContext(null)

const storage = {
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  get: (k) => {
    const v = localStorage.getItem(k)
    return v ? JSON.parse(v) : null
  },
  remove: (k) => localStorage.removeItem(k),
}

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.get('user'))
  const [accessToken, setAccessToken] = useState(() => storage.get('access_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) storage.set('user', user)
    else storage.remove('user')

    if (accessToken) storage.set('access_token', accessToken)
    else storage.remove('access_token')
  }, [user, accessToken])

  const login = async ({ mobile, password }) => {
    setLoading(true)
    try {
      const res = await axiosClient.post('/login', { mobile, password })
      const data = res.data
      setAccessToken(data.access_token)
      setUser(data.user)
      storage.set('refresh_token', data.refresh_token)
      setLoading(false)
      return { ok: true }
    } catch (err) {
      setLoading(false)
      const msg = err?.response?.data?.msg || err.message
      return { ok: false, message: msg }
    }
  }

  const logout = async () => {
    try {
      // attempt to revoke on server (optional). ignore errors.
      await axiosClient.post('/logout', {}, { headers: { Authorization: `Bearer ${accessToken}` } })
    } catch (e) {
      // ignore network/server errors on logout
    }
    setAccessToken(null)
    setUser(null)
    storage.remove('access_token')
    storage.remove('refresh_token')
    storage.remove('user')
  }

  const fetchWithAuth = async (url, opts = {}) => {
    const headers = opts.headers ? { ...opts.headers } : {}
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`
    const config = { ...opts, headers }
    return axiosClient(url, config)
  }

  const value = { user, accessToken, login, logout, loading, fetchWithAuth }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
