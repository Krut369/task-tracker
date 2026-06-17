<template>
  <div class="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/40 dark:bg-slate-900/10 backdrop-blur-sm animate-fade-in w-full">
    <!-- Icon Slot / Default Icon -->
    <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 mb-5 text-slate-400 dark:text-slate-500 shadow-sm">
      <slot name="icon">
        <FolderOpenIcon class="w-7 h-7 text-primary-500" />
      </slot>
    </div>

    <!-- Details -->
    <h3 class="text-base font-bold text-slate-900 dark:text-white mb-1">
      {{ title }}
    </h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
      {{ description }}
    </p>

    <!-- Action Button Slot -->
    <slot name="action">
      <button 
        v-if="actionText"
        @click="$emit('action')"
        class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md shadow-primary-500/10"
      >
        <PlusIcon class="w-4 h-4" />
        {{ actionText }}
      </button>
    </slot>
  </div>
</template>

<script setup>
import { FolderOpen as FolderOpenIcon, Plus as PlusIcon } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    default: 'No data found'
  },
  description: {
    type: String,
    default: 'Try creating a new record or modifying search criteria.'
  },
  actionText: {
    type: String,
    default: ''
  }
})

defineEmits(['action'])
</script>
