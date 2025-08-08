"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

type Room = { id: string; name: string; building: string; capacity: number; equipment: string[] }
type Booking = { id: string; roomId: string; start: number; end: number; status: string; title: string }

function statusColor(status: string) {
  if (status === "approved") return "bg-green-500"
  if (status === "pending") return "bg-yellow-400"
  return "bg-red-500"
}

export default function AvailabilityCalendar() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [building, setBuilding] = useState<string>("all")
  const [capacity, setCapacity] = useState<number>(0)
  const [equipment, setEquipment] = useState<string[]>([])
  const [tab, setTab] = useState<"month" | "week" | "day">("month")
  const [date, setDate] = useState<Date>(new Date())

  const load = async () => {
    const params = new URLSearchParams()
    if (building !== "all") params.set("building", building)
    if (capacity) params.set("capacity", String(capacity))
    equipment.forEach((e) => params.append("equipment", e))
    const r = await fetch(`/api/rooms?${params.toString()}`).then((r) => r.json())
    setRooms(r.rooms)
    const start = new Date(date)
    const from = new Date(start.getFullYear(), start.getMonth(), 1).getTime()
    const to = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59).getTime()
    const b = await fetch(`/api/bookings?from=${from}&to=${to}`).then((r) => r.json())
    setBookings(b.bookings)
  }

  useEffect(() => {
    load()
    const s = new EventSource("/api/stream")
    s.onmessage = () => load()
    return () => s.close()
  }, [building, capacity, equipment, date])

  const buildings = Array.from(new Set(rooms.map((r) => r.building).filter(Boolean)))

  const daysInMonth = useMemo(() => {
    const y = date.getFullYear()
    const m = date.getMonth()
    return new Date(y, m + 1, 0).getDate()
  }, [date])

  const startOfWeek = useMemo(() => {
    const d = new Date(date)
    const day = d.getDay()
    d.setDate(d.getDate() - day)
    d.setHours(0, 0, 0, 0)
    return d
  }, [date])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Classroom Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="flex items-center gap-2">
            <button aria-label="Previous month" className="h-9 w-9 rounded-md border" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}>
              {"<"}
            </button>
            <div className="min-w-[8rem] text-center font-medium">{date.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</div>
            <button aria-label="Next month" className="h-9 w-9 rounded-md border" onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}>
              {">"}
            </button>
          </div>
          <Select value={building} onValueChange={setBuilding}>
            <SelectTrigger><SelectValue placeholder="Building" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All buildings</SelectItem>
              {buildings.filter(Boolean).map((b) => <SelectItem value={b} key={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" min={0} placeholder="Min capacity" value={capacity || ""} onChange={(e) => setCapacity(Number(e.target.value || 0))} aria-label="Minimum capacity" />
          <Select value="" onValueChange={(v) => v && setEquipment((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}>
            <SelectTrigger aria-label="Equipment filter"><SelectValue placeholder="Toggle equipment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="projector">Projector</SelectItem>
              <SelectItem value="ac">AC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="day">Day</TabsTrigger>
          </TabsList>

          <TabsContent value="month" className="space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = new Date(date.getFullYear(), date.getMonth(), i + 1)
                const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime()
                const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1
                const dayBookings = bookings.filter((b) => b.start <= dayEnd && b.end >= dayStart)
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="min-h-[100px] rounded-md border p-2">
                    <div className="mb-1 text-xs font-medium">{i + 1}</div>
                    <div className="flex flex-wrap gap-1">
                      {dayBookings.slice(0, 3).map((b) => (
                        <span key={b.id} className={`h-2 w-2 rounded-full ${statusColor(b.status)}`} aria-label={b.status}></span>
                      ))}
                      {dayBookings.length > 3 && <span className="text-[10px] text-muted-foreground">+{dayBookings.length - 3}</span>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(startOfWeek)
                d.setDate(d.getDate() + i)
                const s = d.getTime()
                const e = s + 24 * 60 * 60 * 1000 - 1
                const list = bookings.filter((b) => b.start <= e && b.end >= s)
                return (
                  <div key={i} className="rounded-md border p-2">
                    <div className="text-xs font-medium">{d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" })}</div>
                    <ul className="mt-2 space-y-1">
                      {list.slice(0, 4).map((b) => (
                        <li key={b.id} className="truncate text-xs">
                          <span className={`mr-1 inline-block h-2 w-2 rounded-full align-middle ${statusColor(b.status)}`} /> {new Date(b.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(b.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </li>
                      ))}
                      {list.length === 0 && <div className="text-xs text-muted-foreground">Free</div>}
                    </ul>
                  </div>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="day" className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((r) => {
                const s = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
                const e = s + 24 * 60 * 60 * 1000 - 1
                const list = bookings.filter((b) => b.roomId === r.id && b.start <= e && b.end >= s)
                return (
                  <Card key={r.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{r.name} • {r.building}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-24 w-full rounded-md bg-muted">
                        {list.map((b) => {
                          const startPct = ((b.start - s) / (24 * 60 * 60 * 1000)) * 100
                          const endPct = ((b.end - s) / (24 * 60 * 60 * 1000)) * 100
                          const width = Math.max(5, endPct - startPct)
                          return (
                            <div key={b.id} className={`absolute top-2 rounded-sm px-1 text-[10px] text-white ${statusColor(b.status)}`} style={{ left: `${startPct}%`, width: `${width}%` }}>
                              {b.title}
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="outline" className="border-green-500 text-green-700">Free</Badge>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-700">Pending</Badge>
                        <Badge variant="outline" className="border-red-500 text-red-700">Booked</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
