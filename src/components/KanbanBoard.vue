<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full items-start select-none">
    <!-- Status Columns -->
    <div 
      v-for="column in columns" 
      :key="column.status"
      @dragover.prevent="handleDragOver"
      @dragenter.prevent="handleDragEnter(column.status)"
      @dragleave="handleDragLeave(column.status)"
      @drop="handleDrop($event, column.status)"
      :class="[
        'flex flex-col rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/30 min-h-[550px] transition-all duration-200',
        activeDragOverLane === column.status 
          ? 'bg-slate-100 dark:bg-slate-900 border-dashed border-primary-500/50 scale-[1.01]' 
          : ''
      ]"
    >
      <!-- Column Header -->
      <div class="flex items-center justify-between mb-4 px-1">
        <div class="flex items-center gap-2">
          <span :class="['w-2.5 h-2.5 rounded-full flex-shrink-0', column.dotColor]"></span>
          <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 m-0">
            {{ column.name }}
          </h3>
        </div>
        <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/60 text-slate-500 dark:bg-slate-850 dark:text-slate-400">
          {{ getTasksByStatus(column.status).length }}
        </span>
      </div>

      <!-- Column Content / Cards List -->
      <div class="flex-1 space-y-3.5 overflow-y-auto">
        <TaskCard 
          v-for="task in getTasksByStatus(column.status)" 
          :key="task.id" 
          :task="task" 
          @edit="$emit('edit-task', $event)"
          @delete="$emit('delete-task', $event)"
          @drag-change="isDragging = $event"
        />
        
        <!-- Empty Column Placeholder -->
        <div 
          v-if="getTasksByStatus(column.status).length === 0" 
          class="h-28 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center text-center p-4 text-slate-400 dark:text-slate-600 transition-colors"
          :class="isDragging ? 'border-primary-400/50 bg-slate-100/50 dark:bg-slate-900/10' : ''"
        >
          <InboxIcon class="w-5 h-5 mb-1 opacity-70" />
          <span class="text-[10px] font-semibold uppercase tracking-wider">Empty Lane</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Inbox as InboxIcon } from 'lucide-vue-next'
import TaskCard from './TaskCard.vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['task-moved', 'edit-task', 'delete-task'])

const activeDragOverLane = ref(null)
const isDragging = ref(false)

const columns = [
  { name: 'Pending', status: 'Pending', dotColor: 'bg-slate-400 dark:bg-slate-500' },
  { name: 'In Progress', status: 'In Progress', dotColor: 'bg-blue-500' },
  { name: 'Review', status: 'Review', dotColor: 'bg-amber-500' },
  { name: 'Completed', status: 'Completed', dotColor: 'bg-emerald-500' }
]

function getTasksByStatus(status) {
  return props.tasks.filter(t => t.status === status)
}

function handleDragOver(e) {
  // Required to allow drop triggering
  e.dataTransfer.dropEffect = 'move'
}

function handleDragEnter(status) {
  activeDragOverLane.value = status
}

function handleDragLeave(status) {
  if (activeDragOverLane.value === status) {
    activeDragOverLane.value = null
  }
}

function handleDrop(e, status) {
  activeDragOverLane.value = null
  const taskId = e.dataTransfer.getData('text/plain')
  if (taskId) {
    emit('task-moved', { taskId, status })
  }
}
</script>
