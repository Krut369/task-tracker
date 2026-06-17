<template>
  <aside 
    :class="[
      'h-screen bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 sticky top-0 z-40',
      collapsed ? 'w-16' : 'w-64'
    ]"
  >
    <!-- Brand Header -->
    <div class="h-16 flex items-center px-4 border-b border-slate-800 gap-3 overflow-hidden select-none">
      <div class="p-2 rounded-xl bg-primary-600 text-white flex-shrink-0 shadow-lg shadow-primary-500/20">
        <ActivityIcon class="w-5 h-5" />
      </div>
      <span 
        v-if="!collapsed" 
        class="font-bold text-white text-base tracking-wide whitespace-nowrap animate-fade-in"
      >
        Antigravity <span class="text-xs text-primary-400 font-medium px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 ml-1">SaaS</span>
      </span>
    </div>

    <!-- Navigation Links -->
    <nav class="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
      <div v-for="item in visibleNavItems" :key="item.path">
        <router-link 
          :to="item.path" 
          v-slot="{ isActive }" 
          custom
        >
          <a
            @click="$router.push(item.path)"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group relative',
              isActive 
                ? 'bg-primary-600 text-white font-medium shadow-md shadow-primary-500/10' 
                : 'hover:bg-slate-800/60 hover:text-white'
            ]"
            :title="collapsed ? item.name : ''"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            
            <span 
              v-if="!collapsed" 
              class="text-sm whitespace-nowrap transition-opacity duration-200"
            >
              {{ item.name }}
            </span>

            <!-- Collapsed Hover Tooltip -->
            <div 
              v-if="collapsed"
              class="absolute left-14 hidden group-hover:block bg-slate-950 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-800 whitespace-nowrap z-50 pointer-events-none"
            >
              {{ item.name }}
            </div>
          </a>
        </router-link>
      </div>
    </nav>

    <!-- Sidebar Footer Profile -->
    <div class="p-3 border-t border-slate-800">
      <button 
        @click="handleSignOut"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-900/20 hover:text-red-400 text-slate-400 transition-all cursor-pointer group relative',
          collapsed ? 'justify-center' : ''
        ]"
        title="Sign Out"
      >
        <LogOutIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="text-sm font-medium whitespace-nowrap">Sign Out</span>
        
        <!-- Collapsed Tooltip -->
        <div 
          v-if="collapsed"
          class="absolute left-14 hidden group-hover:block bg-slate-950 text-red-400 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-lg border border-slate-800 whitespace-nowrap z-50 pointer-events-none"
        >
          Sign Out
        </div>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Activity as ActivityIcon,
  LayoutDashboard as DashboardIcon, 
  FolderKanban as ProjectsIcon, 
  Users as TeamIcon, 
  BarChart3 as ReportsIcon, 
  UserSquare2 as ProfileIcon,
  LogOut as LogOutIcon 
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: DashboardIcon, roles: ['Super Admin', 'Admin', 'User'] },
  { name: 'Projects', path: '/projects', icon: ProjectsIcon, roles: ['Super Admin', 'Admin', 'User'] },
  { name: 'Team Performance', path: '/team', icon: TeamIcon, roles: ['Super Admin', 'Admin', 'User'] },
  { name: 'Analytics & Reports', path: '/reports', icon: ReportsIcon, roles: ['Super Admin', 'Admin'] },
  { name: 'My Profile', path: '/profile', icon: ProfileIcon, roles: ['Super Admin', 'Admin', 'User'] }
]

const visibleNavItems = computed(() => {
  const role = authStore.userRole
  return navItems.filter(item => item.roles.includes(role))
})

async function handleSignOut() {
  await authStore.logout()
  router.push('/login')
}
</script>
