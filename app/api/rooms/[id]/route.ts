import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const { id } = await params
  const idx = db.rooms.findIndex((r) => r.id === id)
  if (idx === -1) return new Response("Not found", { status: 404 })
  db.rooms[idx] = { ...db.rooms[idx], ...data }
  db.broadcast({ type: "room:updated", room: db.rooms[idx] })
  return Response.json({ room: db.rooms[idx] })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  const idx = db.rooms.findIndex((r) => r.id === id)
  if (idx === -1) return new Response("Not found", { status: 404 })
  const [removed] = db.rooms.splice(idx, 1)
  db.broadcast({ type: "room:deleted", room: removed })
  return Response.json({ ok: true })
}
