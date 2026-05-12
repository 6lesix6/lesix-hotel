'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import AppShell from '@/components/layout/AppShell'
import { StatCard, TableWrap, Btn, EmptyRow } from '@/components/ui'
import CheckInModal from '@/components/modals/CheckInModal'
import PaymentModal from '@/components/modals/PaymentModal'
import GuestDetailModal from '@/components/modals/GuestDetailModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { useRealtimeGuests, useRealtimeStats } from '@/hooks/useRealtimeData'
import type { Guest } from '@/types'

export default function DashboardPage() {
  const { guests, loading: gLoading, refresh: refreshGuests } = useRealtimeGuests()
  const { stats, loading: sLoading, refresh: refreshStats } = useRealtimeStats()

  const [ciOpen, setCiOpen] = useState(false)
  const [payGuestId, setPayGuestId] = useState<number | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<{ id: number; name: string; room: string } | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // Combined refresh with debouncing
  const refresh = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    
    if (isRefreshing) return
    
    setIsRefreshing(true)
    console.log('Refreshing data...')
    
    try {
      await Promise.all([refreshGuests(), refreshStats()])
      console.log('Refresh complete')
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshGuests, refreshStats, isRefreshing])

  // Debounced refresh
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    refreshTimeoutRef.current = setTimeout(() => {
      refresh()
    }, 500)
  }, [refresh])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refresh()
    }, 30000)
    return () => {
      clearInterval(interval)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [refresh])

  const checkedIn = guests.filter((g: Guest) => g.status === 'CheckedIn')

  async function doCheckout() {
    if (!checkoutTarget) return
    setCheckoutLoading(true)
    try {
      const res = await fetch(`/api/guests/${checkoutTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setCheckoutTarget(null)
        await refresh()
        if (data.whatsappLink) {
          window.open(data.whatsappLink, '_blank')
        }
      } else {
        toast.error(data.message ?? 'Check-out failed')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Network error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const fmt = (d: string) => format(new Date(d), 'dd MMM yyyy')

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.9rem', fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            {format(new Date(), 'EEEE, dd MMMM yyyy')} · Real-time hotel overview (auto-refreshes every 3s)
          </p>
        </div>
        <Btn variant="primary" onClick={() => setCiOpen(true)} disabled={isRefreshing}>
          {isRefreshing ? '↻ Loading...' : '+ Check-In'}
        </Btn>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14, marginBottom: 24 }}>
        {sLoading ? (
          Array.from({ length: 6 }).map((_: any, i: number) => (
            <div key={i} className="stat-card" style={{ height: 100, background: 'var(--dark-4)' }} />
          ))
        ) : stats ? (
          <>
            <StatCard icon="🏨" label="Checked In"     value={stats.checkedInGuests} color="var(--green-light)" />
            <StatCard icon="🚪" label="Available Rooms" value={stats.availableRooms} />
            <StatCard icon="📅" label="Today Check-Ins" value={stats.todayCheckIns}  color="var(--gold-light)" />
            <StatCard icon="💰" label="Today Revenue"   value={`$${stats.todayRevenue.toFixed(2)}`} color="var(--gold-light)" />
            <StatCard icon="📊" label="Total Revenue"   value={`$${stats.totalRevenue.toFixed(2)}`} />
            <StatCard icon="📋" label="Total Guests"    value={stats.totalGuests} />
          </>
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 20 }}>Failed to load stats</div>
        )}
      </div>

      {/* Current guests table */}
      <TableWrap
        title="⚡ Current Guests (Auto-refreshes every 3 seconds)"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="secondary" onClick={refresh} disabled={isRefreshing}>
              {isRefreshing ? '↻ Refreshing...' : '↻ Refresh'}
            </Btn>
            <Btn size="sm" variant="primary" onClick={() => setCiOpen(true)}>+ Check-In</Btn>
          </div>
        }
      >
        <table className="hotel-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Type</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {gLoading ? (
              <tr><td colSpan={8} style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</td></tr>
            ) : checkedIn.length === 0 ? (
              <EmptyRow cols={8} msg="No guests currently checked in." />
            ) : checkedIn.map((g: Guest, i: number) => (
              <tr key={g.id}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td><strong>{g.customerName}</strong></td>
                <td><span className="badge badge-blue">Room {g.roomNumber}</span></td>
                <td><span className="badge badge-gold">{g.reservationType}</span></td>
                <td>{fmt(g.startDate)}</td>
                <td>{fmt(g.endDate)}</td>
                <td><span className="badge badge-green">● Checked In</span></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Btn size="sm" variant="success" onClick={() => setPayGuestId(g.id)}>💳 Pay</Btn>
                    <Btn size="sm" variant="secondary" onClick={() => setDetailId(g.id)}>👁</Btn>
                    <Btn size="sm" variant="danger" onClick={() => setCheckoutTarget({ id: g.id, name: g.customerName, room: g.roomNumber })}>
                      Check-Out
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      {/* Modals */}
      <CheckInModal 
        open={ciOpen} 
        onClose={() => setCiOpen(false)} 
        onSuccess={async (whatsappLink?: string) => {
          await refresh()
          if (whatsappLink) window.open(whatsappLink, '_blank')
        }} 
      />
      <PaymentModal 
        open={!!payGuestId} 
        guestId={payGuestId} 
        onClose={() => setPayGuestId(null)} 
        onSuccess={async (whatsappLink?: string) => {
          await refresh()
          if (whatsappLink) window.open(whatsappLink, '_blank')
        }} 
      />
      <GuestDetailModal
        open={!!detailId} guestId={detailId}
        onClose={() => setDetailId(null)}
        onPayment={id => setPayGuestId(id)}
        onCheckOut={(id, name, room) => setCheckoutTarget({ id, name, room })}
      />
      <ConfirmModal
        open={!!checkoutTarget}
        title="Confirm Check-Out"
        message={`Check out ${checkoutTarget?.name} from Room ${checkoutTarget?.room}?`}
        sub="A WhatsApp summary will be sent to the owner. Guest record will be removed."
        confirmLabel="Yes, Check Out"
        onClose={() => setCheckoutTarget(null)}
        onConfirm={doCheckout}
        loading={checkoutLoading}
      />
    </AppShell>
  )
}