"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { TrendingUp, MessageSquare, Newspaper, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getFYP, getForum, postForum, getCertificateInfo, type ForumMessage } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import Image from "next/image"
import Link from "next/link"

const YOUTUBE_VIDEO_ID = "s3zIMNlG4Nk?si=Pgm1YFmiZTHWEC69"

// Certificate Modal Component
function CertificateModal({ certName, onClose }: { certName: string; onClose: () => void }) {
  const { data } = useSWR(
    ['certificate', certName],
    () => getCertificateInfo(certName),
    { revalidateOnFocus: false }
  )

  const cert = data?.data

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
          <div className="flex-1">
            <CardTitle className="text-2xl text-foreground">{cert?.certificate_name}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {cert?.certificate_logo_url && (
            <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-border">
              <Image
                src={cert.certificate_logo_url}
                alt={cert.certificate_name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Publisher</p>
              <p className="font-semibold text-foreground">{cert?.certificate_publisher}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold text-foreground">{cert?.certificate_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Year</p>
                <p className="font-semibold text-foreground">{cert?.certificate_year}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold text-foreground">{cert?.certificate_loc}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">About</p>
              <p className="text-foreground text-justify">{cert?.certificate_desc_about}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Make certificate names clickable
function CertificateLink({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button 
      onClick={onOpen}
      className="text-primary hover:underline cursor-pointer font-medium"
    >
      {name}
    </button>
  )
}

export default function FYPPage() {
  const userId = useAuthStore((state) => state.userId)
  const [forumMessage, setForumMessage] = useState("")
  const [selectedCert, setSelectedCert] = useState<string | null>(null)
  const [isPosting, setIsPosting] = useState(false)

  // Fetch FYP data
  const { data: fypData } = useSWR('get_fyp', getFYP, {
    refreshInterval: 30000,
  })

  // Fetch forum data with periodic refresh
  const { data: forumData, mutate: mutateForum } = useSWR(
    'get_forum',
    getForum,
    { refreshInterval: 10000 }
  )

  // Auto-scroll to latest message
  const [forumRef, setForumRef] = useState<HTMLDivElement | null>(null)
  useEffect(() => {
    if (forumRef) {
      forumRef.scrollTop = forumRef.scrollHeight
    }
  }, [forumData?.data])

  const handlePostForum = async () => {
    if (!forumMessage.trim() || !userId) return

    setIsPosting(true)
    const res = await postForum(userId, "General", forumMessage)
    if (res.success) {
      setForumMessage("")
      // Refresh forum immediately
      setTimeout(() => mutateForum(), 500)
    }
    setIsPosting(false)
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('id-ID').format(price)
  const formatTime = (time: string) => {
    const date = new Date(time)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  // Shuffle array for randomized trending
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const trendingSymbols = fypData?.trending_symbols ? shuffleArray(fypData.trending_symbols).slice(0, 8) : []
  const news = fypData?.news || []
  const forumMessages = forumData?.data || []

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Hero Section */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
              title="About Green Exchange and How to Use It"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trending Symbols - Ticker Style */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg text-foreground">Trending Symbols</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {trendingSymbols.map((symbol) => (
                <Link key={symbol.symbol} href={`/dashboard/symbol/${symbol.symbol}`}>
                  <Card className="bg-secondary/50 border-border hover:border-primary/50 transition-colors min-w-[200px] cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center overflow-hidden">
                          {symbol.logo_url ? (
                            <Image
                              src={symbol.logo_url}
                              alt={symbol.name}
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{symbol.symbol}</p>
                          <p className="text-xs text-muted-foreground">{symbol.class}</p>
                        </div>
                      </div>
                      <p className="font-mono font-bold text-foreground text-sm mb-1">
                        {formatPrice(symbol.last_price)}
                      </p>
                      <Badge variant="outline" className="text-xs" onClick={(e) => {
                        e.preventDefault()
                        setSelectedCert(symbol.certification)
                      }}>
                        <CertificateLink name={symbol.certification} onOpen={() => setSelectedCert(symbol.certification)} />
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* News and Forum Split */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* News Section - Larger */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg text-foreground">Latest News</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {news.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No news available</p>
                ) : (
                  news.map((item) => (
                    <a
                      key={item.news_id}
                      href={item.news_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-secondary border border-border">
                        {item.news_thumbnail_url && (
                          <Image
                            src={item.news_thumbnail_url}
                            alt={item.news_title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            unoptimized
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {item.news_title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.news_abstract}
                        </p>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forum Section */}
        <Card className="bg-card border-border h-full flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-foreground">Community Chat</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            {/* Messages Container */}
            <ScrollArea className="flex-1 border border-border rounded-lg p-3 bg-secondary/30">
              <div ref={setForumRef} className="space-y-2">
                {forumMessages.length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-4">No messages yet</p>
                ) : (
                  forumMessages.map((msg, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="font-semibold text-foreground">{msg.username || msg.user_id}</span>
                        <span className="text-muted-foreground">{formatTime(msg.time)}</span>
                      </div>
                      <p className="text-muted-foreground break-words">{msg.chat_body}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="flex gap-2 mt-auto">
              <Input
                placeholder="Say something..."
                value={forumMessage}
                onChange={(e) => setForumMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handlePostForum()
                  }
                }}
                className="text-sm h-8"
                disabled={isPosting}
              />
              <Button
                size="sm"
                onClick={handlePostForum}
                disabled={isPosting || !forumMessage.trim()}
                className="h-8"
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal
          certName={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </div>
  )
}
