"use client"

import LayoutShell from "@/components/layout-shell"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function sendSupport(e: any) {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const form = new FormData(e.currentTarget)
      const message = String(form.get("message") || "")
      if (message.trim().length === 0) return
      
      const response = await fetch("/api/notifications", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ message: `Support: ${message}`, kind: "system" }) 
      })
      
      if (response.ok) {
        e.currentTarget.reset()
        alert("Support request sent successfully!")
      } else {
        alert("Failed to send support request. Please try again.")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LayoutShell>
      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>FAQ</CardTitle></CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="1">
                <AccordionTrigger>How do I book a classroom?</AccordionTrigger>
                <AccordionContent>Visit Book a Room, select date and time, pick an available room, then confirm.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger>How are conflicts handled?</AccordionTrigger>
                <AccordionContent>The system checks overlapping bookings and suggests alternative slots.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="3">
                <AccordionTrigger>How do I get real-time updates?</AccordionTrigger>
                <AccordionContent>Notifications stream live via a secure event channel.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Contact Support</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={sendSupport} className="space-y-2">
              <Input name="email" type="email" placeholder="Your email" aria-label="Email" required />
              <Textarea name="message" placeholder="Describe your issue" aria-label="Message" required />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: "#4FD1C5", color: "#001F3F" }}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  )
}
