"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Booking = { id: string; roomId: string; title: string; start: number; end: number; status: string }
type Room = { id: string; name: string }

export default function BookingTable() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<string>("all")
  const [roomId, setRoomId] = useState<string>("all")

  const refresh = async () => {
    const rs = await fetch("/api/rooms").then((r) => r.json())
    setRooms(rs.rooms)
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (status !== "all") params.set("status", status)
    if (roomId !== "all") params.set("roomId", roomId)
    const bs = await fetch(`/api/bookings?${params.toString()}`).then((r) => r.json())
    setBookings(bs.bookings)
  }

  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    return () => s.close()
  }, [q, status, roomId])

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={roomId} onValueChange={setRoomId}>
          <SelectTrigger><SelectValue placeholder="Room" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rooms</SelectItem>
            {rooms.filter(r => r.name && r.name.trim()).map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <Row key={b.id} booking={b} rooms={rooms} onChange={refresh} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function Row({ booking, rooms, onChange }: { booking: Booking; rooms: Room[]; onChange: () => void }) {
  const roomName = rooms.find((r) => r.id === booking.roomId)?.name || booking.roomId
  return (
    <TableRow>
      <TableCell>{roomName}</TableCell>
      <TableCell>{new Date(booking.start).toLocaleDateString()}</TableCell>
      <TableCell>{new Date(booking.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - {new Date(booking.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
      <TableCell className="capitalize">{booking.status}</TableCell>
      <TableCell>
        <EditBooking booking={booking} rooms={rooms} onChange={onChange} />
      </TableCell>
    </TableRow>
  )
}

function EditBooking({ booking, rooms, onChange }: { booking: Booking; rooms: Room[]; onChange: () => void }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState(booking.status)
  const [roomId, setRoomId] = useState(booking.roomId)

  async function save() {
    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, roomId }),
    })
    if (res.status === 409) {
      const data = await res.json()
      alert(`Conflict. Alternatives:\n${data.alternatives.map((a: any) => `${new Date(a.start).toLocaleTimeString()} - ${new Date(a.end).toLocaleTimeString()}`).join("\n")}`)
      return
    }
    setOpen(false)
    onChange()
  }

  async function cancelBooking() {
    await fetch(`/api/bookings/${booking.id}`, { method: "DELETE" })
    setOpen(false)
    onChange()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Edit</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger><SelectValue placeholder="Room" /></SelectTrigger>
            <SelectContent>
              {rooms.filter(r => r.name && r.name.trim()).map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="justify-between">
          <Button variant="destructive" onClick={cancelBooking}>Cancel Booking</Button>
          <Button onClick={save} style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
