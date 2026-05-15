import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getCheckInLink,
  formatBeirut,
} from '@/lib/whatsapp'

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

    const whatsappLink = getCheckInLink({
      customerName: guest.customerName,
      roomNumber: guest.roomNumber,
      reservationType: guest.reservationType,
      startDate: guest.startDate,
      endDate: guest.endDate,
    })

    return NextResponse.json({
      success: true,

      data: {
        ...guest,

        startDate: formatBeirut(guest.startDate),

        endDate: formatBeirut(guest.endDate),

        createdAt: formatBeirut(guest.createdAt),
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

      startDate: formatBeirut(g.startDate),

      endDate: formatBeirut(g.endDate),

      createdAt: formatBeirut(g.createdAt),

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
    return NextResponse.json(
      { success: false, message: 'Failed to fetch guests' },
      { status: 500 }
    )
  }
}
