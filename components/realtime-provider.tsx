"use client"

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react"

type Role = "student" | "teacher" | "admin"

type RTContext = {
  role: Role
  setRole: (r: Role) => void
  unread: number
  setUnread: (n: number) => void
  lastEvent?: any
}
const Ctx = createContext<RTContext | null>(null)

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("student")
  const [unread, setUnread] = useState(0)
  const [lastEvent, setLastEvent] = useState<any>()

  // Optimize setUnread to use callback
  const handleSetUnread = useCallback((n: number) => {
    setUnread(n)
  }, [])

  useEffect(() => {
    const ev = new EventSource("/api/stream")
    
    ev.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        setLastEvent(data)
        if (data.type === "notification") {
          setUnread((u) => u + 1)
        }
      } catch {
        // Silent fail for invalid JSON
      }
    }
    
    ev.onerror = () => {
      // Attempt auto-reconnect with exponential backoff
      setTimeout(() => {
        ev.close()
      }, 1000)
    }
    
    return () => {
      ev.close()
    }
  }, [])

  // Memoize value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    role, 
    setRole, 
    unread, 
    setUnread: handleSetUnread, 
    lastEvent 
  }), [role, unread, lastEvent, handleSetUnread])
  
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRT() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useRT must be used within RealTimeProvider")
  return v
}
