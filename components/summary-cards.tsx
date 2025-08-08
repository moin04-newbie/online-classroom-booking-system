"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function SummaryCards() {
  const [stats, setStats] = useState({ totalRooms: 0, availableRooms: 0, today: 0, upcoming: 0 })

  async function refresh() {
    const rooms = (await fetch("/api/rooms").then((r) => r.json())).rooms as any[]
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1
    const bookings = (await fetch(`/api/bookings?from=${startOfDay}&to=${endOfDay}`).then((r) => r.json())).bookings as any[]
    const allBookings = (await fetch(`/api/bookings`).then((r) => r.json())).bookings as any[]
    const bookedRoomIds = new Set(allBookings.filter((b: any) => b.status !== "cancelled" && b.status !== "rejected" && b.start <= endOfDay && b.end >= startOfDay).map((b: any) => b.roomId))
    setStats({
      totalRooms: rooms.length,
      availableRooms: rooms.filter((r) => !bookedRoomIds.has(r.id)).length,
      today: bookings.length,
      upcoming: allBookings.filter((b: any) => b.start > now.getTime()).length,
    })
  }

  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    return () => s.close()
  }, [])

  const items = [
    { label: "Total Rooms", value: stats.totalRooms },
    { label: "Available Rooms", value: stats.availableRooms },
    { label: "Bookings Today", value: stats.today },
    { label: "Upcoming Bookings", value: stats.upcoming },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((it, i) => (
        <motion.div key={it.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{it.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{it.value}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
