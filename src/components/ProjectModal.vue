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

    <!-- Modal Box Container -->
    <div v-if="isOpen" class="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
      <transition name="scale" appear>
        <div class="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 animate-slide-up">
          
          <!-- Header -->
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 dark:text-white m-0">
              {{ isEditMode ? 'Edit Project' : 'Create New Project' }}
            </h3>
            <button 
              @click="$emit('close')"
              class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <XIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Form Area -->
          <form @submit.prevent="handleSubmit" class="p-6 space-y-4 flex-1">
            <!-- Project Title -->
            <div class="space-y-1">
              <label for="proj-title" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Project Title <span class="text-red-500">*</span>
              </label>
              <input 
                id="proj-title"
                v-model="form.title"
                type="text"
                placeholder="e.g. Acme Redesign Layout"
                :class="[
                  'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all',
                  errors.title ? 'form-input-error' : ''
                ]"
              />
              <span v-if="errors.title" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
                <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.title }}
              </span>
            </div>

            <!-- Description -->
            <div class="space-y-1">
              <label for="proj-desc" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Description
              </label>
              <textarea 
                id="proj-desc"
                v-model="form.description"
                rows="4"
                placeholder="Provide details about the goals and milestones for the team..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              ></textarea>
            </div>

            <!-- Project Status (Only visible in edit mode) -->
            <div v-if="isEditMode" class="space-y-1">
              <label for="proj-status" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Status
              </label>
              <select 
                id="proj-status"
                v-model="form.status"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                <option value="Active">Active</option>
                <option value="Planning">Planning</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
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
                {{ isEditMode ? 'Save Changes' : 'Create Project' }}
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
import { X as XIcon, AlertCircle as AlertCircleIcon, Save as SaveIcon, Loader as LoaderIcon } from 'lucide-vue-next'
import { z } from 'zod'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  project: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const isEditMode = computed(() => !!props.project)

const form = ref({
  title: '',
  description: '',
  status: 'Active'
})

const errors = ref({
  title: ''
})

// Validation Schema
const projectSchema = z.object({
  title: z.string().trim().min(3, { message: 'Title must be at least 3 characters long' })
})

// Sync form values on project prop change
watch(() => props.project, (newVal) => {
  if (newVal) {
    form.value = {
      title: newVal.title || '',
      description: newVal.description || '',
      status: newVal.status || 'Active'
    }
  } else {
    form.value = {
      title: '',
      description: '',
      status: 'Active'
    }
  }
  errors.value = { title: '' }
}, { immediate: true })

watch(() => props.isOpen, (newOpen) => {
  if (newOpen && !props.project) {
    // Reset to initial
    form.value = {
      title: '',
      description: '',
      status: 'Active'
    }
    errors.value = { title: '' }
  }
})

function handleSubmit() {
  errors.value = { title: '' }
  
  // Validate schema
  const result = projectSchema.safeParse(form.value)
  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors
    if (errorMap.title) {
      errors.value.title = errorMap.title[0]
    }
    return
  }

  emit('save', { ...form.value })
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
