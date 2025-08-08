import { db, suggestAlternatives } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const building = searchParams.get("building") || undefined
  const capacity = Number(searchParams.get("capacity") || 0)
  const equipment = searchParams.getAll("equipment")

  let rooms = db.rooms
  if (building) rooms = rooms.filter((r) => r.building === building)
  if (capacity) rooms = rooms.filter((r) => r.capacity >= capacity)
  if (equipment.length) rooms = rooms.filter((r) => equipment.every((e) => r.equipment.includes(e)))
  return Response.json({ rooms })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const id = data.id || `r-${Math.random().toString(36).slice(2, 8)}`
  const room = {
    id,
    name: data.name,
    building: data.building,
    capacity: Number(data.capacity || 0),
    equipment: Array.isArray(data.equipment) ? data.equipment : [],
    createdAt: Date.now(),
  }
  db.rooms.push(room)
  db.broadcast({ type: "room:created", room })
  return Response.json({ room })
}
