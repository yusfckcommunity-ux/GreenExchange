"use client"

import useSWR from "swr"
import { TrendingUp, TrendingDown, Minus, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { getPortfolio } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

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
                <div
                  key={position.symbol}
                  className="p-4 rounded-lg bg-secondary/30 border border-border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        {position.symbol}
                        {position.arrow && (
                          <span
                            className={cn(
                              position.arrow === '↑' ? "text-buy" : "text-sell"
                            )}
                          >
                            {position.arrow}
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "font-mono font-semibold",
                          position.unrealized_pnl > 0
                            ? "text-buy"
                            : position.unrealized_pnl < 0
                            ? "text-sell"
                            : "text-foreground"
                        )}
                      >
                        {position.unrealized_pnl >= 0 ? '+' : ''}{formatPrice(position.unrealized_pnl)}
                      </p>
                      <p
                        className={cn(
                          "text-sm font-mono",
                          position.pnl_percent > 0
                            ? "text-buy"
                            : position.pnl_percent < 0
                            ? "text-sell"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatPercent(position.pnl_percent)}
                      </p>
                    </div>
                  </div>

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

                  {position.blocked > 0 && (
                    <div className="mt-3 pt-3 border-t border-border text-sm">
                      <span className="text-muted-foreground">Blocked: </span>
                      <span className="font-mono text-foreground">{formatPrice(position.blocked)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
