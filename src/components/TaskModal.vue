<template>
  <div class="relative z-50">
    <!-- Backdrop Overlay -->
    <transition name="fade">
      <div 
        v-if="isOpen" 
        @click="$emit('close')"
        class="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
      ></div>
    </transition>

    <!-- Modal Box Wrapper -->
    <div v-if="isOpen" class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
      <transition name="scale" appear>
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 animate-slide-up">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div class="space-y-0.5">
              <h3 class="text-base font-bold text-slate-900 dark:text-white m-0">
                {{ isEditMode ? 'Edit Task Info' : 'Add New Task' }}
              </h3>
              <span v-if="isEditMode && task?.id" class="text-[9px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-wider block font-bold">
                Task ID: TASK-{{ task.task_number || task.id.substring(0, 8) }}
              </span>
            </div>
            <button 
              @click="$emit('close')"
              class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Scrollable Form Panel -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <!-- Title -->
            <div class="space-y-1">
              <label for="task-title" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Task Name <span class="text-red-500">*</span>
              </label>
              <input 
                id="task-title"
                v-model="form.title"
                type="text"
                placeholder="e.g. Design Login Schema"
                :class="[
                  'w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                  errors.title ? 'form-input-error' : ''
                ]"
              />
              <span v-if="errors.title" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.title }}
              </span>
            </div>

            <!-- Description -->
            <div class="space-y-1">
              <label for="task-desc" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Details & Steps
              </label>
              <textarea 
                id="task-desc"
                v-model="form.description"
                rows="3"
                placeholder="Detail what needs to be accomplished..."
                class="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              ></textarea>
            </div>

            <!-- Double Column layout -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Assignee -->
              <div class="space-y-1">
                <label for="task-assignee" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Assign To
                </label>
                <select 
                  id="task-assignee"
                  v-model="form.assigned_to"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Unassigned</option>
                  <option 
                    v-for="member in teamMembers" 
                    :key="member.id" 
                    :value="member.id"
                  >
                    {{ member.full_name }} ({{ member.role }})
                  </option>
                </select>
              </div>

              <!-- Priority -->
              <div class="space-y-1">
                <label for="task-priority" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Priority
                </label>
                <select 
                  id="task-priority"
                  v-model="form.priority"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <!-- Double Column 2 -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Due Date -->
              <div class="space-y-1">
                <label for="task-due" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Due Date
                </label>
                <input 
                  id="task-due"
                  v-model="form.due_date"
                  type="date"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <!-- Status -->
              <div class="space-y-1">
                <label for="task-status" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Status
                </label>
                <select 
                  id="task-status"
                  v-model="form.status"
                  class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <!-- Progress Slider -->
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                <span>Progress</span>
                <span class="text-primary-600 dark:text-primary-400 text-sm font-black">{{ form.progress }}%</span>
              </div>
              <input 
                v-model.number="form.progress"
                type="range"
                min="0"
                max="100"
                step="5"
                class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none"
              />
            </div>

            <!-- File Attachments Input -->
            <div class="space-y-1.5 border-t border-slate-100 dark:border-slate-850 pt-4 pb-1">
              <label class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center justify-between">
                <span>Task Attachments</span>
                <span class="text-[9px] text-slate-400 font-medium font-mono uppercase">Max 5MB per file</span>
              </label>
              
              <!-- Selected Files List -->
              <div v-if="selectedFiles.length > 0" class="space-y-2 mb-3">
                <div 
                  v-for="(file, idx) in selectedFiles" 
                  :key="idx"
                  class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div class="flex items-center gap-2 truncate">
                    <PaperclipIcon class="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span class="truncate font-semibold text-slate-700 dark:text-slate-300">{{ file.name }}</span>
                    <span class="text-[10px] text-slate-450 dark:text-slate-500">({{ formatBytes(file.size) }})</span>
                  </div>
                  <button 
                    type="button" 
                    @click="removeSelectedFile(idx)"
                    class="p-1 rounded-lg hover:bg-slate-250 dark:hover:bg-slate-800 text-slate-450 hover:text-red-650 cursor-pointer"
                  >
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- File Selection trigger button -->
              <label class="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-primary-600 hover:text-white dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 border border-primary-200/50 hover:bg-primary-600 dark:hover:bg-primary-600 rounded-xl transition-all cursor-pointer">
                <PaperclipIcon class="w-3.5 h-3.5" />
                Add Attachment
                <input 
                  type="file" 
                  multiple
                  @change="handleFileSelection" 
                  class="hidden" 
                  accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip" 
                />
              </label>
              <div v-if="fileError" class="text-xs text-red-500 font-semibold mt-1">
                {{ fileError }}
              </div>
            </div>

            <!-- Actions Footer -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-3">
              <button 
                type="button"
                @click="$emit('close')"
                class="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                :disabled="loading"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md shadow-primary-500/10"
              >
                <SaveIcon v-if="!loading" class="w-4 h-4" />
                <LoaderIcon v-else class="w-4 h-4 animate-spin" />
                {{ isEditMode ? 'Update Task' : 'Add Task' }}
              </button>
            </div>
          </form>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  X as XIcon, 
  AlertCircle as AlertCircleIcon, 
  Save as SaveIcon, 
  Loader as LoaderIcon,
  Paperclip as PaperclipIcon,
  Trash2 as TrashIcon
} from 'lucide-vue-next'
import { z } from 'zod'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  task: {
    type: Object,
    default: null
  },
  teamMembers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => !!props.task)

const form = ref({
  title: '',
  description: '',
  assigned_to: '',
  priority: 'Medium',
  status: 'Pending',
  progress: 0,
  due_date: ''
})

const errors = ref({
  title: ''
})

const selectedFiles = ref([])
const fileError = ref('')

// Schema definition
const taskSchema = z.object({
  title: z.string().trim().min(3, { message: 'Task name must be at least 3 characters long' }),
  progress: z.number().min(0).max(100)
})

// Sync form inputs when task prop is loaded
watch(() => props.task, (newVal) => {
  selectedFiles.value = []
  fileError.value = ''
  if (newVal) {
    form.value = {
      title: newVal.title || '',
      description: newVal.description || '',
      assigned_to: newVal.assigned_to || '',
      priority: newVal.priority || 'Medium',
      status: newVal.status || 'Pending',
      progress: newVal.progress ?? 0,
      due_date: newVal.due_date || ''
    }
  } else {
    form.value = {
      title: '',
      description: '',
      assigned_to: '',
      priority: 'Medium',
      status: 'Pending',
      progress: 0,
      due_date: ''
    }
  }
  errors.value = { title: '' }
}, { immediate: true })

watch(() => props.isOpen, (newOpen) => {
  selectedFiles.value = []
  fileError.value = ''
  if (newOpen && !props.task) {
    // Reset to defaults
    form.value = {
      title: '',
      description: '',
      assigned_to: '',
      priority: 'Medium',
      status: 'Pending',
      progress: 0,
      due_date: ''
    }
    errors.value = { title: '' }
  }
})

// Trigger completed progress rules on status update
watch(() => form.value.status, (newStatus) => {
  if (newStatus === 'Completed') {
    form.value.progress = 100
  } else if (newStatus !== 'Completed' && form.value.progress === 100) {
    form.value.progress = 80
  }
})


function handleFileSelection(e) {
  fileError.value = ''
  const files = Array.from(e.target.files)
  
  const invalidFile = files.find(f => f.size > 5 * 1024 * 1024)
  if (invalidFile) {
    fileError.value = 'One or more files exceed the 5MB size limit.'
    return
  }

  selectedFiles.value = [...selectedFiles.value, ...files]
  e.target.value = ''
}

function removeSelectedFile(idx) {
  selectedFiles.value.splice(idx, 1)
}

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function handleSubmit() {
  errors.value = { title: '' }
  
  const result = taskSchema.safeParse(form.value)
  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors
    if (errorMap.title) {
      errors.value.title = errorMap.title[0]
    }
    return
  }

  const cleanAssignedTo = form.value.assigned_to === '' ? null : form.value.assigned_to
  const cleanDueDate = form.value.due_date === '' ? null : form.value.due_date

  emit('save', {
    ...form.value,
    assigned_to: cleanAssignedTo,
    due_date: cleanDueDate,
    files: selectedFiles.value
  })
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
