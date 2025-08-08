"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Notif = { id: string; message: string; createdAt: number; read: boolean; kind: string }

export default function NotificationPanel() {
  const [items, setItems] = useState<Notif[]>([])
  const refresh = async () => {
    const res = await fetch("/api/notifications")
    const data = await res.json()
    setItems(data.notifications.slice(0, 5))
  }

  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    return () => s.close()
  }, [])

  return (
    <Card aria-live="polite">
      <CardHeader>
        <CardTitle>Urgent updates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && <div className="text-sm text-muted-foreground">No notifications.</div>}
        {items.map((n) => (
          <div key={n.id} className="rounded-md border px-3 py-2">
            <div className="text-sm">{n.message}</div>
            <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
