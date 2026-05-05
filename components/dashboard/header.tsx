"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Leaf, LogOut, Wallet, User, Settings, ChevronDown } from "lucide-react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/auth-store"
import { getAccount, getUserProfile } from "@/lib/api"
import { InboxButton } from "./inbox"

export function DashboardHeader() {
  const router = useRouter()
  const { userId, logout } = useAuthStore()

  const { data: account } = useSWR(
    userId ? ['account', userId] : null,
    () => getAccount(userId!),
    { refreshInterval: 5000 }
  )

  const { data: profileData } = useSWR(
    userId ? ['profile', userId] : null,
    () => getUserProfile(userId!)
  )
  
  const profile = profileData?.data

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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden relative">
                {profile?.avatar_url ? (
                  <Image 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground">
                {profile?.full_name || profile?.username || "User"}
              </span>
              <ChevronDown className="h-4 w-4 hidden md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{profile?.email || `@${profile?.username}`}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
