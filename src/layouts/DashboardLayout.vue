<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex transition-colors duration-300">
    <!-- Collapsible Sidebar -->
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />
    
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      <!-- Navbar / Header -->
      <Navbar 
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @open-notifications="notificationsOpen = true"
      />
      
      <!-- Content Panel -->
      <main class="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl w-full mx-auto animate-fade-in">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Notification Drawer -->
    <NotificationDrawer :open="notificationsOpen" @close="notificationsOpen = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '../components/Sidebar.vue'
import Navbar from '../components/Navbar.vue'
import NotificationDrawer from '../components/NotificationDrawer.vue'
import { useNotificationStore } from '../stores/notification'

const sidebarCollapsed = ref(false)
const notificationsOpen = ref(false)
const notificationStore = useNotificationStore()

onMounted(() => {
  // Fetch initial notifications and initialize realtime database listeners
  notificationStore.fetchNotifications()
  notificationStore.setupRealtimeListener()
  
  // Collapse sidebar by default on smaller screens
  if (window.innerWidth < 1024) {
    sidebarCollapsed.value = true
  }
})

onUnmounted(() => {
  // Disconnect active listeners to prevent leaks
  notificationStore.cleanupRealtimeListener()
})
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
