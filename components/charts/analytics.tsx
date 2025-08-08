"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

export default function AnalyticsCharts() {
  const [monthly, setMonthly] = useState<{ month: string; utilization: number }[]>([])
  const [times, setTimes] = useState<{ slot: string; count: number }[]>([])
  const [building, setBuilding] = useState<{ name: string; usage: number }[]>([])

  useEffect(() => {
    // derive simple analytics from bookings
    fetch("/api/bookings").then((r) => r.json()).then((d) => {
      const bs = d.bookings as any[]
      const byMonth: Record<string, number> = {}
      const bySlot: Record<string, number> = {}
      const byBuilding: Record<string, number> = {}
      fetch("/api/rooms").then((r) => r.json()).then((rr) => {
        const rooms = rr.rooms as any[]
        const getBuilding = (roomId: string) => rooms.find((x) => x.id === roomId)?.building || "Other"
        for (const b of bs) {
          const m = new Date(b.start).toLocaleString(undefined, { month: "short" })
          byMonth[m] = (byMonth[m] || 0) + 1
          const h = new Date(b.start).getHours()
          const slot = `${String(h).padStart(2, "0")}:00`
          bySlot[slot] = (bySlot[slot] || 0) + 1
          const bb = getBuilding(b.roomId)
          byBuilding[bb] = (byBuilding[bb] || 0) + 1
        }
        setMonthly(Object.entries(byMonth).map(([month, utilization]) => ({ month, utilization })))
        setTimes(Object.entries(bySlot).map(([slot, count]) => ({ slot, count })))
        setBuilding(Object.entries(byBuilding).map(([name, usage]) => ({ name, usage })))
      })
    })
  }, [])

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Room Utilization per Month</CardTitle></CardHeader>
        <CardContent className="h-[320px]">
          <ChartContainer
            config={{ utilization: { label: "Utilization", color: "hsl(var(--chart-1))" } }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line dataKey="utilization" stroke="var(--color-utilization)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Popular Time Slots</CardTitle></CardHeader>
        <CardContent className="h-[320px]">
          <ChartContainer
            config={{ count: { label: "Bookings", color: "hsl(var(--chart-2))" } }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={times}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="slot" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Building Comparison</CardTitle></CardHeader>
        <CardContent className="h-[320px]">
          <ChartContainer
            config={{ usage: { label: "Usage", color: "hsl(var(--chart-3))" } }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={building}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usage" fill="var(--color-usage)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
