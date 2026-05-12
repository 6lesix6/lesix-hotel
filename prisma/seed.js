const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const g1 = await prisma.guest.create({
    data: {
      customerName: 'Ahmad El Khoury',
      roomNumber: '101',
      reservationType: 'Daily',
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-04-18'),
      status: 'CheckedIn',
      payments: {
        create: [{ amountPaid: 150, notes: 'Cash - first night' }]
      }
    }
  })

  const g2 = await prisma.guest.create({
    data: {
      customerName: 'Sara Mansour',
      roomNumber: '205',
      reservationType: 'Monthly',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-30'),
      status: 'CheckedIn',
      payments: {
        create: [{ amountPaid: 1200, notes: 'Bank transfer - full month' }]
      }
    }
  })

  const g3 = await prisma.guest.create({
    data: {
      customerName: 'Georges Habib',
      roomNumber: '312',
      reservationType: 'DayUse',
      startDate: new Date('2026-04-18'),
      endDate: new Date('2026-04-18'),
      status: 'CheckedIn',
      payments: {
        create: [{ amountPaid: 80, notes: 'Cash' }]
      }
    }
  })

  await prisma.guest.create({
    data: {
      customerName: 'Lina Karam',
      roomNumber: '118',
      reservationType: 'Daily',
      startDate: new Date('2026-04-17'),
      endDate: new Date('2026-04-20'),
      status: 'CheckedIn',
      payments: {
        create: [
          { amountPaid: 250, notes: 'Partial payment' },
          { amountPaid: 200, notes: 'Balance' }
        ]
      }
    }
  })

  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
