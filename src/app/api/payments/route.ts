import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentLink } from '@/lib/whatsapp'

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: { guest: { select: { customerName: true, roomNumber: true } } },
      orderBy: { paymentDate: 'desc' },
    })
    return NextResponse.json({
      success: true,
      data: payments.map(p => ({ ...p, paymentDate: p.paymentDate.toISOString() })),
    })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { guestId, amountPaid, notes } = body

    if (!guestId || !amountPaid || amountPaid <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid payment data' }, { status: 400 })
    }

    const guest = await prisma.guest.findUnique({ where: { id: Number(guestId) } })
    if (!guest) {
      return NextResponse.json({ success: false, message: 'Guest not found' }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: { guestId: Number(guestId), amountPaid: Number(amountPaid), notes: notes ?? '' },
    })

    const totalPaidAgg = await prisma.payment.aggregate({
      _sum: { amountPaid: true },
      where: { guestId: Number(guestId) },
    })
    const totalPaid = totalPaidAgg._sum.amountPaid ?? 0

    // Prepare minimal objects for WhatsApp link
    const guestForLink = {
      customerName: guest.customerName,
      roomNumber: guest.roomNumber,
    }
    const paymentForLink = {
      amountPaid: payment.amountPaid,
      notes: payment.notes,
    }
    const whatsappLink = getPaymentLink(guestForLink, paymentForLink, totalPaid)

    return NextResponse.json({
      success: true,
      message: `$${amountPaid} recorded for ${guest.customerName}`,
      data: { ...payment, paymentDate: payment.paymentDate.toISOString() },
      whatsappLink, // 👈 frontend can use this to open WhatsApp
    }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ success: false, message: 'Payment failed' }, { status: 500 })
  }
}