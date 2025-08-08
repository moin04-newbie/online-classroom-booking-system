import { db, findConflicts } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = Number(searchParams.get("from") || 0)
  const to = Number(searchParams.get("to") || 0)
  const status = searchParams.get("status") || undefined
  const roomId = searchParams.get("roomId") || undefined
  const q = searchParams.get("q")?.toLowerCase()

  let bookings = db.bookings
  if (from) bookings = bookings.filter((b) => b.end >= from)
  if (to) bookings = bookings.filter((b) => b.start <= to)
  if (status) bookings = bookings.filter((b) => b.status === status)
  if (roomId) bookings = bookings.filter((b) => b.roomId === roomId)
  if (q) bookings = bookings.filter((b) => b.title.toLowerCase().includes(q) || b.requester.toLowerCase().includes(q))
  return Response.json({ bookings })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const id = `b-${Math.random().toString(36).slice(2, 8)}`
  const start = Number(data.start)
  const end = Number(data.end)
  const conflicts = findConflicts(data.roomId, start, end)
  if (conflicts.length) {
    return Response.json({ ok: false, reason: "conflict", conflicts }, { status: 409 })
  }
  const booking = {
    id,
    roomId: data.roomId,
    title: data.title || "Classroom Booking",
    purpose: data.purpose || "",
    requester: data.requester || "Anonymous",
    role: data.role || "student",
    start,
    end,
    status: data.status || "pending",
    createdAt: Date.now(),
    notes: data.notes || "",
  }
  db.bookings.push(booking)
  const notif = { id: `n-${Math.random().toString(36).slice(2, 8)}`, message: `New booking ${booking.title}`, createdAt: Date.now(), read: false, kind: "confirmation" as const }
  db.notifications.unshift(notif)
  db.broadcast({ type: "booking:created", booking })
  db.broadcast({ type: "notification", notification: notif })
  return Response.json({ ok: true, booking })
}
