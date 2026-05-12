'use client'
import { useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import AppShell from '@/components/layout/AppShell'
import { TableWrap, Btn, EmptyRow } from '@/components/ui'
import CheckInModal from '@/components/modals/CheckInModal'
import PaymentModal from '@/components/modals/PaymentModal'
import GuestDetailModal from '@/components/modals/GuestDetailModal'
import ConfirmModal from '@/components/modals/ConfirmModal'
import { useGuests } from '@/hooks/useGuests'

const inputStyle = {
  background: 'var(--dark-4)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  padding: '7px 12px',
  borderRadius: 7,
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
}

export default function GuestsPage() {
  const { guests, loading, refresh } = useGuests()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'CheckedIn' | 'CheckedOut'>('all')
  const [ciOpen, setCiOpen] = useState(false)
  const [payGuestId, setPayGuestId] = useState<number | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const [checkoutTarget, setCheckoutTarget] = useState<{ id: number; name: string; room: string } | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const filtered = useMemo(() => {
    return guests
      .filter(g => filter === 'all' || g.status === filter)
      .filter(g =>
        !search ||
        g.customerName.toLowerCase().includes(search.toLowerCase()) ||
        g.roomNumber.includes(search)
      )
  }, [guests, search, filter])

  async function doCheckout() {
    if (!checkoutTarget) return
    setCheckoutLoading(true)
    try {
      const res = await fetch(`/api/guests/${checkoutTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        setCheckoutTarget(null)
        refresh()
        if (data.whatsappLink) {
          window.open(data.whatsappLink, '_blank')
        }
      } else {
        toast.error(data.message ?? 'Check-out failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const fmt = (d: string) => format(new Date(d), 'dd MMM yyyy')

  const tabStyle = (val: typeof filter) => ({
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    transition: 'all .15s',
    background: filter === val ? 'var(--gold)' : 'var(--surface)',
    color: filter === val ? 'var(--dark)' : 'var(--text-dim)',
  })

  return (
    <AppShell>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '1.9rem', fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
            Guests
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Manage all reservations and check-ins</p>
        </div>
        <Btn variant="primary" onClick={() => setCiOpen(true)}>+ New Check-In</Btn>
      </div>

      <TableWrap
        title={`All Guests (${filtered.length})`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              style={{ ...inputStyle, width: 200 }}
              placeholder="Search name or room…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button style={tabStyle('all')} onClick={() => setFilter('all')}>All</button>
            <button style={tabStyle('CheckedIn')} onClick={() => setFilter('CheckedIn')}>Checked In</button>
            <button style={tabStyle('CheckedOut')} onClick={() => setFilter('CheckedOut')}>Checked Out</button>
            <Btn size="sm" variant="secondary" onClick={refresh}>↻</Btn>
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
              <th>Total Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <EmptyRow cols={9} msg={search ? 'No guests match your search.' : 'No guests found.'} />
            ) : (
              filtered.map((g, i) => (
                <tr key={g.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <button
                      onClick={() => setDetailId(g.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0 }}
                    >
                      {g.customerName}
                    </button>
                  </td>
                  <td><span className="badge badge-blue">Room {g.roomNumber}</span></td>
                  <td><span className="badge badge-gold">{g.reservationType}</span></td>
                  <td>{fmt(g.startDate)}</td>
                  <td>{fmt(g.endDate)}</td>
                  <td>
                    {g.status === 'CheckedIn'
                      ? <span className="badge badge-green">● Checked In</span>
                      : <span className="badge badge-red">Checked Out</span>}
                  </td>
                  <td style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
                    ${(g.totalPaid ?? 0).toFixed(2)}
                  </td>
                  <td>
                    {g.status === 'CheckedIn' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Btn size="sm" variant="success" onClick={() => setPayGuestId(g.id)}>💳 Pay</Btn>
                        <Btn size="sm" variant="danger" onClick={() => setCheckoutTarget({ id: g.id, name: g.customerName, room: g.roomNumber })}>
                          Check-Out
                        </Btn>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrap>

      <CheckInModal
        open={ciOpen}
        onClose={() => setCiOpen(false)}
        onSuccess={(whatsappLink?: string) => {
          refresh()
          if (whatsappLink) window.open(whatsappLink, '_blank')
        }}
      />
      <PaymentModal
        open={!!payGuestId}
        guestId={payGuestId}
        onClose={() => setPayGuestId(null)}
        onSuccess={(whatsappLink?: string) => {
          refresh()
          if (whatsappLink) window.open(whatsappLink, '_blank')
        }}
      />
      <GuestDetailModal
        open={!!detailId}
        guestId={detailId}
        onClose={() => setDetailId(null)}
        onPayment={id => setPayGuestId(id)}
        onCheckOut={(id, name, room) => setCheckoutTarget({ id, name, room })}
      />
      <ConfirmModal
        open={!!checkoutTarget}
        title="Confirm Check-Out"
        message={`Check out ${checkoutTarget?.name} from Room ${checkoutTarget?.room}?`}
        sub="A WhatsApp notification will be sent. The guest record will be removed after checkout."
        confirmLabel="Yes, Check Out"
        onClose={() => setCheckoutTarget(null)}
        onConfirm={doCheckout}
        loading={checkoutLoading}
      />
    </AppShell>
  )
}