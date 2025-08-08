import { db } from "@/lib/store"
import { type NextRequest } from "next/server"

export async function GET() {
  return Response.json({ notifications: db.notifications })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const notif = {
    id: `n-${Math.random().toString(36).slice(2, 8)}`,
    message: data.message || "System update",
    createdAt: Date.now(),
    read: false,
    kind: data.kind || "system",
  }
  db.notifications.unshift(notif)
  db.broadcast({ type: "notification", notification: notif })
  return Response.json({ notification: notif })
}

export async function PATCH(req: NextRequest) {
  const data = await req.json()
  const ids: string[] = data.ids || []
  db.notifications.forEach((n) => {
    if (ids.includes(n.id)) n.read = data.read ?? true
  })
  return Response.json({ ok: true })
}
