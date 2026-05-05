"use client"

import { useRouter } from "next/navigation"
import { Leaf, LogOut, Wallet } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { getAccount } from "@/lib/api"
import { InboxButton } from "./inbox"

export function DashboardHeader() {
  const router = useRouter()
  const { userId, logout } = useAuthStore()

  const { data: account } = useSWR(
    userId ? ['account', userId] : null,
    () => getAccount(userId!),
    { refreshInterval: 5000 }
  )

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "..."
    return new Intl.NumberFormat('id-ID').format(value)
  }

  return (
    <header className="h-16 border-b border-border bg-card px-4 lg:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Leaf className="h-6 w-6 text-primary" />
        </div>
        <span className="font-bold text-lg hidden sm:block text-foreground">GreenExchange</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <div className="hidden sm:block">
              <p className="text-muted-foreground text-xs">Cash Balance</p>
              <p className="font-mono font-semibold text-foreground">{formatCurrency(account?.cash_balance)}</p>
            </div>
            <div className="sm:hidden">
              <p className="font-mono font-semibold text-foreground">{formatCurrency(account?.cash_balance)}</p>
            </div>
          </div>
          {account?.blocked_balance !== undefined && account.blocked_balance > 0 && (
            <div className="hidden md:block">
              <p className="text-muted-foreground text-xs">Blocked</p>
              <p className="font-mono text-muted-foreground">{formatCurrency(account.blocked_balance)}</p>
            </div>
          )}
        </div>

        <InboxButton />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </header>
  )
}
