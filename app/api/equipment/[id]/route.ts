import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  
  const idx = db.equipment.findIndex((item) => item.id === id)
  if (idx === -1) return new Response("Not found", { status: 404 })

  const updated = { ...db.equipment[idx], ...data, id }
  db.equipment[idx] = updated
  db.broadcast({ type: "equipment:updated", equipment: updated })
  
  return Response.json({ ok: true, equipment: updated })
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const idx = db.equipment.findIndex((item) => item.id === id)
  if (idx === -1) return new Response("Not found", { status: 404 })
  
  const [removed] = db.equipment.splice(idx, 1)
  db.broadcast({ type: "equipment:deleted", equipment: removed })
  
  return Response.json({ ok: true })
}
