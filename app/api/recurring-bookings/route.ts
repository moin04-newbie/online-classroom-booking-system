import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET() {
  return Response.json({ recurringBookings: db.recurringBookings || [] })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const recurring = {
    id: `recurring-${Date.now()}`,
    ...data,
    createdAt: Date.now()
  }
  
  if (!db.recurringBookings) db.recurringBookings = []
  db.recurringBookings.push(recurring)
  
  // Generate individual bookings based on recurrence pattern
  const bookings = generateRecurringBookings(recurring)
  bookings.forEach(booking => db.bookings.push(booking))
  
  db.broadcast({ type: "recurring:created", recurring, bookings })
  
  return Response.json({ recurring, generatedBookings: bookings.length }, { status: 201 })
}

function generateRecurringBookings(recurring: any) {
  const bookings = []
  const { pattern, startDate, endDate, roomId, title, requester, role, duration } = recurring
  
  let currentDate = new Date(startDate)
  const endDateObj = new Date(endDate)
  
  while (currentDate <= endDateObj) {
    const start = currentDate.getTime()
    const end = start + (duration * 60 * 1000) // duration in minutes
    
    const booking = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      title: `${title} (Recurring)`,
      requester,
      role,
      start,
      end,
      status: (role === "student" ? "pending" : "approved") as "pending" | "approved",
      createdAt: Date.now(),
      notes: `Generated from recurring booking ${recurring.id}`
    }
    
    bookings.push(booking)
    
    // Increment date based on pattern
    switch (pattern) {
      case "daily":
        currentDate.setDate(currentDate.getDate() + 1)
        break
      case "weekly":
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case "monthly":
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
    }
  }
  
  return bookings
}
