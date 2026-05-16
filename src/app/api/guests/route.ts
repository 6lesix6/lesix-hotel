// app/api/guests/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCheckInLink } from '@/lib/whatsapp'

// Helper to convert local Beirut date to UTC for storage
function beirutDateToUTC(date: Date): Date {
  // Subtract 3 hours to convert from Beirut to UTC
  return new Date(date.getTime() - (3 * 60 * 60 * 1000))
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
        { success: false, message: 'Missing fields' },
        { status: 400 }
      )
    }

    // Parse the incoming dates (they are in Beirut timezone)
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    
    // Convert to UTC for storage in database
    const startDateUTC = beirutDateToUTC(startDateObj)
    const endDateUTC = beirutDateToUTC(endDateObj)

    const guest = await prisma.guest.create({
      data: {
        customerName,
        roomNumber,
        reservationType,
        startDate: startDateUTC,
        endDate: endDateUTC,
        status: 'CheckedIn',
      },
    })

    // Pass the original Date objects (not strings) to getCheckInLink
    // The whatsapp function will handle formatting with Beirut timezone
    const whatsappLink = getCheckInLink({
      customerName: guest.customerName,
      roomNumber: guest.roomNumber,
      reservationType: guest.reservationType,
      startDate: guest.startDate,  // Pass Date object
      endDate: guest.endDate,      // Pass Date object
    })

    return NextResponse.json({
      success: true,
      data: {
        ...guest,
        startDate: guest.startDate.toISOString(),
        endDate: guest.endDate.toISOString(),
        createdAt: guest.createdAt.toISOString(),
      },
      whatsappLink,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: 'Failed to create guest' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const guests = await prisma.guest.findMany({
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = guests.map(g => ({
      ...g,
      startDate: g.startDate.toISOString(),
      endDate: g.endDate.toISOString(),
      createdAt: g.createdAt.toISOString(),
      totalPaid: g.payments.reduce((sum, p) => sum + p.amountPaid, 0),
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}
