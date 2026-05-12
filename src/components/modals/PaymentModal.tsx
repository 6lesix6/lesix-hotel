'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Modal, Btn, Field, inputStyle } from '@/components/ui'
import type { Guest } from '@/types'

interface Props {
  open: boolean
  guestId: number | null
  onClose: () => void
  onSuccess: (whatsappLink?: string) => void   // ← changed to accept link
}

export default function PaymentModal({ open, guestId, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [guest, setGuest] = useState<(Guest & { totalPaid: number }) | null>(null)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!open || !guestId) return
    setAmount(''); setNotes(''); setGuest(null)
    fetch(`/api/guests/${guestId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setGuest(d.data) })
      .catch(console.error)
  }, [open, guestId])

  async function submit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')

    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, amountPaid: amt, notes }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        onSuccess(data.whatsappLink)   // ← pass link to parent
        onClose()
      } else {
        toast.error(data.message ?? 'Payment failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="💳 Record Payment">
      {/* Guest info panel */}
      <div style={{
        background: 'var(--dark-4)', borderRadius: 8, padding: 14,
        marginBottom: 18, fontSize: 13,
      }}>
        {!guest ? (
          <span style={{ color: 'var(--text-muted)' }}>Loading guest info…</span>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              ['Guest', guest.customerName],
              ['Room', `Room ${guest.roomNumber}`],
              ['Type', guest.reservationType],
              ['Total Paid', `$${guest.totalPaid.toFixed(2)}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '.07em' }}>{k}</div>
                <strong style={{ color: k === 'Total Paid' ? 'var(--gold-light)' : 'var(--text)' }}>{v}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <Field label="Amount Paid (USD) *">
        <input
          style={inputStyle} type="number" step="0.01" min="0.01"
          value={amount} onChange={e => setAmount(e.target.value)}
          placeholder="0.00" autoFocus
        />
      </Field>

      <Field label="Notes (optional)">
        <input
          style={inputStyle} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Cash payment, bank transfer…"
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="success" onClick={submit} disabled={loading || !guest}>
          {loading ? 'Processing…' : '✓ Record Payment'}
        </Btn>
      </div>
    </Modal>
  )
}