"use client"

import { useMemo } from "react"
import useSWR from "swr"
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getLastPrice, type PricePoint } from "@/lib/api"
import { cn } from "@/lib/utils"

interface PriceChartProps {
  symbol: string
}

export function PriceChart({ symbol }: PriceChartProps) {
  const { data, isLoading, error } = useSWR(
    ["lastPrice", symbol],
    () => getLastPrice(symbol),
    { refreshInterval: 5000 }
  )

  const prices = data?.prices || []

  const chartData = useMemo(() => {
    return prices
      .map((p: PricePoint, index: number) => ({
        index,
        price: Number(p.price),
        rawTime: p.time,
        time: new Date(p.time).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }))
      .filter((p) => Number.isFinite(p.price))
      .map((p, i, arr) => {
        const prev = i === 0 ? p.price : arr[i - 1].price
        const delta = p.price - prev
        return {
          ...p,
          delta,
        }
      })
  }, [prices])

  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        current: 0,
        change: 0,
        changePercent: 0,
        trend: "neutral" as const,
      }
    }

    const current = chartData[chartData.length - 1]?.price ?? 0
    const first = chartData[0]?.price ?? current
    const change = current - first
    const changePercent = first > 0 ? (change / first) * 100 : 0

    let trend: "up" | "down" | "neutral" = "neutral"
    if (change > 0) trend = "up"
    else if (change < 0) trend = "down"

    return { current, change, changePercent, trend }
  }, [chartData])

  const gradientId = useMemo(
    () => `gradient-${symbol.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [symbol]
  )

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID").format(price)

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${new Intl.NumberFormat("id-ID").format(change)}`
  }

  const high = chartData.length ? Math.max(...chartData.map((p) => p.price)) : 0
  const low = chartData.length ? Math.min(...chartData.map((p) => p.price)) : 0

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const TrendIcon =
    stats.trend === "up"
      ? TrendingUp
      : stats.trend === "down"
      ? TrendingDown
      : Minus

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Last Price
            </p>
            <p className="text-2xl font-bold font-mono text-foreground">
              {formatPrice(stats.current)}
            </p>
          </div>

          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium",
              stats.trend === "up" && "bg-buy/10 text-buy",
              stats.trend === "down" && "bg-sell/10 text-sell",
              stats.trend === "neutral" && "bg-muted text-muted-foreground"
            )}
          >
            <TrendIcon className="h-4 w-4" />
            <span>{formatChange(stats.change)}</span>
            <span className="text-xs opacity-80">
              ({stats.changePercent >= 0 ? "+" : ""}
              {stats.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>

        {chartData.length > 1 ? (
          <div className="w-full h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={stats.trend === "down" ? "#ef4444" : "#22c55e"}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor={stats.trend === "down" ? "#ef4444" : "#22c55e"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="opacity-20"
                />

                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                  minTickGap={24}
                />

                <YAxis
                  hide
                  domain={([min, max]: [number, number]) =>
                    min === max
                      ? [min * 0.99, max * 1.01]
                      : [min * 0.995, max * 1.005]
                  }
                />

                <Tooltip
                  cursor={{ strokeOpacity: 0.15 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null

                    const point = payload[0].payload

                    return (
                      <div className="rounded-lg border border-border bg-background/95 px-3 py-2 shadow-md backdrop-blur">
                        <div className="text-xs text-muted-foreground mb-1">
                          {point.time}
                        </div>
                        <div className="text-sm font-semibold font-mono text-foreground">
                          {formatPrice(point.price)}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-medium",
                            point.delta > 0 && "text-buy",
                            point.delta < 0 && "text-sell",
                            point.delta === 0 && "text-muted-foreground"
                          )}
                        >
                          Δ {formatChange(point.delta)}
                        </div>
                      </div>
                    )
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={stats.trend === "down" ? "#ef4444" : "#22c55e"}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  isAnimationActive={false}
                  dot={{ r: 2, fill: stats.trend === "down" ? "#ef4444" : "#22c55e" }}
                  activeDot={{ r: 4, fill: stats.trend === "down" ? "#ef4444" : "#22c55e" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[140px] flex items-center justify-center text-muted-foreground text-sm">
            {error
              ? "Failed to load price data"
              : data && !data.success
              ? "Endpoint not available"
              : "No price history available"}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
          <div>
            <span className="opacity-70">High: </span>
            <span className="font-mono text-foreground">{formatPrice(high)}</span>
          </div>
          <div>
            <span className="opacity-70">Low: </span>
            <span className="font-mono text-foreground">{formatPrice(low)}</span>
          </div>
          <div>
            <span className="opacity-70">Trades: </span>
            <span className="font-mono text-foreground">{chartData.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}