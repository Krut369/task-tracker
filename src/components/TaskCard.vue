<template>
  <div 
    draggable="true"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @click="$router.push(`/tasks/${task.id}`)"
    :class="[
      'p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl shadow-sm hover:shadow-md dark:hover:shadow-slate-950/50 cursor-grab active:cursor-grabbing interactive-card animate-fade-in group relative select-none',
      isDragging ? 'opacity-40 border-dashed border-primary-400' : ''
    ]"
  >
    <!-- Priority Badge -->
    <div class="flex items-center justify-between mb-2">
      <span 
        :class="[
          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
          priorityClasses[task.priority] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        ]"
      >
        {{ task.priority }}
      </span>
      
      <!-- Quick Edit Actions (Show on hover) -->
      <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 absolute top-3.5 right-4 z-10 bg-white dark:bg-slate-900 pl-2">
        <button 
          v-if="canEdit"
          @click.stop="$emit('edit', task)"
          class="p-1 rounded text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Edit Task"
        >
          <EditIcon class="w-3.5 h-3.5" />
        </button>
        
        <button 
          v-if="canDelete"
          @click.stop="$emit('delete', task.id)"
          class="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Delete Task"
        >
          <TrashIcon class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Title and Description -->
    <h4 class="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 mb-1 leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
      {{ task.title }}
    </h4>
    <p v-if="task.description" class="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3.5 leading-relaxed">
      {{ task.description }}
    </p>

    <!-- Progress Line -->
    <div class="space-y-1 mb-3.5">
      <div class="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide">
        <span>Completion</span>
        <span>{{ task.progress }}%</span>
      </div>
      <div class="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary-500 rounded-full transition-all duration-500" 
          :style="{ width: `${task.progress}%` }"
        ></div>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-slate-400">
      <!-- Assignee avatar -->
      <div class="flex items-center gap-1.5">
        <img 
          v-if="task.assignee"
          :src="task.assignee.avatar_url" 
          :alt="task.assignee.full_name"
          class="w-6 h-6 rounded-full object-cover ring-2 ring-slate-50 dark:ring-slate-900"
          :title="`Assigned to: ${task.assignee.full_name}`"
        />
        <div 
          v-else 
          class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400"
          title="Unassigned"
        >
          <UserIcon class="w-3 h-3" />
        </div>
        <span v-if="task.assignee" class="text-[10px] font-semibold text-slate-400 dark:text-slate-500 max-w-[80px] truncate">
          {{ task.assignee.full_name.split(' ')[0] }}
        </span>
      </div>

      <!-- Dates and Comments counts -->
      <div class="flex items-center gap-2.5 text-[10px] font-semibold">
        <!-- Due Date -->
        <span 
          v-if="task.due_date" 
          :class="[
            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border',
            isOverdue && task.status !== 'Completed'
              ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
              : 'bg-slate-50 border-slate-100 dark:bg-slate-950/20 dark:border-slate-800'
          ]"
        >
          <CalendarIcon class="w-3 h-3" />
          {{ formatDueDate(task.due_date) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  User as UserIcon, 
  Calendar as CalendarIcon, 
  Edit2 as EditIcon, 
  Trash2 as TrashIcon 
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'drag-change'])

const authStore = useAuthStore()
const isDragging = ref(false)

const canEdit = computed(() => authStore.isAdmin || authStore.userProfile?.id === props.task.assigned_by)
const canDelete = computed(() => authStore.isAdmin)

const isOverdue = computed(() => {
  if (!props.task.due_date) return false
  const today = new Date().setHours(0, 0, 0, 0)
  const due = new Date(props.task.due_date).setHours(0, 0, 0, 0)
  return due < today
})

const priorityClasses = {
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  High: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  Critical: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/30 animate-pulse'
}

function handleDragStart(e) {
  isDragging.value = true
  e.dataTransfer.setData('text/plain', props.task.id)
  e.dataTransfer.effectAllowed = 'move'
  emit('drag-change', true)
}

function handleDragEnd() {
  isDragging.value = false
  emit('drag-change', false)
}

function formatDueDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
</script>
