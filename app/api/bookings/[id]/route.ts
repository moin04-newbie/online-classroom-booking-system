import { db, findConflicts, suggestAlternatives } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const { id } = await params
  const idx = db.bookings.findIndex((b) => b.id === id)
  if (idx === -1) return new Response("Not found", { status: 404 })

  const next = { ...db.bookings[idx], ...data }
  if ((data.start || data.end || data.roomId) && findConflicts(next.roomId, next.start, next.end, next.id).length) {
    const alts = suggestAlternatives(next.roomId, next.start, next.end, 3)
    return Response.json({ ok: false, reason: "conflict", alternatives: alts }, { status: 409 })
  }

  db.bookings[idx] = next
  db.broadcast({ type: "booking:updated", booking: next })
  return Response.json({ ok: true, booking: next })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  const idx = db.bookings.findIndex((b) => b.id === id)
  if (idx === -1) return new Response("Not found", { status: 404 })
  const [removed] = db.bookings.splice(idx, 1)
  db.broadcast({ type: "booking:deleted", booking: removed })
  return Response.json({ ok: true })
}
