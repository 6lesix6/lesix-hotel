// src/app/api/guests/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const totalRooms = Number(process.env.NEXT_PUBLIC_TOTAL_ROOMS ?? 45)
    
    // Set today's date range properly
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Get all data in parallel for performance
    const [
      checkedInGuests,
      totalGuests,
      todayCheckInsByStartDate,
      todayPayments,
      allPayments,
      allGuestsWithDates
    ] = await Promise.all([
      // Currently checked in guests
      prisma.guest.count({ 
        where: { status: 'CheckedIn' } 
      }),
      
      // Total guests ever
      prisma.guest.count(),
      
      // Guests who checked in today (based on startDate)
      prisma.guest.count({ 
        where: { 
          startDate: { 
            gte: todayStart, 
            lte: todayEnd 
          }
        } 
      }),
      
      // Payments made today
      prisma.payment.aggregate({
        _sum: { amountPaid: true },
        where: { 
          paymentDate: { 
            gte: todayStart, 
            lte: todayEnd 
          }
        },
      }),
      
      // All payments ever
      prisma.payment.aggregate({ 
        _sum: { amountPaid: true } 
      }),
      
      // Debug: Get all guests to verify
      prisma.guest.findMany({
        select: { id: true, customerName: true, status: true, startDate: true }
      })
    ])

    // Debug logging
    console.log('=== STATS DEBUG ===')
    console.log('Total rooms configured:', totalRooms)
    console.log('Checked in guests:', checkedInGuests)
    console.log('Today check-ins (by startDate):', todayCheckInsByStartDate)
    console.log('Today payments total:', todayPayments._sum.amountPaid)
    console.log('All payments total:', allPayments._sum.amountPaid)
    console.log('All guests in DB:', allGuestsWithDates)
    console.log('==================')

    const responseData = {
      success: true,
      data: {
        checkedInGuests,
        availableRooms: totalRooms - checkedInGuests,
        todayCheckIns: todayCheckInsByStartDate,
        todayRevenue: todayPayments._sum?.amountPaid ?? 0,
        totalRevenue: allPayments._sum?.amountPaid ?? 0,
        totalGuests,
      },
    }

    console.log('Returning stats:', responseData)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Stats API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Stats error', error: String(error) },
      { status: 500 }
    )
  }
}
