<template>
  <div class="space-y-6">
    <!-- Breadcrumb back link -->
    <div class="flex items-center gap-1.5 text-xs font-bold text-slate-400">
      <router-link to="/projects" class="hover:text-primary-500 transition-colors">Projects</router-link>
      <span>/</span>
      <span class="text-slate-600 dark:text-slate-300 font-black truncate max-w-[200px]">
        {{ project?.title || 'Details' }}
      </span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoadingProject || isLoadingTasks" class="space-y-6">
      <div class="h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse p-6"></div>
      <LoadingSkeleton type="board" />
    </div>

    <!-- Error State -->
    <ErrorState 
      v-else-if="isErrorProject || isErrorTasks"
      error-message="Failed to retrieve project detail scopes."
      @retry="refetchAll"
    />

    <!-- Main Views -->
    <div v-else-if="project" class="space-y-6">
      
      <!-- Project Metadata Header -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300">
        <div class="space-y-2 flex-1 min-w-0">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span 
              :class="[
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                statusClasses[project.status] || 'bg-slate-100 text-slate-700'
              ]"
            >
              {{ project.status }}
            </span>
            <span class="text-xs text-slate-400 font-bold">
              Created {{ new Date(project.created_at).toLocaleDateString() }}
            </span>
          </div>
          
          <h2 class="text-xl font-black text-slate-900 dark:text-white truncate m-0">
            {{ project.title }}
          </h2>
          
          <p class="text-xs text-slate-400 dark:text-slate-500 max-w-3xl leading-relaxed">
            {{ project.description || 'No goals or description details supplied.' }}
          </p>
        </div>

        <!-- Right actions/info -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4 flex-shrink-0 self-start md:self-auto">
          <!-- Team bubble indicators -->
          <div class="flex items-center">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-2.5">
              Assigned Team:
            </div>
            <div class="flex -space-x-2.5 overflow-hidden">
              <img 
                v-for="member in projectTeam" 
                :key="member.id"
                :src="member.avatar_url" 
                :alt="member.full_name"
                class="inline-block h-7.5 w-7.5 rounded-full object-cover ring-2 ring-white dark:ring-slate-900 border border-slate-100 dark:border-slate-850"
                :title="member.full_name"
              />
              <div 
                v-if="projectTeam.length === 0"
                class="text-xs text-slate-400 dark:text-slate-500 font-bold"
              >
                No members active
              </div>
            </div>
          </div>

          <!-- Add Task trigger (Admin only) -->
          <button 
            v-if="isAdmin"
            @click="openCreateTaskModal"
            class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer"
          >
            <PlusIcon class="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      <!-- Filters & search -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div class="w-full md:max-w-xs relative">
          <SearchIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            v-model="taskSearch"
            type="text" 
            placeholder="Search tasks..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        <div class="flex items-center gap-4 w-full md:w-auto justify-end">
          <div class="flex items-center gap-2.5 text-xs w-full md:w-auto">
            <label for="priority-filter" class="font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Priority:</label>
            <select 
              id="priority-filter"
              v-model="priorityFilter"
              class="w-full md:w-32 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Kanban Board -->
      <KanbanBoard 
        :tasks="filteredTasks"
        @task-moved="handleTaskMove"
        @edit-task="openEditTaskModal"
        @delete-task="handleTaskDelete"
      />
    </div>

    <!-- Task form Modal -->
    <TaskModal 
      :is-open="taskModalOpen"
      :task="activeTask"
      :team-members="teamProfiles || []"
      :loading="mutationLoading"
      @close="closeTaskModal"
      @save="handleTaskSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus as PlusIcon, Search as SearchIcon, ChevronLeft as ChevronLeftIcon } from 'lucide-vue-next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../stores/auth'
import { dbService } from '../services/dbService'
import { authService } from '../services/authService'
import { storageService } from '../services/storageService'
import KanbanBoard from '../components/KanbanBoard.vue'
import TaskModal from '../components/TaskModal.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import ErrorState from '../components/ErrorState.vue'

const route = useRoute()
const authStore = useAuthStore()
const queryClient = useQueryClient()

const projectId = route.params.id
const isAdmin = computed(() => authStore.isAdmin)

const taskSearch = ref('')
const priorityFilter = ref('All')

const taskModalOpen = ref(false)
const activeTask = ref(null)
const mutationLoading = ref(false)

// --- QUERIES ---
// Fetch current project detail from list
const { 
  data: projectList,
  isLoading: isLoadingProject,
  isError: isErrorProject,
  refetch: refetchProject
} = useQuery({
  queryKey: ['projects'],
  queryFn: dbService.getProjects
})

const project = computed(() => {
  const list = projectList.value || []
  return list.find(p => p.id === projectId)
})

// Fetch current project tasks
const {
  data: projectTasks,
  isLoading: isLoadingTasks,
  isError: isErrorTasks,
  refetch: refetchTasks
} = useQuery({
  queryKey: ['tasks', projectId],
  queryFn: () => dbService.getTasks(projectId)
})

// Fetch profiles for the task assignments modal
const {
  data: teamProfiles,
  refetch: refetchProfiles
} = useQuery({
  queryKey: ['profiles'],
  queryFn: authService.getProfiles
})

function refetchAll() {
  refetchProject()
  refetchTasks()
  refetchProfiles()
}

// --- MUTATIONS ---
const createTaskMutation = useMutation({
  mutationFn: dbService.createTask,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] }) // invalidate global task cache too
    closeTaskModal()
  }
})

const updateTaskMutation = useMutation({
  mutationFn: ({ id, updates }) => dbService.updateTask(id, updates),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    closeTaskModal()
  }
})

const deleteTaskMutation = useMutation({
  mutationFn: dbService.deleteTask,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }
})

// --- COMPUTED TEAM & FILTERS ---
// Get team profiles currently assigned to tasks in this project
const projectTeam = computed(() => {
  const tks = projectTasks.value || []
  const teamMap = new Map()
  
  tks.forEach(t => {
    if (t.assignee) {
      teamMap.set(t.assignee.id, t.assignee)
    }
  })
  
  return Array.from(teamMap.values())
})

const filteredTasks = computed(() => {
  const tks = projectTasks.value || []
  return tks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(taskSearch.value.toLowerCase()) || 
                          t.description?.toLowerCase().includes(taskSearch.value.toLowerCase())
    
    const matchesPriority = priorityFilter.value === 'All' || t.priority === priorityFilter.value
    
    return matchesSearch && matchesPriority
  })
})

const statusClasses = {
  Planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
  Active: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'On Hold': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
}

// --- TASK DRAG & DROP EVENT ---
async function handleTaskMove({ taskId, status }) {
  // Optmistic UI update helper could go here. For now, trigger standard mutate.
  try {
    await updateTaskMutation.mutateAsync({
      id: taskId,
      updates: { status }
    })
  } catch (err) {
    console.error('Drag update error:', err)
  }
}

// --- TASK FORM MODALS ACTIONS ---
function openCreateTaskModal() {
  activeTask.value = null
  taskModalOpen.value = true
}

function openEditTaskModal(task) {
  activeTask.value = task
  taskModalOpen.value = true
}

function closeTaskModal() {
  taskModalOpen.value = false
  activeTask.value = null
  mutationLoading.value = false
}

async function handleTaskSave(formData) {
  mutationLoading.value = true
  try {
    const files = formData.files || []
    delete formData.files

    let savedTask
    if (activeTask.value) {
      // Edit task
      savedTask = await updateTaskMutation.mutateAsync({
        id: activeTask.value.id,
        updates: formData
      })
    } else {
      // Create task
      savedTask = await createTaskMutation.mutateAsync({
        ...formData,
        project_id: projectId,
        assigned_by: authStore.userProfile?.id
      })
    }

    // Upload selected files if any
    if (files.length > 0 && savedTask?.id) {
      for (const file of files) {
        const uploadResult = await storageService.uploadAttachment(file, savedTask.id)
        await dbService.createAttachment({
          task_id: savedTask.id,
          uploaded_by: authStore.userProfile?.id,
          file_url: uploadResult.fileUrl,
          file_name: uploadResult.fileName,
          file_size: uploadResult.fileSize
        })
      }
      // Invalidate queries to reload attachments list if currently viewing
      queryClient.invalidateQueries({ queryKey: ['attachments', savedTask.id] })
    }
  } catch (err) {
    console.error('Save task error:', err)
  } finally {
    mutationLoading.value = false
  }
}

async function handleTaskDelete(id) {
  if (confirm('Are you sure you want to permanently delete this task and all comments/attachments?')) {
    try {
      await deleteTaskMutation.mutateAsync(id)
    } catch (err) {
      console.error('Delete task failed:', err)
    }
  }
}
</script>
