"use client"

import LayoutShell from "@/components/layout-shell"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Room = { id: string; name: string; building: string; capacity: number; equipment: string[] }
type Booking = { id: string; title: string; roomId: string; start: number; end: number; status: string }

export default function Page() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [form, setForm] = useState({ name: "", building: "", capacity: 30, equipment: [] as string[] })
  const [pendings, setPendings] = useState<Booking[]>([])

  async function refresh() {
    const r = await fetch("/api/rooms").then((r) => r.json())
    setRooms(r.rooms)
    const b = await fetch("/api/bookings?status=pending").then((r) => r.json())
    setPendings(b.bookings)
  }
  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    return () => s.close()
  }, [])

  async function addRoom() {
    await fetch("/api/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setForm({ name: "", building: "", capacity: 30, equipment: [] })
  }

  async function decide(id: string, status: "approved" | "rejected") {
    await fetch(`/api/bookings/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
  }

  return (
    <LayoutShell>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Add / Edit Rooms</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Room name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <Input placeholder="Building" value={form.building} onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))} />
              <Input type="number" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} />
              <Select onValueChange={(v) => setForm((f) => ({ ...f, equipment: f.equipment.includes(v) ? f.equipment : [...f.equipment, v] }))}>
                <SelectTrigger><SelectValue placeholder="Add equipment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Projector">Projector</SelectItem>
                  <SelectItem value="AC">AC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {form.equipment.map((e) => (
                <span key={e} className="rounded-md border px-2 py-1">{e}</span>
              ))}
            </div>
            <Button onClick={addRoom} style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}>Save Room</Button>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Equipment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.building}</TableCell>
                      <TableCell>{r.capacity}</TableCell>
                      <TableCell>{r.equipment.join(", ")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Approve / Reject Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendings.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.title}</TableCell>
                      <TableCell>{new Date(p.start).toLocaleString()}</TableCell>
                      <TableCell className="space-x-2">
                        <Button size="sm" onClick={() => decide(p.id, "approved")} style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => decide(p.id, "rejected")}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendings.length === 0 && <TableRow><TableCell colSpan={3}>No pending requests.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  )
}
