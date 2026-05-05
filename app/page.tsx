"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Leaf } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 rounded-lg bg-primary/10 animate-pulse">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">GreenExchange</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  )
}
