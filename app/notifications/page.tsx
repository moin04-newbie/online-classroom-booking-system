"use client"

import LayoutShell from "@/components/layout-shell"
import { useEffect, useState, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useRT } from "@/components/realtime-provider"

type Notif = { id: string; message: string; createdAt: number; read: boolean; kind: string }

export default function Page() {
  const [items, setItems] = useState<Notif[]>([])
  const { setUnread } = useRT()

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setItems(data.notifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    s.onerror = () => {
      // Reconnect logic
      setTimeout(() => s.close(), 1000)
    }
    return () => s.close()
  }, [refresh])

  const markAll = useCallback(async (read: boolean) => {
    try {
      const ids = items.map((i) => i.id)
      const response = await fetch("/api/notifications", { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ ids, read }) 
      })
      
      if (response.ok) {
        setUnread(0)
        refresh()
      }
    } catch (error) {
      console.error('Failed to mark notifications:', error)
    }
  }, [items, setUnread, refresh])

  // Memoize the notification list to prevent unnecessary re-renders
  const notificationList = useMemo(() => 
    items.map((n) => (
      <li key={n.id} className={`rounded-md border p-3 transition-opacity duration-200 ${n.read ? "opacity-60" : ""}`} role="status" aria-live="polite">
        <div className="text-sm">{n.message}</div>
        <div className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</div>
      </li>
    )), [items])

  return (
    <LayoutShell>
      <div className="mb-2 flex gap-2">
        <Button onClick={() => markAll(true)} variant="outline" className="transition-all duration-200 hover:scale-105">
          Mark all read
        </Button>
        <Button onClick={() => markAll(false)} variant="outline" className="transition-all duration-200 hover:scale-105">
          Mark all unread
        </Button>
      </div>
      <ul className="space-y-2">
        {notificationList}
      </ul>
    </LayoutShell>
  )
}
