// lib/whatsapp.ts

// ========== SHARED UTILITIES (safe for client & server) ==========

// Helper to format date in Beirut timezone (UTC+3)
function formatInBeirutTimezone(date: Date): string {
  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Beirut',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/(\d+)\/(\d+)\/(\d+),/, '$1/$2/$3') // Remove comma from locale string
}

export function formatDateTime(date: Date): string {
  return formatInBeirutTimezone(date)
}

export function combineToISO(dateStr: string, timeStr: string): string {
  // Create date in Beirut timezone
  const [hours, minutes, seconds = '00'] = timeStr.split(':')
  const dt = new Date(dateStr)
  
  // Get the date components in Beirut timezone
  const beirutDate = new Date(dt.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }))
  beirutDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10))
  
  // Convert to UTC ISO string for storage
  return new Date(beirutDate.getTime() - (3 * 60 * 60 * 1000)).toISOString()
}

// ========== SERVER-ONLY FUNCTIONS (never called on client) ==========

function getOwnerNumber(): string {
  const raw = process.env.OWNER_WHATSAPP_NUMBER
  if (!raw) {
    console.warn('OWNER_WHATSAPP_NUMBER not set in .env.local, using fallback')
    return '9613203545'
  }
  return raw.replace(/\D/g, '')
}

function encode(text: string): string {
  return encodeURIComponent(text)
}

function makeLink(message: string): string {
  return `https://wa.me/${getOwnerNumber()}?text=${encode(message)}`
}

export function getCheckInLink(guest: {
  customerName: string
  roomNumber: string
  reservationType: string
  startDate: string | Date
  endDate: string | Date
}): string {
  // Convert to Date objects if strings are passed
  const start = typeof guest.startDate === 'string' ? new Date(guest.startDate) : guest.startDate
  const end = typeof guest.endDate === 'string' ? new Date(guest.endDate) : guest.endDate
  const now = new Date()
  
  const msg = `🏨 *Le Six Hotel — Check-In*
─────────────────────────
👤 Guest: ${guest.customerName}
🚪 Room: ${guest.roomNumber}
📋 Type: ${guest.reservationType}
📅 Start: ${formatInBeirutTimezone(start)}
📅 End: ${formatInBeirutTimezone(end)}
─────────────────────────
✅ Status: Checked In
🕐 Time: ${formatInBeirutTimezone(now)}`
  return makeLink(msg)
}

export function getPaymentLink(
  guest: { customerName: string; roomNumber: string },
  payment: { amountPaid: number; notes?: string | null },
  totalPaid: number
): string {
  const now = new Date()
  const msg = `💳 *Le Six Hotel — Payment Received*
─────────────────────────
👤 Guest: ${guest.customerName}
🚪 Room: ${guest.roomNumber}
💰 Paid: $${payment.amountPaid.toFixed(2)}
💵 Total Paid: $${totalPaid.toFixed(2)}
📝 Notes: ${payment.notes || '—'}
─────────────────────────
🕐 Time: ${formatInBeirutTimezone(now)}`
  return makeLink(msg)
}

export function getCheckOutLink(
  guest: {
    customerName: string
    roomNumber: string
    reservationType: string
    startDate: string | Date
    endDate: string | Date
  },
  totalPaid: number
): string {
  const start = typeof guest.startDate === 'string' ? new Date(guest.startDate) : guest.startDate
  const end = typeof guest.endDate === 'string' ? new Date(guest.endDate) : guest.endDate
  const now = new Date()
  
  // Calculate nights stayed (in Beirut timezone)
  const startBeirut = new Date(start.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }))
  const nowBeirut = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Beirut' }))
  const nights = Math.max(1, Math.round((nowBeirut.getTime() - startBeirut.getTime()) / 86400000))
  
  const msg = `🏁 *Le Six Hotel — Check-Out*
─────────────────────────
👤 Guest: ${guest.customerName}
🚪 Room: ${guest.roomNumber}
📋 Type: ${guest.reservationType}
📅 Check-In: ${formatInBeirutTimezone(start)}
📅 Check-Out: ${formatInBeirutTimezone(now)}
🌙 Duration: ${nights} night(s)
💰 Total Collected: $${totalPaid.toFixed(2)}
─────────────────────────
✅ Room is now available
🕐 Time: ${formatInBeirutTimezone(now)}`
  return makeLink(msg)
}
