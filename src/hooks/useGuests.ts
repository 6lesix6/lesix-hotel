// src/hooks/useGuests.ts
import { useState, useEffect, useCallback } from 'react'
import type { Guest, DashboardStats } from '@/types'

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) // Add refresh counter

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1) // Increment to trigger re-fetch
  }, [])

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/guests')
        const data = await res.json()
        if (data.success) {
          console.log('Guests fetched:', data.data.length)
          setGuests(data.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGuests()
  }, [refreshKey]) // Re-run when refreshKey changes

  return { guests, loading, refresh }
}

export function useStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) // Add refresh counter

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1) // Increment to trigger re-fetch
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/guests/stats')
        const data = await res.json()
        if (data.success) {
          console.log('Stats fetched:', data.data)
          setStats(data.data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [refreshKey]) // Re-run when refreshKey changes

  return { stats, loading, refresh }
}

export function usePayments() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/payments')
        const data = await res.json()
        if (data.success) setPayments(data.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPayments()
  }, [refreshKey])

  return { payments, loading, refresh }
}
