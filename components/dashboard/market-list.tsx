"use client"

import { Search, Leaf, Zap } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SymbolInfoPreview } from "@/components/dashboard/symbol-info-preview"
import { cn } from "@/lib/utils"
import { getSymbolInfo, type Symbol } from "@/lib/api"

interface MarketListProps {
  symbols: Symbol[]
  isLoading: boolean
  selectedSymbol: Symbol | null
  onSelectSymbol: (symbol: Symbol) => void
}

export function MarketList({
  symbols,
  isLoading,
  selectedSymbol,
  onSelectSymbol,
}: MarketListProps) {
  const [search, setSearch] = useState("")

  const filteredSymbols = symbols.filter(
    (s) =>
      s.symbol.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  const getSymbolIcon = (symbolName: string) => {
    if (symbolName.includes("REC") || symbolName.includes("SREC")) {
      return <Zap className="h-4 w-4 text-primary" />
    }
    return <Leaf className="h-4 w-4 text-primary" />
  }

  // Component for individual symbol item with logo fetching
  function SymbolItem({ symbol, isSelected, onSelect }: { 
    symbol: Symbol
    isSelected: boolean
    onSelect: () => void 
  }) {
    const { data } = useSWR(
      ['symbolInfo', symbol.symbol],
      () => getSymbolInfo(symbol.symbol),
      { revalidateOnFocus: false, dedupingInterval: 60000 }
    )
    
    const logoUrl = data?.data?.logo_url

    return (
      <SymbolInfoPreview symbol={symbol.symbol}>
        <button
          onClick={onSelect}
          className={cn(
            "w-full px-4 py-3 text-left transition-colors hover:bg-secondary/50",
            isSelected && "bg-primary/10"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-lg bg-secondary overflow-hidden w-10 h-10 flex items-center justify-center">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={symbol.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  getSymbolIcon(symbol.symbol)
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">{symbol.symbol}</p>
                <p className="text-sm text-muted-foreground truncate max-w-[120px]">
                  {symbol.name}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-semibold text-foreground">
                {formatPrice(symbol.last_price || 0)}
              </p>
              <p className="text-xs text-muted-foreground">Last Price</p>
            </div>
          </div>
        </button>
      </SymbolInfoPreview>
    )
  }

  return (
    <Card className="h-full bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Market</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search symbols..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[calc(100vh-300px)] lg:max-h-[calc(100vh-240px)] overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredSymbols.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No symbols found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredSymbols.map((symbol) => (
                <SymbolItem
                  key={symbol.symbol}
                  symbol={symbol}
                  isSelected={selectedSymbol?.symbol === symbol.symbol}
                  onSelect={() => onSelectSymbol(symbol)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
