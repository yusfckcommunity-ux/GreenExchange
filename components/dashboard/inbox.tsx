"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { 
  Inbox as InboxIcon, 
  AlertTriangle, 
  ShoppingCart, 
  Bell, 
  XCircle, 
  MessageSquare, 
  MoreHorizontal,
  Check,
  CheckCheck,
  ChevronLeft,
  X
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuthStore } from "@/lib/auth-store"
import { useInboxStore, useUnreadCount, useHasNewMessages } from "@/lib/inbox-store"
import type { InboxMessage, InboxCategory } from "@/lib/api"

const POLL_INTERVAL = 15000 // 15 seconds

const categoryConfig: Record<InboxCategory, { icon: typeof AlertTriangle; color: string; label: string }> = {
  warning: { icon: AlertTriangle, color: "text-yellow-500", label: "Warning" },
  order_notification: { icon: ShoppingCart, color: "text-primary", label: "Order" },
  system_notification: { icon: Bell, color: "text-blue-400", label: "System" },
  cancelation: { icon: XCircle, color: "text-destructive", label: "Canceled" },
  direct_message: { icon: MessageSquare, color: "text-purple-400", label: "Message" },
  others: { icon: MoreHorizontal, color: "text-muted-foreground", label: "Other" },
}

function formatTime(timeString: string) {
  const date = new Date(timeString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function MessageItem({ 
  message, 
  isSelected,
  isNew,
  onSelect,
  onClick,
  onMarkRead
}: { 
  message: InboxMessage
  isSelected: boolean
  isNew: boolean
  onSelect: (id: string) => void
  onClick: (message: InboxMessage) => void
  onMarkRead: (id: string) => void
}) {
  const config = categoryConfig[message.category] || categoryConfig.others
  const Icon = config.icon
  const isUnread = message.is_read === 0

  return (
    <div 
      className={cn(
        "group flex items-start gap-3 p-3 border-b border-border/50 cursor-pointer transition-colors",
        isUnread ? "bg-primary/5" : "bg-transparent",
        isNew && "animate-pulse bg-primary/10",
        "hover:bg-secondary/50"
      )}
      onClick={() => onClick(message)}
    >
      <div className="pt-0.5" onClick={(e) => { e.stopPropagation(); onSelect(message.message_id) }}>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onSelect(message.message_id)}
        />
      </div>
      
      <div className={cn("p-1.5 rounded-md bg-secondary/50", config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm truncate",
            isUnread ? "font-semibold text-foreground" : "text-muted-foreground"
          )}>
            {message.subject}
          </span>
          {isUnread && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {message.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {config.label}
          </Badge>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.time)}
          </span>
        </div>
      </div>

      {isUnread && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => { e.stopPropagation(); onMarkRead(message.message_id) }}
        >
          <Check className="h-3 w-3" />
          <span className="sr-only">Mark as read</span>
        </Button>
      )}
    </div>
  )
}

function MessageDetail({ 
  message, 
  onBack,
  onMarkRead 
}: { 
  message: InboxMessage
  onBack: () => void
  onMarkRead: (id: string) => void
}) {
  const config = categoryConfig[message.category] || categoryConfig.others
  const Icon = config.icon
  const isUnread = message.is_read === 0

  useEffect(() => {
    // Auto mark as read when viewing
    if (isUnread) {
      onMarkRead(message.message_id)
    }
  }, [message.message_id, isUnread, onMarkRead])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">Message Details</span>
      </div>
      
      <div className="p-4 flex-1 overflow-auto">
        <div className="flex items-start gap-3 mb-4">
          <div className={cn("p-2 rounded-lg bg-secondary/50", config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{message.subject}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.time)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {message.message}
        </div>
      </div>
    </div>
  )
}

export function InboxButton() {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [viewingMessage, setViewingMessage] = useState<InboxMessage | null>(null)
  const [showNotification, setShowNotification] = useState(false)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { userId } = useAuthStore()
  const { 
    messages, 
    fetchInbox, 
    markAsRead, 
    markMultipleAsRead, 
    markAllAsRead,
    newMessageIds,
    clearNewMessageFlag,
    clearAllNewMessageFlags
  } = useInboxStore()
  const unreadCount = useUnreadCount()
  const hasNewMessages = useHasNewMessages()

  // Initial fetch and polling
  useEffect(() => {
    if (!userId) return

    // Initial fetch
    fetchInbox(userId)

    // Set up polling
    const interval = setInterval(() => {
      fetchInbox(userId)
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [userId, fetchInbox])

  // Show notification toast when new messages arrive
  useEffect(() => {
    if (hasNewMessages && !open) {
      setShowNotification(true)
      
      // Get the newest message
      const newestNewId = Array.from(newMessageIds)[newMessageIds.size - 1]
      const newestMessage = messages.find(m => m.message_id === newestNewId)
      
      if (newestMessage) {
        toast.info(newestMessage.subject, {
          description: newestMessage.message.substring(0, 60) + (newestMessage.message.length > 60 ? '...' : ''),
          duration: 4000,
          action: {
            label: "View",
            onClick: () => setOpen(true)
          }
        })
      }

      // Clear notification indicator after delay
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
      notificationTimeoutRef.current = setTimeout(() => {
        setShowNotification(false)
      }, 5000)
    }
  }, [hasNewMessages, newMessageIds, messages, open])

  // Clear new message flags when panel opens
  useEffect(() => {
    if (open) {
      clearAllNewMessageFlags()
      setShowNotification(false)
    }
  }, [open, clearAllNewMessageFlags])

  const handleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  const handleMarkSelectedRead = useCallback(async () => {
    if (selectedIds.size === 0) return
    await markMultipleAsRead(Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [selectedIds, markMultipleAsRead])

  const handleMarkAllRead = useCallback(async () => {
    if (!userId) return
    await markAllAsRead(userId)
  }, [userId, markAllAsRead])

  const handleMessageClick = useCallback((message: InboxMessage) => {
    setViewingMessage(message)
    clearNewMessageFlag(message.message_id)
  }, [clearNewMessageFlag])

  const handleMarkRead = useCallback(async (id: string) => {
    await markAsRead(id)
  }, [markAsRead])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-muted-foreground hover:text-foreground",
            showNotification && "animate-bounce"
          )}
        >
          <InboxIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Inbox</span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        align="end" 
        className="w-96 p-0 max-h-[500px] flex flex-col"
        sideOffset={8}
      >
        {viewingMessage ? (
          <MessageDetail 
            message={viewingMessage} 
            onBack={() => setViewingMessage(null)}
            onMarkRead={handleMarkRead}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <div className="flex items-center gap-2">
                <InboxIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">Inbox</span>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {selectedIds.size > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={handleMarkSelectedRead}
                  >
                    <Check className="h-3 w-3" />
                    Mark ({selectedIds.size})
                  </Button>
                )}
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-xs gap-1"
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck className="h-3 w-3" />
                    All
                  </Button>
                )}
              </div>
            </div>

            {/* Message List */}
            <ScrollArea className="flex-1 max-h-[400px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <InboxIcon className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                <div>
                  {messages.map(message => (
                    <MessageItem
                      key={message.message_id}
                      message={message}
                      isSelected={selectedIds.has(message.message_id)}
                      isNew={newMessageIds.has(message.message_id)}
                      onSelect={handleSelect}
                      onClick={handleMessageClick}
                      onMarkRead={handleMarkRead}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
