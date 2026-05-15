// lib/whatsapp.ts

// ======================================================
// TIMEZONE HELPERS
// ======================================================

const BEIRUT_TIMEZONE = 'Asia/Beirut'

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

// SAFELY COMBINE DATE + TIME WITHOUT UTC BUGS
export function combineToISO(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)

  const [hours, minutes, seconds = '00'] = timeStr
    .split(':')
    .map(Number)

  // LOCAL DATE CREATION (important)
  const dt = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    seconds
  )

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
// CHECK-IN
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
// PAYMENT
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
// CHECK-OUT
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
      (guest.endDate.getTime() - guest.startDate.getTime()) /
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
