// components/CheckInModal.tsx

'use client'

import { useState, FormEvent, useEffect } from 'react'
import toast from 'react-hot-toast'
import { Modal, Btn, Field, inputStyle } from '@/components/ui'
import { combineToISO } from '@/lib/whatsapp'

type ReservationType = 'Daily' | 'DayUse' | 'Monthly'

interface Props {
  open: boolean
  onClose: () => void
  onSuccess: (whatsappLink?: string) => void
}

const todayDate = () => {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

const nowTime = () => {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
}

const tomorrowDate = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

export default function CheckInModal({ open, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    customerName: '',
    roomNumber: '',
    reservationType: 'Daily' as ReservationType, // ✅ explicit union type
    startDate: todayDate(),
    startTime: nowTime(),
    endDate: tomorrowDate(),
    endTime: nowTime(),
  })

  useEffect(() => {
    if (open) {
      setForm({
        customerName: '',
        roomNumber: '',
        reservationType: 'Daily',
        startDate: todayDate(),
        startTime: nowTime(),
        endDate: tomorrowDate(),
        endTime: nowTime(),
      })
    }
  }, [open])

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return

    if (!form.customerName.trim()) return toast.error('Guest name is required')
    if (!form.roomNumber.trim()) return toast.error('Room number is required')

    const startISO = combineToISO(form.startDate, form.startTime)
    const endISO = combineToISO(form.endDate, form.endTime)
    const start = new Date(startISO)
    const end = new Date(endISO)

    // ✅ No TypeScript error – form.reservationType is 'Daily'|'DayUse'|'Monthly'
    if (form.reservationType === 'DayUse') {
      if (end < start) return toast.error('End date/time cannot be before start')
    } else {
      if (end <= start) return toast.error('End date/time must be after start')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          roomNumber: form.roomNumber,
          reservationType: form.reservationType,
          startDate: startISO,
          endDate: endISO,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message || 'Check-in successful')
        onSuccess(data.whatsappLink)
        onClose()
        setTimeout(() => {
          setForm({
            customerName: '',
            roomNumber: '',
            reservationType: 'Daily',
            startDate: todayDate(),
            startTime: nowTime(),
            endDate: tomorrowDate(),
            endTime: nowTime(),
          })
        }, 200)
      } else {
        toast.error(data.message ?? 'Check-in failed')
      }
    } catch {
      toast.error('Network error – please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="🏨 New Check-In">
      <form onSubmit={submit}>
        <Field label="Guest Full Name *">
          <input
            style={inputStyle}
            value={form.customerName}
            autoFocus
            onChange={setField('customerName')}
            placeholder="e.g. Ahmad El Khoury"
            disabled={loading}
            required
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Room Number *">
            <input
              style={inputStyle}
              value={form.roomNumber}
              onChange={setField('roomNumber')}
              placeholder="e.g. 101"
              disabled={loading}
              required
            />
          </Field>
          <Field label="Reservation Type">
            <select
              style={inputStyle}
              value={form.reservationType}
              onChange={setField('reservationType')}
              disabled={loading}
            >
              <option value="Daily">Daily</option>
              <option value="DayUse">Day Use</option>
              <option value="Monthly">Monthly</option>
            </select>
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Start Date *">
            <input
              style={inputStyle}
              type="date"
              value={form.startDate}
              onChange={setField('startDate')}
              min={todayDate()}
              disabled={loading}
              required
            />
          </Field>
          <Field label="Start Time (seconds) *">
            <input
              style={inputStyle}
              type="time"
              step="1"
              value={form.startTime}
              onChange={setField('startTime')}
              disabled={loading}
              required
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="End Date *">
            <input
              style={inputStyle}
              type="date"
              value={form.endDate}
              onChange={setField('endDate')}
              min={form.startDate}
              disabled={loading}
              required
            />
          </Field>
          <Field label="End Time (seconds) *">
            <input
              style={inputStyle}
              type="time"
              step="1"
              value={form.endTime}
              onChange={setField('endTime')}
              disabled={loading}
              required
            />
          </Field>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
          <Btn variant="secondary" onClick={onClose} disabled={loading} type="button">
            Cancel
          </Btn>
          <Btn variant="primary" disabled={loading} type="submit">
            {loading ? 'Processing…' : '✓ Check In'}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}