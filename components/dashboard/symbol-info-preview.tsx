"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import Image from "next/image"
import { Info, ExternalLink, MapPin, Calendar, Award, Building2, Leaf, Zap } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getSymbolInfo, type SymbolInfo } from "@/lib/api"
import { cn } from "@/lib/utils"

interface SymbolInfoPreviewProps {
  symbol: string
  children: React.ReactNode
}

export function SymbolInfoPreview({ symbol, children }: SymbolInfoPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { data, isLoading } = useSWR(
    isOpen ? ['symbolInfo', symbol] : null,
    () => getSymbolInfo(symbol),
    { revalidateOnFocus: false }
  )

  const info = data?.data

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  return (
    <HoverCard openDelay={300} closeDelay={100} onOpenChange={setIsOpen}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-0 bg-card border-border" align="start">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ) : info ? (
          <div>
            {/* Header with Logo, Symbol, Name */}
            <div className="p-4 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                  {info.logo_url ? (
                    <Image
                      src={info.logo_url}
                      alt={info.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      {info.class === 'REC' ? (
                        <Zap className="h-6 w-6 text-primary" />
                      ) : (
                        <Leaf className="h-6 w-6 text-primary" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{info.symbol}</h4>
                    <Badge variant={info.class === 'REC' ? 'default' : 'secondary'} className="text-xs">
                      {info.class}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{info.name}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-4 pt-3 pb-2 border-b border-border">
              <p className="text-sm text-muted-foreground line-clamp-3 text-justify leading-relaxed">
                {info.description}
              </p>
            </div>

            {/* Quick Info */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{info.region}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{info.commissioned_year}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="h-3 w-3" />
                  <span>{info.certification}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{info.issuer}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Last Price</p>
                  <p className="font-mono font-semibold text-foreground">
                    {formatPrice(info.last_price)}
                  </p>
                </div>
                <Link href={`/dashboard/symbol/${symbol}`}>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <span>View Details</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Unable to load symbol info
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  )
}

// Info button trigger variant
export function SymbolInfoButton({ symbol }: { symbol: string }) {
  return (
    <SymbolInfoPreview symbol={symbol}>
      <button
        type="button"
        className="p-1.5 rounded-md hover:bg-secondary transition-colors"
        aria-label={`View info for ${symbol}`}
      >
        <Info className="h-4 w-4 text-muted-foreground" />
      </button>
    </SymbolInfoPreview>
  )
}
