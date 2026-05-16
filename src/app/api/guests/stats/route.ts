// app/api/guests/stats/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper to get current date in Beirut timezone at start of day
function getBeirutDateRange() {
  // Get current time in Beirut timezone
  const nowBeirut = new Date().toLocaleString('en-US', { timeZone: 'Asia/Beirut' })
  const today = new Date(nowBeirut)
  
  // Start of day in Beirut (midnight)
  const startOfDayBeirut = new Date(today)
  startOfDayBeirut.setHours(0, 0, 0, 0)
  
  // End of day in Beirut (23:59:59.999)
  const endOfDayBeirut = new Date(today)
  endOfDayBeirut.setHours(23, 59, 59, 999)
  
  // Convert to UTC for database query (subtract 3 hours)
  const startUTC = new Date(startOfDayBeirut.getTime() - (3 * 60 * 60 * 1000))
  const endUTC = new Date(endOfDayBeirut.getTime() - (3 * 60 * 60 * 1000))
  
  return { startUTC, endUTC }
}

export async function GET() {
  try {
    const totalRooms = Number(process.env.NEXT_PUBLIC_TOTAL_ROOMS ?? 45)
    
    const { startUTC, endUTC } = getBeirutDateRange()
    
    console.log('Date range query (UTC):', { startUTC, endUTC })

    const [
      checkedInGuests,
      totalGuests,
      todayCheckInsByStartDate,
      todayPayments,
      allPayments,
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
            gte: startUTC, 
            lte: endUTC 
          }
        } 
      }),
      
      // Payments made today
      prisma.payment.aggregate({
        _sum: { amountPaid: true },
        where: { 
          paymentDate: { 
            gte: startUTC, 
            lte: endUTC 
          }
        },
      }),
      
      // All payments ever
      prisma.payment.aggregate({ 
        _sum: { amountPaid: true } 
      }),
    ])

    console.log('Stats calculated:', {
      checkedInGuests,
      todayCheckInsByStartDate,
      todayRevenue: todayPayments._sum.amountPaid,
    })

    const responseData = {
      success: true,
      data: {
        checkedInGuests,
        availableRooms: Math.max(0, totalRooms - checkedInGuests),
        todayCheckIns: todayCheckInsByStartDate,
        todayRevenue: todayPayments._sum?.amountPaid ?? 0,
        totalRevenue: allPayments._sum?.amountPaid ?? 0,
        totalGuests,
      },
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Stats API Error:', error)
    return NextResponse.json(
      { success: false, message: 'Stats error', error: String(error) },
      { status: 500 }
    )
  }
}
