import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getCheckOutLink,
  formatBeirut,
} from '@/lib/whatsapp'

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    })

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not found',
        },
        { status: 404 }
      )
    }

    const totalPaid = guest.payments.reduce(
      (s, p) => s + p.amountPaid,
      0
    )

    return NextResponse.json({
      success: true,

      data: {
        ...guest,

        startDate: formatBeirut(guest.startDate),

        endDate: formatBeirut(guest.endDate),

        createdAt: formatBeirut(guest.createdAt),

        totalPaid,

        payments: guest.payments.map(p => ({
          ...p,
          paymentDate: formatBeirut(p.paymentDate),
        })),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id)

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: { payments: true },
    })

    if (!guest) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not found',
        },
        { status: 404 }
      )
    }

    if (guest.status === 'CheckedOut') {
      return NextResponse.json(
        {
          success: false,
          message: 'Already checked out',
        },
        { status: 400 }
      )
    }

    const totalPaid = guest.payments.reduce(
      (s, p) => s + p.amountPaid,
      0
    )

    const whatsappLink = getCheckOutLink({
      customerName: guest.customerName,
      roomNumber: guest.roomNumber,
      reservationType: guest.reservationType,
      startDate: guest.startDate,
      endDate: guest.endDate,
    }, totalPaid)

    await prisma.guest.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,

      message: `${guest.customerName} checked out from Room ${guest.roomNumber}. Total collected: $${totalPaid.toFixed(2)}`,

      whatsappLink,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        success: false,
        message: 'Check-out failed',
      },
      { status: 500 }
    )
  }
}
