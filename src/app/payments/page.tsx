'use client'
import { useMemo, useState } from 'react'
import { format, isToday } from 'date-fns'
import AppShell from '@/components/layout/AppShell'
import { StatCard, TableWrap, EmptyRow, Btn } from '@/components/ui'
import { usePayments } from '@/hooks/useGuests'
import PaymentModal from '@/components/modals/PaymentModal'

export default function PaymentsPage() {
  const { payments, loading, refresh } = usePayments()
  const [search, setSearch] = useState('')
  const [payGuestId, setPayGuestId] = useState<number | null>(null)

  const stats = useMemo(() => {
    const total = payments.reduce((s, p) => s + p.amountPaid, 0)
    const todayPays = payments.filter(p => isToday(new Date(p.paymentDate)))
    return {
      total,
      todayTotal: todayPays.reduce((s, p) => s + p.amountPaid, 0),
      count: payments.length,
      todayCount: todayPays.length,
    }
  }, [payments])

  const filtered = useMemo(() => {
    if (!search) return payments
    const q = search.toLowerCase()
    return payments.filter(p =>
      p.guest?.customerName?.toLowerCase().includes(q) ||
      p.notes?.toLowerCase().includes(q)
    )
  }, [payments, search])

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

  return (
    <AppShell>
      <div style={{ marginBottom: 22 }}>
        <h1 className="font-display" style={{ fontSize: '1.9rem', fontWeight: 400, color: 'var(--text)', marginBottom: 4 }}>
          Payments
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>Track all guest payments and transactions</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard icon="💰" label="Total Revenue" value={`$${stats.total.toFixed(2)}`} color="var(--gold-light)" />
        <StatCard icon="📅" label="Today Revenue" value={`$${stats.todayTotal.toFixed(2)}`} color="var(--green-light)" />
        <StatCard icon="🧾" label="All Transactions" value={stats.count} />
        <StatCard icon="📊" label="Today Transactions" value={stats.todayCount} />
      </div>

      {/* Table - Fixed JSX structure */}
      <TableWrap
        title={`Payment History (${filtered.length})`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...inputStyle, width: 220 }}
              placeholder="Search by guest or notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button
              onClick={refresh}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '7px 12px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ↻ Refresh
            </button>
            <Btn size="sm" variant="primary" onClick={() => setPayGuestId(null)}>+ Record Payment</Btn>
          </div>
        }
      >
        <table className="hotel-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Amount</th>
              <th>Date & Time</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <EmptyRow cols={6} msg={search ? 'No payments match your search.' : 'No payments recorded yet.'} />
            ) : (
              filtered.map((p, i) => {
                const today = isToday(new Date(p.paymentDate))
                return (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <strong>{p.guest?.customerName ?? '—'}</strong>
                    </td>
                    <td>
                      {p.guest?.roomNumber ? (
                        <span className="badge badge-blue">Room {p.guest.roomNumber}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--gold-light)', fontWeight: 600, fontSize: 14 }}>
                      ${p.amountPaid.toFixed(2)}
                    </td>
                    <td>
                      <span style={{ color: today ? 'var(--green-light)' : 'var(--text-dim)' }}>
                        {format(new Date(p.paymentDate), 'dd MMM yyyy HH:mm')}
                        {today && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: 10,
                              background: 'rgba(46,125,82,.2)',
                              color: 'var(--green-light)',
                              padding: '1px 6px',
                              borderRadius: 10,
                            }}
                          >
                            today
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-dim)' }}>{p.notes || '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </TableWrap>

      {/* Running total footer */}
      {filtered.length > 0 && (
        <div
          style={{
            marginTop: 12,
            textAlign: 'right',
            fontSize: 13,
            color: 'var(--text-dim)',
          }}
        >
          Showing {filtered.length} records ·{' '}
          <span style={{ color: 'var(--gold-light)', fontWeight: 600 }}>
            Total: ${filtered.reduce((s, p) => s + p.amountPaid, 0).toFixed(2)}
          </span>
        </div>
      )}

      <PaymentModal
        open={payGuestId !== null}
        guestId={payGuestId}
        onClose={() => setPayGuestId(null)}
        onSuccess={(whatsappLink?: string) => {
          refresh()
          if (whatsappLink) window.open(whatsappLink, '_blank')
        }}
      />
    </AppShell>
  )
}