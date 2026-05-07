"use client"

import useSWR from "swr"
import Image from "next/image"
import { TrendingUp, TrendingDown, Minus, Briefcase, Award, Leaf, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { getPortfolio, getSymbolInfo } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"
import type { Position } from "@/lib/api"

// Position Card Component with symbol info
function PositionCard({ 
  position, 
  formatPrice, 
  formatPercent 
}: { 
  position: Position
  formatPrice: (value: number) => string
  formatPercent: (value: number) => string
}) {
  const { data: symbolInfo } = useSWR(
    ['symbolInfo', position.symbol],
    () => getSymbolInfo(position.symbol)
  )
  
  const info = symbolInfo?.data
  
  // Calculate actual credit owned
  const actualCredit = (position.total_owned || 0) * (info?.credit_per_qty || 0)
  const availableCredit = (position.available || 0) * (info?.credit_per_qty || 0)

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
      {/* Header with Logo, Symbol, Company */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border flex-shrink-0">
            {info?.logo_url ? (
              <Image
                src={info.logo_url}
                alt={info.name}
                width={48}
                height={48}
                className="object-cover w-full h-full"
              />
            ) : info?.class === 'REC' ? (
              <Zap className="h-6 w-6 text-primary" />
            ) : (
              <Leaf className="h-6 w-6 text-primary" />
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              {position.symbol}
              {position.arrow && (
                <span className={cn(position.arrow === '↑' ? "text-buy" : "text-sell")}>
                  {position.arrow}
                </span>
              )}
            </h3>
            {info && (
              <>
                <p className="text-sm text-muted-foreground">{info.issuer || info.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs py-0">
                    <Award className="h-3 w-3 mr-1" />
                    {info.certification}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* P&L */}
        <div className="text-right">
          <p className={cn(
            "font-mono font-semibold",
            position.unrealized_pnl > 0 ? "text-buy" : position.unrealized_pnl < 0 ? "text-sell" : "text-foreground"
          )}>
            {position.unrealized_pnl >= 0 ? '+' : ''}{formatPrice(position.unrealized_pnl)}
          </p>
          <p className={cn(
            "text-sm font-mono",
            position.pnl_percent > 0 ? "text-buy" : position.pnl_percent < 0 ? "text-sell" : "text-muted-foreground"
          )}>
            {formatPercent(position.pnl_percent)}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Total Owned</p>
          <p className="font-mono font-semibold text-foreground">
            {formatPrice(position.total_owned)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Available</p>
          <p className="font-mono text-foreground">
            {formatPrice(position.available)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Avg Price</p>
          <p className="font-mono text-foreground">
            {formatPrice(position.avg_price)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Market Price</p>
          <p className="font-mono text-foreground">
            {formatPrice(position.market_price)}
          </p>
        </div>
      </div>

      {/* Actual Credit Section */}
      {info && (
        <div className="mt-4 pt-3 border-t border-border">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-primary/5 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">Total Credit</p>
              <p className="font-mono font-semibold text-primary">
                {formatPrice(actualCredit)} <span className="text-xs font-normal">{info.credit_unit}</span>
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2">
              <p className="text-muted-foreground text-xs">Available Credit</p>
              <p className="font-mono text-foreground">
                {formatPrice(availableCredit)} <span className="text-xs font-normal">{info.credit_unit}</span>
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2 hidden md:block">
              <p className="text-muted-foreground text-xs">Credit per Qty</p>
              <p className="font-mono text-foreground">
                {info.credit_per_qty} <span className="text-xs font-normal">{info.credit_unit}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {position.blocked > 0 && (
        <div className="mt-3 pt-3 border-t border-border text-sm">
          <span className="text-muted-foreground">Blocked: </span>
          <span className="font-mono text-foreground">{formatPrice(position.blocked)}</span>
        </div>
      )}
    </div>
  )
}

export default function PortfolioPage() {
  const userId = useAuthStore((state) => state.userId)

  const { data: portfolio, isLoading } = useSWR(
    userId ? ['portfolio', userId] : null,
    () => getPortfolio(userId!),
    { refreshInterval: 5000 }
  )

  const positions = portfolio?.data || []
  const totalPnL = positions.reduce((sum, p) => sum + p.unrealized_pnl, 0)

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Summary Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Portfolio Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "p-3 rounded-lg",
                totalPnL >= 0 ? "bg-buy/10" : "bg-sell/10"
              )}
            >
              {totalPnL > 0 ? (
                <TrendingUp className="h-6 w-6 text-buy" />
              ) : totalPnL < 0 ? (
                <TrendingDown className="h-6 w-6 text-sell" />
              ) : (
                <Minus className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Unrealized P&L</p>
              <p
                className={cn(
                  "text-2xl font-bold font-mono",
                  totalPnL > 0 ? "text-buy" : totalPnL < 0 ? "text-sell" : "text-foreground"
                )}
              >
                {totalPnL >= 0 ? '+' : ''}{formatPrice(totalPnL)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Positions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : positions.length === 0 ? (
            <Empty
              icon={<Briefcase className="h-12 w-12" />}
              title="No holdings yet"
              description="Start trading to build your portfolio"
            />
          ) : (
            <div className="space-y-4">
              {positions.map((position) => (
                <PositionCard key={position.symbol} position={position} formatPrice={formatPrice} formatPercent={formatPercent} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
