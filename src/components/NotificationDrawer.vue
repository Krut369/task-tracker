<template>
  <div class="relative z-50">
    <!-- Backdrop overlay -->
    <transition name="fade">
      <div 
        v-if="open" 
        @click="$emit('close')"
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
      ></div>
    </transition>

    <!-- Slide-out Drawer Panel -->
    <transition name="slide">
      <div 
        v-if="open" 
        class="fixed inset-y-0 right-0 max-w-full flex pl-10"
      >
        <div class="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full text-slate-800 dark:text-slate-100">
          
          <!-- Drawer Header -->
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 m-0">
                Notifications
              </h2>
              <span 
                v-if="unreadCount > 0" 
                class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400"
              >
                {{ unreadCount }} new
              </span>
            </div>
            
            <div class="flex items-center gap-2">
              <button 
                v-if="unreadCount > 0"
                @click="markAllRead" 
                class="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline cursor-pointer"
              >
                Mark all read
              </button>
              
              <button 
                @click="$emit('close')" 
                class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                aria-label="Close drawer"
              >
                <XIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Notification List / Scroll Area -->
          <div class="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
            <div v-if="loading" class="p-6 space-y-4">
              <!-- Loading Skeleton -->
              <div v-for="n in 3" :key="n" class="flex gap-4 animate-pulse">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5 flex-shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                  <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>

            <div v-else-if="notifications.length === 0" class="p-8 text-center flex flex-col items-center justify-center h-full">
              <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-950/50 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-4 text-slate-400 dark:text-slate-600">
                <BellOffIcon class="w-6 h-6" />
              </div>
              <h3 class="font-bold text-slate-700 dark:text-slate-300 mb-1">All caught up!</h3>
              <p class="text-xs text-slate-400 max-w-[200px]">
                You have no notifications in your inbox at the moment.
              </p>
            </div>

            <div 
              v-else 
              v-for="item in notifications" 
              :key="item.id"
              :class="[
                'p-5 flex gap-4 transition-colors relative hover:bg-slate-50/50 dark:hover:bg-slate-800/30',
                !item.is_read ? 'bg-slate-50/20 dark:bg-slate-800/10' : ''
              ]"
            >
              <!-- Unread status dot -->
              <button 
                v-if="!item.is_read" 
                @click="markRead(item.id)" 
                class="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 cursor-pointer hover:scale-125 transition-transform" 
                title="Mark as read"
              ></button>
              <div v-else class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 mt-1.5 flex-shrink-0"></div>

              <!-- Main text info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 :class="['text-sm truncate m-0', !item.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300']">
                    {{ item.title }}
                  </h4>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {{ item.message }}
                </p>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                  <ClockIcon class="w-3 h-3" />
                  {{ formatTime(item.created_at) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { X as XIcon, BellOff as BellOffIcon, Clock as ClockIcon } from 'lucide-vue-next'
import { useNotificationStore } from '../stores/notification'

defineProps({
  open: {
    type: Boolean,
    required: true
  }
})

defineEmits(['close'])

const notificationStore = useNotificationStore()

const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const loading = computed(() => notificationStore.loading)

function markRead(id) {
  notificationStore.markRead(id)
}

function markAllRead() {
  notificationStore.markAllRead()
}

// Relative time formatting helper
function formatTime(dateStr) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now - date
  const diffMin = Math.floor(diffMs / 60000)
  const diffHrs = Math.floor(diffMin / 600)
  
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
/* Fade transition for backdrop */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Slide transition for drawer panel */
.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>
