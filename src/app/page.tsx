'use client'
// src/app/page.tsx — Splash screen with logo, then redirect to /dashboard
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function SplashPage() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in on mount
    const v = setTimeout(() => setVisible(true), 80)
    // Start progress bar
    const p = setTimeout(() => setProgress(100), 120)
    // Navigate to dashboard
    const r = setTimeout(() => router.replace('/dashboard'), 2800)
    return () => { clearTimeout(v); clearTimeout(p); clearTimeout(r) }
  }, [router])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: 'var(--dark)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease',
      }}
    >
      {/* Logo image with glow pulse animation */}
      <div
        className="splash-logo"
        style={{
          marginBottom: 32, borderRadius: '50%', overflow: 'hidden',
          width: 160, height: 160,
          boxShadow: '0 0 60px rgba(184,149,63,0.35)',
        }}
      >
        <Image
          src="/logo.png"
          alt="Le Six Hotel Logo"
          width={160}
          height={160}
          priority
          style={{ display: 'block' }}
        />
      </div>

      <h1
        className="font-display"
        style={{
          fontSize: '2.6rem', fontWeight: 300, color: 'var(--text)',
          letterSpacing: '.08em', marginBottom: 6,
        }}
      >
        Le Six Hotel
      </h1>
      <p
        style={{
          fontSize: 11, color: 'var(--text-dim)', letterSpacing: '.28em',
          textTransform: 'uppercase', marginBottom: 52,
        }}
      >
        Property Management System
      </p>

      {/* Progress bar */}
      <div style={{ width: 220, height: 2, borderRadius: 2, background: 'var(--dark-4)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%', borderRadius: 2,
            background: 'linear-gradient(90deg, var(--gold-dim), var(--gold-light))',
            width: `${progress}%`,
            transition: 'width 2.4s cubic-bezier(.4,0,.2,1)',
          }}
        />
      </div>

      <p
        style={{
          position: 'absolute', bottom: 28, fontSize: 11,
          color: 'var(--text-muted)', letterSpacing: '.12em',
        }}
      >
        Powered by Kamel Nassif (Solunera)
      </p>
    </div>
  )
}
