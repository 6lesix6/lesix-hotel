// src/hooks/useRealtimeData.ts
import useSWR from 'swr'
import type { Guest, DashboardStats } from '@/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useRealtimeGuests() {
  const { data, error, isLoading, mutate } = useSWR('/api/guests', fetcher, {
    refreshInterval: 2000, // Every 2 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 1000, // Don't dedupe for 1 second
    refreshWhenHidden: false, // Don't refresh when tab is hidden to save resources
  })
  
  return {
    guests: data?.data || [],
    loading: isLoading,
    refresh: () => {
      console.log('Manual refresh guests triggered')
      return mutate()
    },
    error
  }
}

export function useRealtimeStats() {
  const { data, error, isLoading, mutate } = useSWR('/api/guests/stats', fetcher, {
    refreshInterval: 2000, // Every 2 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 1000,
    refreshWhenHidden: false,
  })
  
  return {
    stats: data?.data || null,
    loading: isLoading,
    refresh: () => {
      console.log('Manual refresh stats triggered')
      return mutate()
    },
    error
  }
}
