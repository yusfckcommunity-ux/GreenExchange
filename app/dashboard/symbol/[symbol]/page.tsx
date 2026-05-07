"use client"

import { use } from "react"
import useSWR from "swr"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Award, 
  Building2, 
  Leaf, 
  Zap,
  Activity,
  Package,
  Globe,
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getSymbolInfo, type SymbolInfo } from "@/lib/api"
import { cn } from "@/lib/utils"

interface SymbolPageProps {
  params: Promise<{ symbol: string }>
}

export default function SymbolPage({ params }: SymbolPageProps) {
  const { symbol } = use(params)
  
  const { data, isLoading, error } = useSWR(
    ['symbolInfo', symbol],
    () => getSymbolInfo(symbol)
  )

  const info = data?.data

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID').format(price)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error || !info) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-muted-foreground mb-4">Unable to load symbol information</p>
        <Link href="/dashboard">
          <Button variant="outline">Back to Market</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Market</span>
      </Link>

      {/* Hero Section */}
      <Card className="bg-card border-border overflow-hidden">
        <div className="relative">
          {/* Background gradient */}
          <div className={cn(
            "absolute inset-0 opacity-20",
            info.class === 'REC' ? "bg-gradient-to-r from-primary/30 to-transparent" : "bg-gradient-to-r from-emerald-500/30 to-transparent"
          )} />
          
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="relative h-24 w-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
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
                      <Zap className="h-12 w-12 text-primary" />
                    ) : (
                      <Leaf className="h-12 w-12 text-primary" />
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{info.symbol}</h1>
                  <Badge variant={info.class === 'REC' ? 'default' : 'secondary'}>
                    {info.class}
                  </Badge>
                  <Badge variant={info.is_active ? 'outline' : 'destructive'} className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {info.status}
                  </Badge>
                </div>
                <h2 className="text-xl text-muted-foreground">{info.name}</h2>
              </div>

              {/* Price Card */}
              <div className="bg-secondary/50 rounded-xl p-4 text-center md:text-right">
                <p className="text-sm text-muted-foreground mb-1">Last Price</p>
                <p className="text-3xl font-bold font-mono text-foreground">
                  {formatPrice(info.last_price)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Min. Qty: {info.min_qty}
                </p>
                <Link href="/dashboard">
                  <Button className="mt-3 w-full md:w-auto">
                    Trade Now
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Description Section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">About This Project</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed text-justify">{info.description}</p>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Project Details */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Project Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Project Type</span>
              <span className="text-sm font-medium text-foreground">{info.project_type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Region</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {info.region}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commissioned</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {info.commissioned_year}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Certification */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Certification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Standard</span>
              <Badge variant="outline">{info.certification}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Issuer</span>
              <span className="text-sm font-medium text-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {info.issuer}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Credit Info */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Credit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit Unit</span>
              <span className="text-sm font-medium text-foreground">{info.credit_unit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Credit</span>
              <span className="text-sm font-medium text-foreground">{info.total_credit}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Credit per Qty</span>
              <span className="text-sm font-medium text-foreground">{info.credit_per_qty}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Gallery */}
      {info.images && info.images.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Project Gallery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {info.images.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-lg overflow-hidden bg-secondary border border-border"
                >
                  <Image
                    src={url}
                    alt={`${info.name} - Image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
