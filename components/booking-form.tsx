"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useRT } from "./realtime-provider"
import { useRouter } from "next/navigation"

type Room = { id: string; name: string; building: string; capacity: number; equipment: string[] }

export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [date, setDate] = useState<string>("")
  const [startTime, setStartTime] = useState<string>("10:00")
  const [endTime, setEndTime] = useState<string>("11:00")
  const [rooms, setRooms] = useState<Room[]>([])
  const [roomId, setRoomId] = useState<string>("")
  const [title, setTitle] = useState("Classroom Booking")
  const [purpose, setPurpose] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { role } = useRT()
  const router = useRouter()

  const start = useMemo(() => {
    if (!date) return 0
    const [h, m] = startTime.split(":").map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d.getTime()
  }, [date, startTime])

  const end = useMemo(() => {
    if (!date) return 0
    const [h, m] = endTime.split(":").map(Number)
    const d = new Date(date)
    d.setHours(h, m, 0, 0)
    return d.getTime()
  }, [date, endTime])

  useEffect(() => {
    fetch("/api/rooms").then((r) => r.json()).then((d) => setRooms(d.rooms))
  }, [])

  async function submit() {
    setSubmitting(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          title,
          purpose,
          requester: "Guest",
          role,
          start,
          end,
          status: role === "student" ? "pending" : "approved",
          notes,
        }),
      })
      if (res.status === 409) {
        const data = await res.json()
        alert(`Conflict detected. Try another time slot.\nConflicts: ${data.conflicts.length}`)
        setStep(1)
      } else {
        router.push("/bookings")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const preview = (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div><b>Title:</b> {title || "—"}</div>
        <div><b>Date:</b> {date ? new Date(date).toDateString() : "—"}</div>
        <div><b>Time:</b> {start && end ? `${new Date(start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "—"}</div>
        <div><b>Room:</b> {roomId || "—"}</div>
        <div><b>Purpose:</b> {purpose || "—"}</div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Book a Classroom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-2">
            {[1, 2, 3].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full text-center leading-8 ${step >= s ? "text-white" : ""}`} style={{ backgroundColor: step >= s ? "#4FD1C5" : "#E5E7EB", color: step >= s ? "#001F3F" : "#111827" }}>
                  {s}
                </div>
                {i < 2 && <div className="h-px w-8 bg-muted" aria-hidden />}
              </div>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <Input aria-label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <Input aria-label="Start time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  <Input aria-label="End time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button disabled={!date || !start || !end || end <= start} onClick={() => setStep(2)} style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}>
                    Next
                  </Button>
                </div>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger aria-label="Select room"><SelectValue placeholder="Choose a room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.filter(r => r.name && r.name.trim() && r.id && r.id.trim()).map((r) => (
                      <SelectItem value={r.id} key={r.id}>{r.name} — {r.building} ({r.capacity})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                  <Button disabled={!roomId} onClick={() => setStep(3)} style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}>
                    Next
                  </Button>
                </div>
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">
                <Input aria-label="Booking title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Booking title" />
                <Textarea aria-label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Purpose & special requests" />
                <Textarea aria-label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                  <Button disabled={submitting} onClick={submit} style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}>
                    {submitting ? "Submitting..." : "Confirm booking"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      {preview}
    </div>
  )
}
