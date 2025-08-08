import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET() {
  try {
    return Response.json(db.equipment || [])
  } catch (error) {
    console.error('Equipment GET error:', error)
    return Response.json([], { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const equipment = {
      id: `eq-${Date.now()}`,
      ...data,
      createdAt: Date.now()
    }
    
    if (!db.equipment) db.equipment = []
    db.equipment.push(equipment)
    db.broadcast({ type: "equipment:created", equipment })
    
    return Response.json(equipment, { status: 201 })
  } catch (error) {
    console.error('Equipment POST error:', error)
    return Response.json({ error: 'Failed to create equipment' }, { status: 500 })
  }
}
