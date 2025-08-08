import { db } from "@/lib/store"

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      let isActive = true
      
      const send = (event: any) => {
        if (!isActive) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
        } catch (error) {
          // Controller is closed, mark as inactive
          isActive = false
        }
      }
      
      // Faster heartbeat for better responsiveness - 10 seconds instead of 25
      const heartbeat = setInterval(() => {
        if (!isActive) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "heartbeat", t: Date.now() })}\n\n`))
        } catch (error) {
          // Controller is closed, mark as inactive and clear interval
          isActive = false
          clearInterval(heartbeat)
        }
      }, 10000) // Reduced from 25000ms to 10000ms for faster updates
      
      const unsub = db.subscribe(send)
      
      // initial hello
      send({ type: "connected", t: Date.now() })
      
      // cleanup function
      const cleanup = () => {
        isActive = false
        unsub()
        clearInterval(heartbeat)
      }
      
      // Store cleanup function for cancel
      ;(controller as any)._cleanup = cleanup
    },
    cancel() {
      ;(this as any)._cleanup?.()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Add performance headers
      "X-Accel-Buffering": "no", // Disable nginx buffering
    },
  })
}
