// src/app/api/guests/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const totalRooms = Number(process.env.NEXT_PUBLIC_TOTAL_ROOMS ?? 45)
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)

    console.log('Today range:', { todayStart, todayEnd })

    const [checkedInGuests, totalGuests, todayCheckIns, todayPayments, allPayments] = await Promise.all([
      prisma.guest.count({ where: { status: 'CheckedIn' } }),
      prisma.guest.count(),
      // FIX: Count by startDate, not createdAt
      prisma.guest.count({ 
        where: { 
          startDate: { gte: todayStart, lte: todayEnd }
        } 
      }),
      prisma.payment.aggregate({
        _sum: { amountPaid: true },
        where: { paymentDate: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.payment.aggregate({ _sum: { amountPaid: true } }),
    ])

    console.log('Stats results:', { checkedInGuests, totalGuests, todayCheckIns, todayPayments: todayPayments._sum.amountPaid })

    return NextResponse.json({
      success: true,
      data: {
        checkedInGuests,
        availableRooms: totalRooms - checkedInGuests,
        todayCheckIns,
        todayRevenue: todayPayments._sum.amountPaid ?? 0,
        totalRevenue: allPayments._sum.amountPaid ?? 0,
        totalGuests,
      },
    })
  } catch (e) {
    console.error('Stats error:', e)
    return NextResponse.json({ success: false, message: 'Stats error' }, { status: 500 })
  }
}
