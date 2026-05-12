// lib/whatsapp.ts

// ========== SHARED UTILITIES (safe for client & server) ==========

export function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear().toString().slice(-2)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
}

export function combineToISO(dateStr: string, timeStr: string): string {
  const [hours, minutes, seconds = '00'] = timeStr.split(':')
  const dt = new Date(dateStr)
  dt.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10))
  return dt.toISOString()
}

// ========== SERVER-ONLY FUNCTIONS (never called on client) ==========

// Helper to get owner number – only runs when these functions are called.
// Since they are only called from API routes (server), it's safe.
function getOwnerNumber(): string {
  const raw = process.env.OWNER_WHATSAPP_NUMBER
  if (!raw) {
    // Fallback for development; remove this line if you want strict mode
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
  startDate: string
  endDate: string
}): string {
  const start = new Date(guest.startDate)
  const end = new Date(guest.endDate)
  const now = new Date()
  const msg = `🏨 *Le Six Hotel — Check-In*
─────────────────────────
👤 Guest: ${guest.customerName}-
🚪 Room: ${guest.roomNumber}
📋 Type: ${guest.reservationType}
📅 Start: ${formatDateTime(start)}
📅 End: ${formatDateTime(end)}
─────────────────────────
✅ Status: Checked In
🕐 Time: ${formatDateTime(now)}`
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
🕐 Time: ${formatDateTime(now)}`
  return makeLink(msg)
}

export function getCheckOutLink(
  guest: {
    customerName: string
    roomNumber: string
    reservationType: string
    startDate: string
    endDate: string
  },
  totalPaid: number
): string {
  const start = new Date(guest.startDate)
  const end = new Date(guest.endDate)
  const now = new Date()
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const msg = `🏁 *Le Six Hotel — Check-Out*
─────────────────────────
👤 Guest: ${guest.customerName}
🚪 Room: ${guest.roomNumber}
📋 Type: ${guest.reservationType}
📅 Check-In: ${formatDateTime(start)}
📅 Check-Out: ${formatDateTime(now)}
🌙 Duration: ${nights} night(s)
💰 Total Collected: $${totalPaid.toFixed(2)}
─────────────────────────
✅ Room is now available
🕐 Time: ${formatDateTime(now)}`
  return makeLink(msg)
}
