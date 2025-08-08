"use client"

import LayoutShell from "@/components/layout-shell"
import BookingForm from "@/components/booking-form"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  const [mine, setMine] = useState<any[]>([])

  async function refresh() {
    // For demo we treat all "pending" as student requests.
    const b = await fetch("/api/bookings?status=pending").then((r) => r.json())
    setMine(b.bookings)
  }

  useEffect(() => {
    refresh()
    const s = new EventSource("/api/stream")
    s.onmessage = () => refresh()
    return () => s.close()
  }, [])

  return (
    <LayoutShell>
      <div className="grid gap-3">
        <BookingForm />
        <Card>
          <CardHeader><CardTitle>My Requests</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {mine.map((m) => (
              <div key={m.id} className="rounded-md border p-2">
                <div className="font-medium">{m.title}</div>
                <div className="text-sm">{new Date(m.start).toLocaleString()}</div>
                <div className="text-xs text-muted-foreground capitalize">Status: {m.status}</div>
              </div>
            ))}
            {mine.length === 0 && <div className="text-sm text-muted-foreground">You have no active requests.</div>}
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  )
}
