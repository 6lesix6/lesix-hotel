import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCheckInLink } from '@/lib/whatsapp'
import { formatInTimeZone } from 'date-fns-tz'

const TIMEZONE = 'Asia/Beirut'

function formatLebanonDate(date: Date) {
  return formatInTimeZone(date, TIMEZONE, 'yyyy-MM-dd HH:mm:ss')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      customerName,
      roomNumber,
      reservationType,
      startDate,
      endDate,
    } = body

    if (
      !customerName ||
      !roomNumber ||
      !reservationType ||
      !startDate ||
      !endDate
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing fields',
        },
        { status: 400 }
      )
    }

    // Store dates in DB
    // Make sure frontend sends:
    // 2026-05-16T15:00:00+03:00
    const guest = await prisma.guest.create({
      data: {
        customerName,
        roomNumber,
        reservationType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'CheckedIn',
      },
    })

    // WhatsApp data
    const guestForLink = {
      customerName: guest.customerName,
      roomNumber: guest.roomNumber,
      reservationType: guest.reservationType,

      // Lebanon formatted dates
      startDate: formatLebanonDate(guest.startDate),
      endDate: formatLebanonDate(guest.endDate),
    }

    const whatsappLink = getCheckInLink(guestForLink)

    return NextResponse.json({
      success: true,

      data: {
        ...guest,

        // Return Lebanon timezone
        startDate: formatLebanonDate(guest.startDate),
        endDate: formatLebanonDate(guest.endDate),
        createdAt: formatLebanonDate(guest.createdAt),
      },

      whatsappLink,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create guest',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        payments: true,
      },

      orderBy: {
        createdAt: 'desc',
      },
    })

    const formatted = guests.map(g => ({
      ...g,

      // Lebanon timezone
      startDate: formatLebanonDate(g.startDate),
      endDate: formatLebanonDate(g.endDate),
      createdAt: formatLebanonDate(g.createdAt),

      totalPaid: g.payments.reduce(
        (sum, p) => sum + p.amountPaid,
        0
      ),
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch guests',
      },
      { status: 500 }
    )
  }
}
