"use client"

import { useState } from "react"
import useSWR from "swr"
import { X, Loader2, ClipboardList, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getOrders, cancelOrder, type Order } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { cn } from "@/lib/utils"

export default function OrdersPage() {
  const userId = useAuthStore((state) => state.userId)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  const { data: orders, isLoading, mutate } = useSWR(
    userId ? ['orders', userId] : null,
    () => getOrders(userId!),
    { refreshInterval: 5000 }
  )

  const activeOrders = orders?.active || []
  const historyOrders = orders?.history || []

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel || !userId) return

    setCancelingId(orderToCancel.order_id)
    const res = await cancelOrder(orderToCancel.order_id, userId)
    
    if (res.success) {
      mutate()
    }
    
    setCancelingId(null)
    setOrderToCancel(null)
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <Tabs defaultValue="active">
        <TabsList className="bg-secondary">
          <TabsTrigger value="active" className="data-[state=active]:bg-card">
            Active Orders
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-card">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Active Orders
                {activeOrders.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeOrders.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : activeOrders.length === 0 ? (
                <Empty
                  icon={<ClipboardList className="h-12 w-12" />}
                  title="No active orders"
                  description="Your pending orders will appear here"
                />
              ) : (
                <div className="space-y-3">
                  {activeOrders.map((order) => (
                    <OrderCard
                      key={order.order_id}
                      order={order}
                      isCanceling={cancelingId === order.order_id}
                      onCancel={() => setOrderToCancel(order)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <History className="h-5 w-5" />
                Order History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : historyOrders.length === 0 ? (
                <Empty
                  icon={<History className="h-12 w-12" />}
                  title="No order history"
                  description="Your completed and cancelled orders will appear here"
                />
              ) : (
                <div className="space-y-2">
                  {historyOrders.map((order, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground font-mono"
                    >
                      {typeof order === 'string' ? order : JSON.stringify(order)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={!!orderToCancel} onOpenChange={() => setOrderToCancel(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order?
              {orderToCancel && (
                <span className="block mt-2 font-mono">
                  {orderToCancel.side.toUpperCase()} {orderToCancel.symbol} @ {formatPrice(orderToCancel.price)} x {formatPrice(orderToCancel.quantity)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-secondary-foreground">
              Keep Order
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface OrderCardProps {
  order: Order
  isCanceling: boolean
  onCancel: () => void
}

function OrderCard({ order, isCanceling, onCancel }: OrderCardProps) {
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value)
  }

  const progress = order.quantity > 0 ? (order.filled / order.quantity) * 100 : 0

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "font-semibold",
              order.side === 'buy'
                ? "border-buy text-buy"
                : "border-sell text-sell"
            )}
          >
            {order.side.toUpperCase()}
          </Badge>
          <span className="font-semibold text-foreground">{order.symbol}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isCanceling}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          {isCanceling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Price</p>
          <p className="font-mono font-semibold text-foreground">
            {formatPrice(order.price)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Quantity</p>
          <p className="font-mono text-foreground">
            {formatPrice(order.quantity)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Filled</p>
          <p className="font-mono text-foreground">
            {formatPrice(order.filled)}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Status</p>
          <Badge variant="secondary" className="font-mono">
            {order.status}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              order.side === 'buy' ? "bg-buy" : "bg-sell"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {progress.toFixed(0)}% filled
        </p>
      </div>

      {order.blocked_qty && order.blocked_qty > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          Blocked: {formatPrice(order.blocked_qty)}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2 font-mono">
        ID: {order.order_id}
      </p>
    </div>
  )
}
