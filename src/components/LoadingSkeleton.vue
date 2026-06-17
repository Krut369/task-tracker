<template>
  <div v-if="type === 'stats'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 w-full">
    <div v-for="n in count" :key="n" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl animate-pulse space-y-3">
      <div class="flex items-center justify-between">
        <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
        <div class="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
      </div>
      <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
      <div class="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-36"></div>
    </div>
  </div>

  <div v-else-if="type === 'board'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full h-full">
    <div v-for="lane in 4" :key="lane" class="flex flex-col h-[600px] bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/30 animate-pulse">
      <div class="flex items-center justify-between mb-4">
        <div class="h-5 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
        <div class="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
      <div class="space-y-4 flex-1 overflow-hidden">
        <div v-for="card in 3" :key="card" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3">
          <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
          <div class="flex items-center justify-between pt-2">
            <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'card'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
    <div v-for="n in count" :key="n" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl animate-pulse space-y-4">
      <div class="flex items-center justify-between">
        <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16"></div>
        <div class="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      </div>
      <div class="h-5 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
      <div class="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
        </div>
        <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'list'" class="w-full space-y-3">
    <div v-for="n in count" :key="n" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between animate-pulse">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
        <div class="space-y-1.5">
          <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32"></div>
          <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-48"></div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="h-6 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
        <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </div>
  </div>

  <div v-else-if="type === 'chart'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl animate-pulse space-y-4 w-full h-[350px] flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="space-y-2">
        <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36"></div>
        <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
      </div>
      <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
    </div>
    <div class="flex-1 flex items-end gap-3 px-4 pb-2">
      <div v-for="bar in 8" :key="bar" class="flex-1 bg-slate-200 dark:bg-slate-800 rounded-t" :style="{ height: `${20 + (bar * 8) % 70}%` }"></div>
    </div>
    <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'card', // 'stats' | 'board' | 'card' | 'list' | 'chart'
  },
  count: {
    type: Number,
    default: 3
  }
})
</script>
