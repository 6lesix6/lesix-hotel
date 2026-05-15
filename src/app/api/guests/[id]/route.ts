// src/lib/whatsapp.ts

// ======================================================
// TIMEZONE
// ======================================================

const BEIRUT_TIMEZONE = 'Asia/Beirut'

// ======================================================
// DATE FORMATTERS
// ======================================================

export function formatBeirut(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BEIRUT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatDateTime(date: Date): string {
  return formatBeirut(date)
}

// ======================================================
// SAFE DATE + TIME COMBINER
// FIXES UTC / -3 HOURS BUG
// ======================================================

export function combineToISO(
  dateStr: string,
  timeStr: string
): string {
  const [year, month, day] = dateStr
    .split('-')
    .map(Number)

  const parts = timeStr.split(':')

  const hours = Number(parts[0] ?? 0)
  const minutes = Number(parts[1] ?? 0)
  const seconds = Number(parts[2] ?? 0)

  // IMPORTANT:
  // Creates LOCAL date safely
  // Avoids new Date('YYYY-MM-DD') UTC bug
  const dt = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds
  )

  // Store in UTC
  return dt.toISOString()
}

// ======================================================
// WHATSAPP HELPERS
// ======================================================

function getOwnerNumber(): string {
  const raw = process.env.OWNER_WHATSAPP_NUMBER

  if (!raw) {
    console.warn(
      'OWNER_WHATSAPP_NUMBER not set in .env.local, using fallback'
    )

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

// ======================================================
// CHECK-IN LINK
// ======================================================

export function getCheckInLink(guest: {
  customerName: string
  roomNumber: string
  reservationType: string
  startDate: Date
  endDate: Date
}): string {
  const now = new Date()

  const msg = `🏨 *Le Six Hotel — Check-In*
─────────────────────────
👤 Guest: ${guest.customerName}
🚪 Room: ${guest.roomNumber}
📋 Type: ${guest.reservationType}
📅 Start: ${formatDateTime(guest.startDate)}
📅 End: ${formatDateTime(guest.endDate)}
─────────────────────────
✅ Status: Checked In
🕐 Time: ${formatDateTime(now)}`

  return makeLink(msg)
}

// ======================================================
// PAYMENT LINK
// ======================================================

export function getPaymentLink(
  guest: {
    customerName: string
    roomNumber: string
  },
  payment: {
    amountPaid: number
    notes?: string | null
  },
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

// ======================================================
// CHECK-OUT LINK
// ======================================================

export function getCheckOutLink(
  guest: {
    customerName: string
    roomNumber: string
    reservationType: string
    startDate: Date
    endDate: Date
  },
  totalPaid: number
): string {
  const now = new Date()

  const nights = Math.max(
    1,
    Math.round(
      (guest.endDate.getTime() -
        guest.startDate.getTime()) /
        86400000
    )
  )

  const msg = `🏁 *Le Six Hotel — Check-Out*
─────────────────────────
👤 Guest: ${guest.customerName}
🚪 Room: ${guest.roomNumber}
📋 Type: ${guest.reservationType}
📅 Check-In: ${formatDateTime(guest.startDate)}
📅 Original End: ${formatDateTime(guest.endDate)}
📅 Check-Out: ${formatDateTime(now)}
🌙 Duration: ${nights} night(s)
💰 Total Collected: $${totalPaid.toFixed(2)}
─────────────────────────
✅ Room is now available
🕐 Time: ${formatDateTime(now)}`

  return makeLink(msg)
}
