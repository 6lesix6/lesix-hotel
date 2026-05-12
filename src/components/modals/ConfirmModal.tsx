'use client'
// src/components/modals/ConfirmModal.tsx
import { Modal, Btn } from '@/components/ui'

interface Props {
  open: boolean
  title: string
  message: string
  sub?: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function ConfirmModal({ open, title, message, sub, confirmLabel = 'Confirm', onClose, onConfirm, loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth={400}>
      <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, marginBottom: sub ? 8 : 24 }}>
        {message}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 24 }}>{sub}</p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing…' : confirmLabel}
        </Btn>
      </div>
    </Modal>
  )
}
