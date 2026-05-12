// src/types/index.ts

export type ReservationType = 'DayUse' | 'Daily' | 'Monthly'
export type GuestStatus = 'CheckedIn' | 'CheckedOut'

export interface Guest {
  id: number
  customerName: string
  roomNumber: string
  reservationType: ReservationType
  startDate: string
  endDate: string
  status: GuestStatus
  createdAt: string
  payments?: Payment[]
  totalPaid?: number
}

export interface Payment {
  id: number
  amountPaid: number
  paymentDate: string
  notes: string
  guestId: number
  guest?: Pick<Guest, 'customerName' | 'roomNumber'>
}

export interface DashboardStats {
  checkedInGuests: number
  availableRooms: number
  todayCheckIns: number
  todayRevenue: number
  totalRevenue: number
  totalGuests: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface CheckInPayload {
  customerName: string
  roomNumber: string
  reservationType: ReservationType
  startDate: string
  endDate: string
}

export interface PaymentPayload {
  guestId: number
  amountPaid: number
  notes?: string
}
