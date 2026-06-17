<template>
  <div class="space-y-6">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-1.5 text-xs font-bold text-slate-400">
      <router-link to="/projects" class="hover:text-primary-500 transition-colors">Projects</router-link>
      <span>/</span>
      <router-link 
        v-if="task?.project" 
        :to="`/projects/${task.project.id}`" 
        class="hover:text-primary-500 transition-colors truncate max-w-[120px]"
      >
        {{ task.project.title }}
      </router-link>
      <span v-if="task?.project">/</span>
      <span class="text-slate-600 dark:text-slate-300 font-black truncate max-w-[150px]">
        {{ task?.title || 'Task' }}
      </span>
    </div>

    <!-- Loading screen -->
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-96"></div>
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl h-96"></div>
    </div>

    <!-- Error State -->
    <ErrorState 
      v-else-if="isError || !task"
      error-message="Failed to load task details."
      @retry="refetchAll"
    />

    <!-- Main View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      <!-- LEFT COLUMN: Task Attributes Form -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-300">
          
          <!-- Header and status -->
          <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div class="space-y-1.5">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Task ID: TASK-{{ task.task_number || task.id.substring(0,8) }}</span>
              <h2 class="text-lg font-black text-slate-900 dark:text-white leading-snug">
                {{ task.title }}
              </h2>
            </div>
            
            <div class="flex items-center gap-2 self-start">
              <span 
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                  priorityClasses[task.priority]
                ]"
              >
                {{ task.priority }} Priority
              </span>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2 mb-6">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</h4>
            <div class="text-xs leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/45 p-4 rounded-xl border border-slate-100 dark:border-slate-850/80 whitespace-pre-wrap">
              {{ task.description || 'No detailed steps or description provided for this task.' }}
            </div>
          </div>

          <!-- Attributes Editor form -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3">
            <!-- Status selector -->
            <div class="space-y-1">
              <label for="task-status" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</label>
              <select 
                id="task-status"
                :value="task.status"
                @change="updateAttribute('status', $event.target.value)"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer font-bold"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <!-- Priority selector -->
            <div class="space-y-1">
              <label for="task-priority" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</label>
              <select 
                id="task-priority"
                :value="task.priority"
                @change="updateAttribute('priority', $event.target.value)"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer font-bold"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <!-- Due Date selector -->
            <div class="space-y-1">
              <label for="task-due" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</label>
              <input 
                id="task-due"
                type="date"
                :value="task.due_date"
                @change="updateAttribute('due_date', $event.target.value || null)"
                class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-955 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer font-bold"
              />
            </div>

            <!-- Progress range slider -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Progress</span>
                <span class="text-primary-600 dark:text-primary-400 font-black">{{ task.progress }}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                step="5"
                :value="task.progress"
                @input="updateAttribute('progress', parseInt($event.target.value))"
                class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600 focus:outline-none mt-2"
              />
            </div>
          </div>

          <!-- Assignment meta -->
          <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div class="flex items-center gap-2.5">
              <div class="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Assignee:</div>
              <div v-if="task.assignee" class="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <img :src="task.assignee.avatar_url" class="w-5 h-5 rounded-full object-cover" />
                <span class="font-bold text-slate-800 dark:text-white">{{ task.assignee.full_name }}</span>
              </div>
              <span v-else class="text-slate-400 font-semibold italic">Unassigned</span>
            </div>

            <div class="flex items-center gap-2.5">
              <div class="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider text-[10px]">Assigned By:</div>
              <div v-if="task.assigner" class="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-850">
                <img :src="task.assigner.avatar_url" class="w-5 h-5 rounded-full object-cover" />
                <span class="font-bold text-slate-800 dark:text-white">{{ task.assigner.full_name }}</span>
              </div>
              <span v-else class="text-slate-400 font-semibold italic">Admin</span>
            </div>
          </div>
        </div>

        <!-- ATTACHMENTS PANEL -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-300">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">Task Attachments</h3>
              <p class="text-xs text-slate-400 mt-0.5">Upload document updates, logs, or preview images</p>
            </div>
            
            <!-- File Input Trigger -->
            <label class="px-3 py-1.5 text-[11px] font-bold text-primary-600 hover:text-white dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 border border-primary-200/50 hover:bg-primary-600 dark:hover:bg-primary-600 rounded-xl transition-all cursor-pointer flex items-center gap-1">
              <UploadIcon class="w-3.5 h-3.5" />
              Upload File
              <input 
                type="file" 
                @change="handleFileUpload" 
                class="hidden" 
                accept=".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip" 
              />
            </label>
          </div>

          <!-- Error uploading banner -->
          <div v-if="uploadError" class="mb-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-650 dark:text-red-400">
            {{ uploadError }}
          </div>

          <!-- Attachments grid list -->
          <div v-if="isLoadingAttachments" class="space-y-2 py-4">
            <div v-for="n in 2" :key="n" class="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg"></div>
          </div>

          <div v-else-if="attachments.length === 0" class="py-6 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
            <PaperclipIcon class="w-5 h-5 mb-1 opacity-70" />
            No attachments uploaded yet.
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              v-for="file in attachments" 
              :key="file.id"
              class="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center gap-3 relative group"
            >
              <!-- Thumbnail/Icon -->
              <div class="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                <img 
                  v-if="isImage(file.file_url)" 
                  :src="file.file_url" 
                  class="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                  @click="openLightbox(file.file_url)"
                />
                <FileIcon v-else class="w-5 h-5 text-slate-400" />
              </div>

              <!-- Metadata -->
              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate m-0">
                  {{ file.file_name }}
                </h4>
                <p class="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {{ formatBytes(file.file_size) }} • By {{ file.uploader?.full_name.split(' ')[0] || 'User' }}
                </p>
              </div>

              <!-- Attachment Actions -->
              <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 dark:bg-slate-950 pl-1.5 absolute right-3">
                <a 
                  :href="file.file_url" 
                  target="_blank" 
                  class="p-1 text-slate-450 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer" 
                  title="Download File"
                >
                  <DownloadIcon class="w-3.5 h-3.5" />
                </a>
                
                <button 
                  v-if="isAdmin || file.uploaded_by === authStore.userProfile?.id"
                  @click="handleDeleteAttachment(file.id)"
                  class="p-1 text-slate-450 hover:text-red-600 dark:hover:text-red-400 cursor-pointer"
                  title="Delete Attachment"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- RIGHT COLUMN: Collaboration Thread -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col h-[600px] shadow-sm transition-colors duration-300">
        <!-- Comments Header -->
        <div class="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">Task Comments</h3>
          <p class="text-xs text-slate-400 mt-0.5">Threaded updates and task discussion feed</p>
        </div>

        <!-- Thread listing -->
        <div class="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          <div v-if="isLoadingComments" class="space-y-4 py-4 animate-pulse">
            <div v-for="n in 3" :key="n" class="flex gap-3">
              <div class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800"></div>
              <div class="flex-1 space-y-2">
                <div class="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                <div class="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              </div>
            </div>
          </div>

          <div v-else-if="comments.length === 0" class="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
            <MessageSquareOffIcon class="w-6 h-6 mb-1 opacity-60" />
            No comments yet. Write a message below to start collaboration.
          </div>

          <div 
            v-else 
            v-for="comm in comments" 
            :key="comm.id"
            class="flex gap-3 text-xs"
          >
            <!-- User bubble -->
            <img 
              :src="comm.user?.avatar_url" 
              :alt="comm.user?.full_name" 
              class="w-7 h-7 rounded-full object-cover mt-0.5 border border-slate-100 dark:border-slate-800" 
            />
            
            <div class="flex-1 bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-100 dark:border-slate-850/50">
              <div class="flex items-center justify-between mb-1 gap-2">
                <span class="font-bold text-slate-900 dark:text-white truncate">
                  {{ comm.user?.full_name }}
                </span>
                <span class="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                  {{ formatCommentDate(comm.created_at) }}
                </span>
              </div>
              <p class="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold whitespace-pre-wrap">
                {{ comm.comment }}
              </p>
            </div>
          </div>
        </div>

        <!-- Post comment form -->
        <form @submit.prevent="handleCommentPost" class="mt-auto space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <textarea 
            v-model="commentText"
            rows="2"
            placeholder="Type comment message..."
            class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all leading-relaxed"
            required
          ></textarea>
          
          <div class="flex justify-end">
            <button 
              type="submit"
              :disabled="commentLoading"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all rounded-xl cursor-pointer shadow-md shadow-primary-500/10"
            >
              <SendIcon v-if="!commentLoading" class="w-3.5 h-3.5" />
              <LoaderIcon v-else class="w-3.5 h-3.5 animate-spin" />
              Comment
            </button>
          </div>
        </form>
      </div>

    </div>

    <!-- Image Lightbox Overlay -->
    <transition name="fade">
      <div 
        v-if="lightboxOpen" 
        @click="closeLightbox"
        class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
      >
        <img :src="lightboxUrl" class="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl animate-scale" />
        <button 
          @click="closeLightbox" 
          class="absolute top-4 right-4 p-2 rounded-full bg-slate-850 hover:bg-slate-700 text-white cursor-pointer"
        >
          <XIcon class="w-5 h-5" />
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  Paperclip as PaperclipIcon,
  MessageSquareOff as MessageSquareOffIcon,
  X as XIcon,
  Clock as ClockIcon,
  Send as SendIcon,
  Upload as UploadIcon,
  Loader as LoaderIcon,
  Check as CheckIcon,
  File as FileIcon,
  Download as DownloadIcon,
  Trash2 as TrashIcon
} from 'lucide-vue-next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../stores/auth'
import { dbService } from '../services/dbService'
import { storageService } from '../services/storageService'
import ErrorState from '../components/ErrorState.vue'

const route = useRoute()
const authStore = useAuthStore()
const queryClient = useQueryClient()

const taskId = route.params.id

const commentText = ref('')
const commentLoading = ref(false)

const uploadError = ref('')
const uploadLoading = ref(false)

const lightboxOpen = ref(false)
const lightboxUrl = ref('')

// --- QUERIES ---
// Task Details Query
const {
  data: task,
  isLoading,
  isError,
  refetch: refetchTask
} = useQuery({
  queryKey: ['task', taskId],
  queryFn: () => dbService.getTask(taskId)
})

// Comments Query
const {
  data: commentsData,
  isLoading: isLoadingComments,
  refetch: refetchComments
} = useQuery({
  queryKey: ['comments', taskId],
  queryFn: () => dbService.getComments(taskId)
})
const comments = computed(() => commentsData.value || [])

// Attachments Query
const {
  data: attachmentsData,
  isLoading: isLoadingAttachments,
  refetch: refetchAttachments
} = useQuery({
  queryKey: ['attachments', taskId],
  queryFn: () => dbService.getAttachments(taskId)
})
const attachments = computed(() => attachmentsData.value || [])

function refetchAll() {
  refetchTask()
  refetchComments()
  refetchAttachments()
}

// --- MUTATIONS ---
const updateTaskMutation = useMutation({
  mutationFn: ({ id, updates }) => dbService.updateTask(id, updates),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['task', taskId] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] }) // update boards too
  }
})

const createCommentMutation = useMutation({
  mutationFn: dbService.createComment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
  }
})

const createAttachmentMutation = useMutation({
  mutationFn: dbService.createAttachment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['attachments', taskId] })
  }
})

const deleteAttachmentMutation = useMutation({
  mutationFn: dbService.deleteAttachment,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['attachments', taskId] })
  }
})

// --- HELPERS ---
const isAdmin = computed(() => authStore.isAdmin)

const priorityClasses = {
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  High: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  Critical: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-450 border border-red-200 dark:border-red-900/30'
}

// Check if file is image for previews
function isImage(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif)/i.test(url) || url.startsWith('data:image/')
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function formatCommentDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// --- ACTIONS ---
async function updateAttribute(key, value) {
  const updates = { [key]: value }
  try {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates
    })
  } catch (err) {
    console.error('Failed to update task attribute:', err)
  }
}

async function handleCommentPost() {
  if (!commentText.value.trim()) return
  commentLoading.value = true
  try {
    await createCommentMutation.mutateAsync({
      task_id: taskId,
      user_id: authStore.userProfile?.id,
      comment: commentText.value.trim()
    })
    commentText.value = ''
  } catch (err) {
    console.error('Comment submit error:', err)
  } finally {
    commentLoading.value = false
  }
}

async function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  uploadError.value = ''
  
  // File size limit: 5MB
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = 'File size exceeds 5MB limit. Please compress or select another file.'
    return
  }

  uploadLoading.value = true
  try {
    // 1. Upload to storage
    const uploadResult = await storageService.uploadAttachment(file, taskId)
    
    // 2. Insert reference to DB
    await createAttachmentMutation.mutateAsync({
      task_id: taskId,
      uploaded_by: authStore.userProfile?.id,
      file_url: uploadResult.fileUrl,
      file_name: uploadResult.fileName,
      file_size: uploadResult.fileSize
    })
  } catch (err) {
    console.error('File upload failure:', err)
    uploadError.value = err.message || 'File upload failed. Please try again.'
  } finally {
    uploadLoading.value = false
    e.target.value = '' // clear input buffer
  }
}

async function handleDeleteAttachment(id) {
  if (confirm('Permanently delete this attachment reference?')) {
    try {
      await deleteAttachmentMutation.mutateAsync(id)
    } catch (err) {
      console.error('Delete attachment error:', err)
    }
  }
}

function openLightbox(url) {
  lightboxUrl.value = url
  lightboxOpen.value = true
}

function closeLightbox() {
  lightboxOpen.value = false
  lightboxUrl.value = ''
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.animate-scale {
  animation: scale-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes scale-up {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
