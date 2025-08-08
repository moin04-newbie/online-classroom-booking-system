export type Room = {
  id: string
  name: string
  building: string
  capacity: number
  equipment: string[]
  createdAt: number
}

export type BookingStatus = "approved" | "pending" | "rejected" | "cancelled"

export type Booking = {
  id: string
  roomId: string
  title: string
  purpose?: string
  requester: string
  role: "student" | "teacher" | "admin"
  start: number // epoch ms
  end: number
  status: BookingStatus
  createdAt: number
  notes?: string
  requests?: string
}

export type NotificationItem = {
  id: string
  message: string
  createdAt: number
  read: boolean
  kind: "confirmation" | "cancellation" | "reminder" | "system"
}

export type User = {
  id: string
  name: string
  email: string
  role: "student" | "teacher" | "admin"
  department?: string
  phone?: string
  status: "active" | "inactive" | "suspended"
  createdAt: number
  lastActive: number
  avatar?: string
}

export type RecurringBooking = {
  id: string
  pattern: "daily" | "weekly" | "monthly"
  startDate: number
  endDate: number
  roomId: string
  title: string
  requester: string
  role: "student" | "teacher" | "admin"
  duration: number // minutes
  createdAt: number
}

export type Equipment = {
  id: string
  name: string
  type: string
  model?: string
  serialNumber?: string
  status: "available" | "in-use" | "maintenance" | "broken"
  location?: string
  assignedTo?: string
  createdAt: number
  lastMaintenance?: number
  notes?: string
}
