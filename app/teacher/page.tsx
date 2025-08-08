"use client"

import LayoutShell from "@/components/layout-shell"
import BookingForm from "@/components/booking-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function Page() {
  const [pending, setPending] = useState<any[]>([])
  async function refresh() {
    const b = await fetch("/api/bookings?status=pending").then((r) => r.json())
    setPending(b.bookings)
  }
  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    return () => s.close()
  }, [])

  async function decide(id: string, status: "approved" | "rejected") {
    await fetch(`/api/bookings/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) })
  }

  return (
    <LayoutShell>
      <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <BookingForm />
        <Card>
          <CardHeader><CardTitle>Student Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pending.map((p) => (
              <div key={p.id} className="rounded-md border p-2">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-muted-foreground">{new Date(p.start).toLocaleString()}</div>
                <div className="mt-2 space-x-2">
                  <button className="rounded-md px-2 py-1 text-sm" style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }} onClick={() => decide(p.id, "approved")}>Approve</button>
                  <button className="rounded-md border px-2 py-1 text-sm" onClick={() => decide(p.id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
            {pending.length === 0 && <div className="text-sm text-muted-foreground">No pending requests.</div>}
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  )
}
