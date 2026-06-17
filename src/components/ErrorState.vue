<template>
  <div class="flex flex-col items-center justify-center text-center p-8 border border-red-100 dark:border-red-950/20 rounded-2xl bg-red-50/20 dark:bg-red-950/5 animate-fade-in w-full">
    <!-- Warn Icon -->
    <div class="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
      <AlertTriangleIcon class="w-6 h-6" />
    </div>

    <!-- Details -->
    <h3 class="text-sm font-bold text-slate-900 dark:text-white mb-1">
      Failed to load content
    </h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed truncate-2-lines">
      {{ errorMessage || 'A connection problem occurred. Please check your network and try again.' }}
    </p>

    <!-- Retry action -->
    <button 
      @click="$emit('retry')"
      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer active:scale-95"
    >
      <RefreshCwIcon class="w-3.5 h-3.5" />
      Retry Request
    </button>
  </div>
</template>

<script setup>
import { AlertTriangle as AlertTriangleIcon, RefreshCw as RefreshCwIcon } from 'lucide-vue-next'

defineProps({
  errorMessage: {
    type: String,
    default: ''
  }
})

defineEmits(['retry'])
</script>
