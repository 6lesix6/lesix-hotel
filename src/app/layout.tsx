// src/app/layout.tsx
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-display',
})

const sans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Le Six Hotel System',
  description: 'Hotel Property Management System by Kamel Nassif (Solunera)',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1C1C22',
              color: '#E8E4DC',
              border: '1px solid #333340',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#3BA867', secondary: '#1C1C22' } },
            error: { iconTheme: { primary: '#E74C3C', secondary: '#1C1C22' } },
          }}
        />
      </body>
    </html>
  )
}
