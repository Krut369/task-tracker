<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300 relative overflow-hidden">
    <!-- Animated background neon shapes -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-violet-400/20 dark:bg-violet-900/15 blur-[120px] animate-pulse" style="animation-duration: 8s"></div>
      <div class="absolute -bottom-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-fuchsia-400/20 dark:bg-fuchsia-900/10 blur-[120px] animate-pulse" style="animation-duration: 12s"></div>
    </div>
    
    <div class="w-full max-w-md relative z-10">
      <router-view v-slot="{ Component }">
        <transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
