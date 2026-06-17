import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { dbService } from '../services/dbService'
import { supabase } from '../lib/supabase'
import { useAuthStore } from './auth'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const authStore = useAuthStore()
  let realtimeSubscription = null

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.is_read).length
  })

  async function fetchNotifications() {
    if (!authStore.userProfile?.id) return
    loading.value = true
    try {
      notifications.value = await dbService.getNotifications(authStore.userProfile.id)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      loading.value = false
    }
  }

  async function markRead(id) {
    try {
      await dbService.markNotificationRead(id)
      const notif = notifications.value.find(n => n.id === id)
      if (notif) notif.is_read = true
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  async function markAllRead() {
    if (!authStore.userProfile?.id) return
    try {
      await dbService.markAllNotificationsRead(authStore.userProfile.id)
      notifications.value.forEach(n => {
        n.is_read = true
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  // Realtime subscription setup
  function setupRealtimeListener() {
    cleanupRealtimeListener()
    const userId = authStore.userProfile?.id
    if (!userId) return

    // Supabase mode: Subscribe to postgres changes on public.notifications
    realtimeSubscription = supabase
      .channel(`public:notifications:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            notifications.value.unshift(payload.new)
            triggerAudioChime()
          } else if (payload.eventType === 'UPDATE') {
            const index = notifications.value.findIndex(n => n.id === payload.new.id)
            if (index !== -1) {
              notifications.value[index] = payload.new
            }
          }
        }
      )
      .subscribe()
  }

  function cleanupRealtimeListener() {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription)
      realtimeSubscription = null
    }
  }

  function triggerAudioChime() {
    // Play warm chord feedback chime
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime) // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08) // A5
      
      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4)
      
      osc.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      
      osc.start()
      osc.stop(audioCtx.currentTime + 0.4)
    } catch (e) {
      // blocked by browser audio policy until user gesture
    }
  }

  return {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markRead,
    markAllRead,
    setupRealtimeListener,
    cleanupRealtimeListener
  }
})
