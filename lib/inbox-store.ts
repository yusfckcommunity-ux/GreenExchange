"use client"

import { create } from 'zustand'
import { InboxMessage, getInbox, markInboxRead } from './api'

interface InboxState {
  messages: InboxMessage[]
  isLoading: boolean
  lastFetchTime: number | null
  newMessageIds: Set<string>
  
  // Actions
  fetchInbox: (userId: string) => Promise<void>
  markAsRead: (messageId: string) => Promise<void>
  markMultipleAsRead: (messageIds: string[]) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  clearNewMessageFlag: (messageId: string) => void
  clearAllNewMessageFlags: () => void
}

export const useInboxStore = create<InboxState>((set, get) => ({
  messages: [],
  isLoading: false,
  lastFetchTime: null,
  newMessageIds: new Set(),

  fetchInbox: async (userId: string) => {
    const state = get()
    
    // Track previous message IDs to detect new ones
    const previousIds = new Set(state.messages.map(m => m.message_id))
    
    set({ isLoading: true })
    
    try {
      const response = await getInbox(userId)
      
      if (response.success && response.data) {
        // Find newly arrived messages (not in previous list and unread)
        const newIds = new Set<string>()
        response.data.forEach(msg => {
          if (!previousIds.has(msg.message_id) && msg.is_read === 0 && state.lastFetchTime !== null) {
            newIds.add(msg.message_id)
          }
        })
        
        set({ 
          messages: response.data,
          lastFetchTime: Date.now(),
          newMessageIds: new Set([...state.newMessageIds, ...newIds])
        })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  markAsRead: async (messageId: string) => {
    const response = await markInboxRead(messageId)
    
    if (response.success) {
      set(state => ({
        messages: state.messages.map(m => 
          m.message_id === messageId ? { ...m, is_read: 1 } : m
        )
      }))
    }
  },

  markMultipleAsRead: async (messageIds: string[]) => {
    // Mark multiple messages as read in parallel
    await Promise.all(messageIds.map(id => markInboxRead(id)))
    
    set(state => ({
      messages: state.messages.map(m => 
        messageIds.includes(m.message_id) ? { ...m, is_read: 1 } : m
      )
    }))
  },

  markAllAsRead: async (userId: string) => {
    const state = get()
    const unreadIds = state.messages
      .filter(m => m.is_read === 0)
      .map(m => m.message_id)
    
    if (unreadIds.length > 0) {
      await get().markMultipleAsRead(unreadIds)
    }
  },

  clearNewMessageFlag: (messageId: string) => {
    set(state => {
      const newSet = new Set(state.newMessageIds)
      newSet.delete(messageId)
      return { newMessageIds: newSet }
    })
  },

  clearAllNewMessageFlags: () => {
    set({ newMessageIds: new Set() })
  }
}))

// Helper hook to get unread count
export function useUnreadCount() {
  return useInboxStore(state => state.messages.filter(m => m.is_read === 0).length)
}

// Helper hook to check if there are new messages
export function useHasNewMessages() {
  return useInboxStore(state => state.newMessageIds.size > 0)
}
