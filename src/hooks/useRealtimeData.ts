// src/hooks/useRealtimeData.ts
import useSWR from 'swr'
import type { Guest, DashboardStats } from '@/types'

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json())

// Hook for guests with real-time updates
export function useRealtimeGuests() {
  const { data, error, isLoading, mutate } = useSWR('/api/guests', fetcher, {
    refreshInterval: 3000, // Auto-refresh every 3 seconds
    revalidateOnFocus: true, // Refresh when tab gets focus
    revalidateOnReconnect: true, // Refresh when internet reconnects
    dedupingInterval: 2000, // Don't refetch more than every 2 seconds
  })
  
  return {
    guests: data?.data || [],
    loading: isLoading,
    refresh: () => mutate(), // Manual refresh
    error: error
  }
}

// Hook for stats with real-time updates
export function useRealtimeStats() {
  const { data, error, isLoading, mutate } = useSWR('/api/guests/stats', fetcher, {
    refreshInterval: 3000, // Auto-refresh every 3 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2000,
  })
  
  return {
    stats: data?.data || null,
    loading: isLoading,
    refresh: () => mutate(),
    error: error
  }
}

// Hook for payments with real-time updates
export function useRealtimePayments() {
  const { data, error, isLoading, mutate } = useSWR('/api/payments', fetcher, {
    refreshInterval: 5000, // Auto-refresh every 5 seconds for payments
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })
  
  return {
    payments: data?.data || [],
    loading: isLoading,
    refresh: () => mutate(),
    error: error
  }
}