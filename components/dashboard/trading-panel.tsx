"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderBook } from "@/components/dashboard/order-book"
import { TradeForm } from "@/components/dashboard/trade-form"
import { PriceChart } from "@/components/dashboard/price-chart"
import { SymbolInfoButton } from "@/components/dashboard/symbol-info-preview"
import { getOrderBook, getTradeContext, type Symbol } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"

interface TradingPanelProps {
  symbol: Symbol
}

export function TradingPanel({ symbol }: TradingPanelProps) {
  const userId = useAuthStore((state) => state.userId)
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy")

  const { data: orderBook, mutate: mutateOrderBook } = useSWR(
    ["orderbook", symbol.symbol],
    () => getOrderBook(symbol.symbol),
    { refreshInterval: 3000 }
  )

  const { data: tradeContext, mutate: mutateContext } = useSWR(
    userId ? ["tradeContext", userId, symbol.symbol] : null,
    () => getTradeContext(userId!, symbol.symbol),
    { refreshInterval: 5000 }
  )

  const handleOrderPlaced = () => {
    mutateOrderBook()
    mutateContext()
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6 h-full">
      <div className="space-y-4 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              {symbol.symbol}
            </h2>
            <SymbolInfoButton symbol={symbol.symbol} />
          </div>
          <span className="text-sm text-muted-foreground">{symbol.name}</span>
        </div>

        <PriceChart symbol={symbol.symbol} />

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">
              Order Book
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderBook
              buyOrders={orderBook?.buy || []}
              sellOrders={orderBook?.sell || []}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">Place Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "buy" | "sell")}
          >
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger
                value="buy"
                className="data-[state=active]:bg-buy data-[state=active]:text-buy-foreground"
              >
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="data-[state=active]:bg-sell data-[state=active]:text-sell-foreground"
              >
                Sell
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="mt-4">
              <TradeForm
                symbol={symbol}
                side="buy"
                tradeContext={tradeContext}
                onOrderPlaced={handleOrderPlaced}
              />
            </TabsContent>

            <TabsContent value="sell" className="mt-4">
              <TradeForm
                symbol={symbol}
                side="sell"
                tradeContext={tradeContext}
                onOrderPlaced={handleOrderPlaced}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}