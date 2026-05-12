'use client'
// src/components/layout/AppShell.tsx
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/guests',    label: 'Guests',    Icon: Users },
  { href: '/payments',  label: 'Payments',  Icon: CreditCard },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => setClock(
      new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' })
      + ' · ' + new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
    )
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <header style={{
        height: 56, background: 'var(--dark-2)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 16, flexShrink: 0,
      }}>
        {/* Logo - THIS SECTION IS UPDATED */}
<div style={{
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: '50%',
  overflow: 'hidden',
  border: '1px solid var(--gold-dim)',
  position: 'relative', // Necessary for "fill"
}}>
  <Image 
    src="/logo.png" 
    alt="Le Six Hotel" 
    fill // This tells it to fill the parent div
    style={{ 
      objectFit: 'cover', // This ensures it fills the circle completely
      display: 'block' 
    }} 
  />
</div>
        <span className="font-display" style={{ fontSize: '1.1rem', color: 'var(--gold-light)', letterSpacing: '.04em' }}>
          Le Six Hotel System
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 11,
            color: 'var(--green-light)', background: 'rgba(46,125,82,.15)',
            padding: '3px 10px', borderRadius: 20,
          }}>
            <span className="pulse-dot" />
            System Online
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{clock}</span>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <nav style={{
          width: 192, background: 'var(--dark-2)', borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', padding: '18px 0', flexShrink: 0,
        }}>
        {/* Sidebar logo */}
        <div style={{ padding: '0 18px 16px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
          <Image src="/logo.png" alt="Le Six Hotel" width={60} height={60}
            style={{ display: 'block', margin: '0 auto', borderRadius: '50%', border: '1px solid var(--gold-dim)' }}
          />
          <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 6, letterSpacing: '.1em' }}>
            LE SIX HOTEL
          </p>
        </div>

        {NAV.map(({ href, label, Icon }) => {
            const active = path.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 11, padding: '10px 18px',
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                color: active ? 'var(--gold-light)' : 'var(--text-dim)',
                background: active ? 'var(--dark-3)' : 'transparent',
                borderLeft: `3px solid ${active ? 'var(--gold)' : 'transparent'}`,
                transition: 'all .15s',
              }}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}

          <div style={{ flex: 1 }} />
          <div style={{
            padding: '14px 18px', fontSize: 10, color: 'var(--text-muted)',
            lineHeight: 1.7, borderTop: '1px solid var(--border)',
          }}>
            Powered by<br />Kamel Nassif<br />(Solunera)
          </div>
        </nav>

        {/* Main */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 26, background: 'var(--dark)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

