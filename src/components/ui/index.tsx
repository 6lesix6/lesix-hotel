'use client'
// src/components/ui/index.tsx — All shared UI primitives

import { X } from 'lucide-react'
import { ReactNode } from 'react'

/* ── Modal ──────────────────────────────────────────────────────────────── */
export function Modal({
  open, onClose, title, children, maxWidth = 520,
}: {
  open: boolean; onClose: () => void; title: string;
  children: ReactNode; maxWidth?: number;
}) {
  if (!open) return null
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}>
      <div style={{
        background: 'var(--dark-2)', border: '1px solid var(--border)',
        borderRadius: 14, width: '100%', maxWidth, maxHeight: '90vh',
        overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.7)',
      }}>
        <div style={{
          padding: '18px 22px 14px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span className="font-display" style={{ fontSize: '1.2rem', color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'var(--surface)', color: 'var(--text-dim)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: '22px 22px 24px' }}>{children}</div>
      </div>
    </div>
  )
}

/* ── Button ─────────────────────────────────────────────────────────────── */
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'success'
const BtnStyles: Record<BtnVariant, object> = {
  primary:   { background: 'var(--gold)', color: 'var(--dark)' },
  secondary: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' },
  danger:    { background: '#4A1212', color: '#F0A0A0', border: '1px solid rgba(192,57,43,.4)' },
  success:   { background: 'rgba(46,125,82,.25)', color: '#7DD9A8', border: '1px solid rgba(59,168,103,.3)' },
}
export function Btn({
  children, onClick, variant = 'secondary', size = 'md', disabled = false, type = 'button',
}: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant;
  size?: 'sm' | 'md'; disabled?: boolean; type?: 'button' | 'submit';
}) {
  const padding = size === 'sm' ? '5px 11px' : '8px 16px'
  const fontSize = size === 'sm' ? 11 : 13
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding, fontSize, fontWeight: 600, borderRadius: 7,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? .5 : 1, transition: 'opacity .15s',
        fontFamily: 'inherit',
        ...BtnStyles[variant],
      }}>
      {children}
    </button>
  )
}

/* ── FormField ───────────────────────────────────────────────────────────── */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-dim)',
        textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputStyle = {
  width: '100%', background: 'var(--dark-4)', border: '1px solid var(--border)',
  color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 13,
  outline: 'none', fontFamily: 'inherit',
}

/* ── StatCard ────────────────────────────────────────────────────────────── */
export function StatCard({ icon, label, value, color }: {
  icon: string; label: string; value: string | number; color?: string;
}) {
  return (
    <div className="stat-card">
      <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
        {label}
      </div>
      <div className="font-display" style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, color: color ?? 'var(--text)' }}>
        {value}
      </div>
    </div>
  )
}

/* ── Table helpers ───────────────────────────────────────────────────────── */
export function EmptyRow({ cols, msg = 'No records found.' }: { cols: number; msg?: string }) {
  return (
    <tr>
      <td colSpan={cols} style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: 13 }}>
        {msg}
      </td>
    </tr>
  )
}

export function TableWrap({ title, actions, children }: {
  title: string; actions?: ReactNode; children: ReactNode;
}) {
  return (
    <div style={{ background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10,
        borderBottom: '1px solid var(--border)', background: 'var(--dark-4)',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{title}</span>
        {actions}
      </div>
      {children}
    </div>
  )
}
