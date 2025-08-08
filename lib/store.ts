import { type Room, type Booking, type NotificationItem, type User, type RecurringBooking, type Equipment } from "./types"

type DB = {
  rooms: Room[]
  bookings: Booking[]
  notifications: NotificationItem[]
  users: User[]
  recurringBookings: RecurringBooking[]
  equipment: Equipment[]
  broadcast: (event: any) => void
  subscribe: (fn: (event: any) => void) => () => void
}

const g = globalThis as any
if (!g.__CLASSROOM_DB__) {
  const subs = new Set<(event: any) => void>()
  const broadcast = (event: any) => {
    for (const fn of subs) fn(event)
  }
  const now = Date.now()
  const rooms: Room[] = [
    { id: "r-101", name: "Room 101", building: "Main", capacity: 40, equipment: ["Projector", "AC"], createdAt: now },
    { id: "r-102", name: "Room 102", building: "Main", capacity: 30, equipment: ["AC"], createdAt: now },
    { id: "lab-1", name: "Science Lab 1", building: "Science", capacity: 25, equipment: ["Projector", "AC"], createdAt: now },
    { id: "studio", name: "Studio A", building: "Arts", capacity: 20, equipment: ["Projector"], createdAt: now },
  ]
  const sampleStart = new Date().setHours(10, 0, 0, 0)
  const sampleEnd = new Date().setHours(12, 0, 0, 0)
  const bookings: Booking[] = [
    { id: "b-1", roomId: "r-101", title: "Exam Review", requester: "Prof. Lee", role: "teacher", start: sampleStart, end: sampleEnd, status: "approved", createdAt: now },
  ]
  const notifications: NotificationItem[] = [
    { id: "n-1", message: "Booking b-1 confirmed.", createdAt: now, read: false, kind: "confirmation" },
  ]
  const users: User[] = [
    { 
      id: "u-admin", 
      name: "Admin User", 
      email: "admin@school.edu", 
      role: "admin", 
      department: "Administration", 
      phone: "+1-555-0100", 
      status: "active", 
      createdAt: now, 
      lastActive: now 
    },
    { 
      id: "u-teacher1", 
      name: "Prof. Sarah Johnson", 
      email: "s.johnson@school.edu", 
      role: "teacher", 
      department: "Computer Science", 
      phone: "+1-555-0101", 
      status: "active", 
      createdAt: now, 
      lastActive: now 
    },
    { 
      id: "u-student1", 
      name: "John Smith", 
      email: "j.smith@student.school.edu", 
      role: "student", 
      department: "Engineering", 
      status: "active", 
      createdAt: now, 
      lastActive: now 
    }
  ]
  const recurringBookings: RecurringBooking[] = []
  const equipment: Equipment[] = [
    {
      id: "eq-1",
      name: "Digital Projector",
      type: "Projector", 
      model: "Epson BrightLink Pro 1460Ui",
      serialNumber: "EPS001234",
      status: "available",
      location: "Room 101",
      assignedTo: "Prof. Johnson",
      createdAt: now,
      notes: "Ultra-short throw projector with interactive features"
    },
    {
      id: "eq-2", 
      name: "Laptop Cart",
      type: "Computer",
      model: "Dell Mobile Computing Cart",
      serialNumber: "DELL567890",
      status: "in-use",
      location: "Storage Room B",
      assignedTo: "IT Department",
      createdAt: now,
      notes: "Contains 20 student laptops, charging station included"
    },
    {
      id: "eq-3",
      name: "Sound System", 
      type: "Speaker",
      model: "Bose Professional",
      serialNumber: "BOSE789123",
      status: "maintenance",
      location: "Auditorium",
      assignedTo: "Audio/Visual Team",
      createdAt: now,
      lastMaintenance: now - (7 * 24 * 60 * 60 * 1000), // 7 days ago
      notes: "Annual maintenance check in progress"
    },
    {
      id: "eq-4",
      name: "Wireless Router",
      type: "Router", 
      model: "Cisco Meraki MR46",
      serialNumber: "CISCO456789",
      status: "available",
      location: "Room 205",
      createdAt: now,
      notes: "High-performance WiFi 6 access point"
    },
    {
      id: "eq-5",
      name: "Document Camera",
      type: "Camera",
      model: "ELMO PX-10",
      serialNumber: "ELMO123456", 
      status: "broken",
      location: "Room 103",
      assignedTo: "Prof. Williams",
      createdAt: now,
      notes: "Power adapter needs replacement"
    }
  ]
  g.__CLASSROOM_DB__ = {
    rooms,
    bookings,
    notifications,
    users,
    recurringBookings,
    equipment,
    broadcast,
    subscribe: (fn: (event: any) => void) => {
      subs.add(fn)
      return () => subs.delete(fn)
    },
  } as DB
}

export const db: DB = g.__CLASSROOM_DB__

export function findConflicts(roomId: string, start: number, end: number, ignoreBookingId?: string) {
  return db.bookings.filter((b) => b.roomId === roomId && b.id !== ignoreBookingId && b.status !== "cancelled" && b.status !== "rejected" && !(end <= b.start || start >= b.end))
}

export function suggestAlternatives(roomId: string, start: number, end: number, limit = 3) {
  // naive suggestion: shift in 30-min increments forward
  const duration = end - start
  const suggestions: { start: number; end: number }[] = []
  let cursor = start + 30 * 60 * 1000
  while (suggestions.length < limit && cursor < start + 6 * 60 * 60 * 1000) {
    const s = cursor
    const e = cursor + duration
    if (findConflicts(roomId, s, e).length === 0) suggestions.push({ start: s, end: e })
    cursor += 30 * 60 * 1000
  }
  return suggestions
}
