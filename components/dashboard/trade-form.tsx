"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { placeBuyOrder, placeSellOrder, type Symbol, type TradeContext } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

interface TradeFormProps {
  symbol: Symbol
  side: "buy" | "sell"
  tradeContext: TradeContext | null | undefined
  onOrderPlaced: () => void
}

export function TradeForm({ symbol, side, tradeContext, onOrderPlaced }: TradeFormProps) {
  const userId = useAuthStore((state) => state.userId)
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  const estimatedTotal = () => {
    const p = parseFloat(price) || 0
    const q = parseFloat(quantity) || 0
    return p * q
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    const priceNum = parseInt(price)
    const qtyNum = parseInt(quantity)

    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Invalid price")
      setIsLoading(false)
      return
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setError("Invalid quantity")
      setIsLoading(false)
      return
    }

    const orderFn = side === "buy" ? placeBuyOrder : placeSellOrder
    const res = await orderFn(userId, symbol.symbol, priceNum, qtyNum)

    if (res.success) {
      setSuccess(`Order placed! ID: ${res.order_id}`)
      setPrice("")
      setQuantity("")
      onOrderPlaced()
    } else {
      setError(res.error || "Failed to place order")
    }

    setIsLoading(false)
  }

  const setMarketPrice = () => {
    if (tradeContext?.last_price) {
      setPrice(tradeContext.last_price.toString())
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Context info for sell */}
      {side === "sell" && tradeContext && (
        <div className="mb-4 p-3 rounded-lg bg-secondary/50 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Your Holdings:</span>
            <span className="font-mono font-semibold text-foreground">
              {formatPrice(tradeContext.qty || 0)}
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted-foreground">Avg Price:</span>
            <span className="font-mono text-foreground">
              {formatPrice(tradeContext.avg_price || 0)}
            </span>
          </div>
        </div>
      )}

      <FieldGroup>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="price">Price</FieldLabel>
            <button
              type="button"
              onClick={setMarketPrice}
              className="text-xs text-primary hover:underline"
            >
              Market: {formatPrice(tradeContext?.last_price || symbol.last_price || 0)}
            </button>
          </div>
          <Input
            id="price"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-input border-border font-mono"
            required
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
          <Input
            id="quantity"
            type="number"
            placeholder="Enter quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="bg-input border-border font-mono"
            required
          />
        </Field>
      </FieldGroup>

      {/* Estimated total */}
      <div className="mt-4 p-3 rounded-lg bg-secondary/50">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated Total:</span>
          <span className="font-mono font-semibold text-foreground">
            {formatPrice(estimatedTotal())}
          </span>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}

      {success && (
        <p className="mt-3 text-sm text-buy">{success}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className={cn(
          "w-full mt-4 font-semibold",
          side === "buy"
            ? "bg-buy text-buy-foreground hover:bg-buy/90"
            : "bg-sell text-sell-foreground hover:bg-sell/90"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {side === "buy" ? "Buy" : "Sell"} {symbol.symbol}
          </>
        )}
      </Button>
    </form>
  )
}
