<template>
  <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
    <div class="flex items-center gap-3">
      <!-- Toggle Sidebar Button -->
      <button 
        @click="$emit('toggle-sidebar')" 
        class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <MenuIcon class="w-5 h-5" />
      </button>
      
      <!-- Current Page Title -->
      <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-200 hidden sm:block">
        {{ currentPageTitle }}
      </h1>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-4">
      <!-- Dark Mode Button -->
      <button 
        @click="toggleDark()" 
        class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer"
        aria-label="Toggle dark mode"
      >
        <SunIcon v-if="isDark" class="w-5 h-5 text-amber-400" />
        <MoonIcon v-else class="w-5 h-5" />
      </button>

      <!-- Notification Bell -->
      <button 
        @click="$emit('open-notifications')" 
        class="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer relative"
        aria-label="View notifications"
      >
        <BellIcon class="w-5 h-5" />
        <span 
          v-if="unreadCount > 0" 
          class="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-900"
        >
          {{ unreadCount }}
        </span>
      </button>

      <!-- User Menu -->
      <div class="relative">
        <button 
          @click="showUserMenu = !showUserMenu" 
          class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-left"
        >
          <img 
            :src="userProfile?.avatarUrl" 
            :alt="userProfile?.fullName" 
            class="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
          />
          <div class="hidden md:block">
            <div class="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              {{ userProfile?.fullName }}
            </div>
            <div class="text-[10px] text-slate-400 font-medium">
              {{ userProfile?.role }}
            </div>
          </div>
          <ChevronDownIcon class="w-4 h-4 text-slate-400 hidden md:block" />
        </button>

        <!-- Profile Dropdown -->
        <div 
          v-if="showUserMenu" 
          v-click-outside="closeUserMenu"
          class="absolute right-0 mt-2 w-48 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-50 text-sm text-slate-700 dark:text-slate-300"
        >
          <div class="px-4 py-2 border-b border-slate-100 dark:border-slate-800 md:hidden">
            <div class="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {{ userProfile?.fullName }}
            </div>
            <div class="text-[10px] text-slate-400">
              {{ userProfile?.role }}
            </div>
          </div>
          
          <router-link 
            to="/profile" 
            @click="showUserMenu = false"
            class="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <UserIcon class="w-4 h-4 text-slate-400" />
            My Profile
          </router-link>
          
          <button 
            @click="handleSignOut" 
            class="w-full flex items-center gap-2 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-red-600 dark:text-red-400 transition-colors text-left cursor-pointer"
          >
            <LogOutIcon class="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDark, useToggle } from '@vueuse/core'
import { 
  Menu as MenuIcon, 
  Bell as BellIcon, 
  Sun as SunIcon, 
  Moon as MoonIcon, 
  ChevronDown as ChevronDownIcon, 
  User as UserIcon, 
  LogOut as LogOutIcon
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useNotificationStore } from '../stores/notification'

defineEmits(['toggle-sidebar', 'open-notifications'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const isDark = useDark()
const toggleDark = useToggle(isDark)

const showUserMenu = ref(false)

const userProfile = computed(() => authStore.userProfile)
const unreadCount = computed(() => notificationStore.unreadCount)

const currentPageTitle = computed(() => {
  if (route.name === 'ProjectDetails') return 'Project Details'
  if (route.name === 'TaskDetails') return 'Task Dashboard'
  return route.name || 'Task Platform'
})

function closeUserMenu() {
  showUserMenu.value = false
}

async function handleSignOut() {
  showUserMenu.value = false
  await authStore.logout()
  router.push('/login')
}

// Click outside directive declaration
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>
