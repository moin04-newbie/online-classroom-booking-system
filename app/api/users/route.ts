import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET() {
  return Response.json({ users: db.users || [] })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const user = {
    id: `user-${Date.now()}`,
    ...data,
    createdAt: Date.now(),
    lastActive: Date.now(),
    status: 'active'
  }
  
  if (!db.users) db.users = []
  db.users.push(user)
  db.broadcast({ type: "user:created", user })
  
  return Response.json({ user }, { status: 201 })
}
