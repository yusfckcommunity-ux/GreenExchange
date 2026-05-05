"use client"

import { cn } from "@/lib/utils"
import type { OrderBookEntry } from "@/lib/api"

interface OrderBookProps {
  buyOrders: OrderBookEntry[]
  sellOrders: OrderBookEntry[]
}

export function OrderBook({ buyOrders, sellOrders }: OrderBookProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  const maxBuyQty = Math.max(...buyOrders.map((o) => o.qty), 1)
  const maxSellQty = Math.max(...sellOrders.map((o) => o.qty), 1)

  // Show top 8 orders each
  const topSellOrders = sellOrders.slice(0, 8).reverse()
  const topBuyOrders = buyOrders.slice(0, 8)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="grid grid-cols-3 text-xs text-muted-foreground font-medium px-2 pb-2 border-b border-border">
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>

      {/* Sell orders (asks) - reversed so lowest is at bottom */}
      <div className="space-y-0.5">
        {topSellOrders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No sell orders
          </div>
        ) : (
          topSellOrders.map((order, i) => (
            <OrderRow
              key={`sell-${i}`}
              price={order.price}
              qty={order.qty}
              total={order.price * order.qty}
              type="sell"
              fillPercent={(order.qty / maxSellQty) * 100}
            />
          ))
        )}
      </div>

      {/* Spread indicator */}
      <div className="py-2 px-2 bg-secondary/50 rounded text-center">
        {topBuyOrders.length > 0 && topSellOrders.length > 0 ? (
          <p className="text-sm">
            <span className="text-muted-foreground">Spread: </span>
            <span className="font-mono font-semibold text-foreground">
              {formatPrice(sellOrders[0].price - buyOrders[0].price)}
            </span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">--</p>
        )}
      </div>

      {/* Buy orders (bids) */}
      <div className="space-y-0.5">
        {topBuyOrders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No buy orders
          </div>
        ) : (
          topBuyOrders.map((order, i) => (
            <OrderRow
              key={`buy-${i}`}
              price={order.price}
              qty={order.qty}
              total={order.price * order.qty}
              type="buy"
              fillPercent={(order.qty / maxBuyQty) * 100}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface OrderRowProps {
  price: number
  qty: number
  total: number
  type: "buy" | "sell"
  fillPercent: number
}

function OrderRow({ price, qty, total, type, fillPercent }: OrderRowProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  return (
    <div className="relative px-2 py-1.5 rounded">
      {/* Background fill */}
      <div
        className={cn(
          "absolute inset-0 rounded opacity-20",
          type === "buy" ? "bg-buy" : "bg-sell"
        )}
        style={{ width: `${fillPercent}%` }}
      />
      
      {/* Content */}
      <div className="relative grid grid-cols-3 text-sm">
        <span
          className={cn(
            "font-mono font-medium",
            type === "buy" ? "text-buy" : "text-sell"
          )}
        >
          {formatPrice(price)}
        </span>
        <span className="font-mono text-right text-foreground">
          {formatPrice(qty)}
        </span>
        <span className="font-mono text-right text-muted-foreground">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  )
}
