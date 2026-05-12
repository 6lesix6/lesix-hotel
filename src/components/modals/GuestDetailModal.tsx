'use client'
// src/components/modals/GuestDetailModal.tsx
import { useEffect, useState } from 'react'
import { Modal, Btn, EmptyRow } from '@/components/ui'
import { format } from 'date-fns'
import type { Guest } from '@/types'

interface Props {
  open: boolean
  guestId: number | null
  onClose: () => void
  onPayment: (id: number) => void
  onCheckOut: (id: number, name: string, room: string) => void
}

export default function GuestDetailModal({ open, guestId, onClose, onPayment, onCheckOut }: Props) {
  const [guest, setGuest] = useState<(Guest & { totalPaid: number }) | null>(null)

  useEffect(() => {
    if (!open || !guestId) return
    setGuest(null)
    fetch(`/api/guests/${guestId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setGuest(d.data) })
  }, [open, guestId])

  const fmt = (d: string) => format(new Date(d), 'dd MMM yyyy')
  const fmtDt = (d: string) => format(new Date(d), 'dd MMM yyyy HH:mm')

  return (
    <Modal open={open} onClose={onClose} title="Guest Details" maxWidth={560}>
      {!guest ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>Loading…</div>
      ) : (
        <>
          {/* Info grid */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
            Reservation Info
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            {[
              ['Guest Name', guest.customerName],
              ['Room', `Room ${guest.roomNumber}`],
              ['Type', guest.reservationType],
              ['Status', guest.status],
              ['Check-In', fmt(guest.startDate)],
              ['Check-Out', fmt(guest.endDate)],
              ['Created', fmtDt(guest.createdAt)],
              ['Total Paid', `$${guest.totalPaid.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{k}</div>
                <span style={{ fontSize: 13, color: k === 'Total Paid' ? 'var(--gold-light)' : 'var(--text)', fontWeight: k === 'Total Paid' ? 600 : 400 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

          {/* Payments */}
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
            Payment History
          </div>
          <div style={{ background: 'var(--dark-3)', borderRadius: 8, overflow: 'hidden', marginBottom: 18 }}>
            <table className="hotel-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {!guest.payments?.length ? (
                  <EmptyRow cols={3} msg="No payments recorded." />
                ) : guest.payments.map(p => (
                  <tr key={p.id}>
                    <td>{fmtDt(p.paymentDate)}</td>
                    <td style={{ color: 'var(--gold-light)', fontWeight: 600 }}>${p.amountPaid.toFixed(2)}</td>
                    <td style={{ color: 'var(--text-dim)' }}>{p.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          {guest.status === 'CheckedIn' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn variant="success" size="sm" onClick={() => { onClose(); onPayment(guest.id) }}>
                💳 Add Payment
              </Btn>
              <Btn variant="danger" size="sm" onClick={() => { onClose(); onCheckOut(guest.id, guest.customerName, guest.roomNumber) }}>
                Check-Out
              </Btn>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}
