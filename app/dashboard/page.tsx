"use client"

import { useState } from "react"
import useSWR from "swr"
import { getMarket, type Symbol } from "@/lib/api"
import { MarketList } from "@/components/dashboard/market-list"
import { TradingPanel } from "@/components/dashboard/trading-panel"

export default function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<Symbol | null>(null)

  const { data: market, isLoading, error } = useSWR(
    'market',
    () => getMarket(),
    { refreshInterval: 5000 }
  )

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full pb-20 lg:pb-0">
      {/* Market List */}
      <div className="lg:w-80 xl:w-96 flex-shrink-0">
        <MarketList
          symbols={market || []}
          isLoading={isLoading}
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
        />
      </div>

      {/* Trading Panel */}
      <div className="flex-1">
        {selectedSymbol ? (
          <TradingPanel symbol={selectedSymbol} />
        ) : (
          <div className="h-full flex items-center justify-center bg-card rounded-lg border border-border">
            <p className="text-muted-foreground">Select a symbol to start trading</p>
          </div>
        )}
      </div>
    </div>
  )
}
