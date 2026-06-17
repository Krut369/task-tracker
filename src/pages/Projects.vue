<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white m-0">Projects Directory</h2>
        <p class="text-xs text-slate-400 mt-1">
          Manage workspace streams, track completion milestones, and view team operations.
        </p>
      </div>

      <!-- Create Project button (Admin only) -->
      <button 
        v-if="isAdmin"
        @click="openCreateModal"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer self-start sm:self-auto"
      >
        <PlusIcon class="w-4 h-4" />
        New Project
      </button>
    </div>

    <!-- Filters Panel -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm transition-colors duration-300">
      <div class="w-full md:max-w-xs relative">
        <SearchIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search projects by name..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto">
        <label for="status-filter" class="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Filter Status:</label>
        <select 
          id="status-filter"
          v-model="statusFilter"
          class="w-full md:w-40 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="All">All Statuses</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>
      </div>
    </div>

    <!-- Loading screen -->
    <LoadingSkeleton v-if="isLoadingProjects || isLoadingTasks" type="card" :count="3" />

    <!-- Error state -->
    <ErrorState 
      v-else-if="isErrorProjects || isErrorTasks" 
      error-message="Failed to load project streams."
      @retry="refetchAll"
    />

    <!-- Empty State -->
    <EmptyState 
      v-else-if="filteredProjects.length === 0" 
      title="No projects found" 
      description="We couldn't find any projects matching your parameters. Create one to begin tracking."
      :action-text="isAdmin ? 'Create Project' : ''"
      @action="openCreateModal"
    />

    <!-- Projects Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="proj in filteredProjects" 
        :key="proj.id"
        @click="$router.push(`/projects/${proj.id}`)"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between interactive-card cursor-pointer relative group"
      >
        <div>
          <!-- Title & Status -->
          <div class="flex items-start justify-between gap-3 mb-2">
            <h3 class="text-sm font-bold text-slate-950 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 m-0">
              {{ proj.title }}
            </h3>
            
            <span 
              :class="[
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                statusClasses[proj.status] || 'bg-slate-100 text-slate-700'
              ]"
            >
              {{ proj.status }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-400 dark:text-slate-500 line-clamp-3 mb-5 leading-relaxed">
            {{ proj.description || 'No project goals or description details supplied.' }}
          </p>
        </div>

        <div class="space-y-4">
          <!-- Completion Progress bar -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide">
              <span>Task Progress</span>
              <span>{{ getProjectProgress(proj.id) }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary-500 rounded-full transition-all duration-500"
                :style="{ width: `${getProjectProgress(proj.id)}%` }"
              ></div>
            </div>
          </div>

          <!-- Card Footer Metadata -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-semibold text-slate-400">
            <!-- Count details -->
            <div class="flex items-center gap-1">
              <TasksIcon class="w-3.5 h-3.5 text-slate-450" />
              <span>{{ getTasksCount(proj.id) }} tasks</span>
            </div>

            <!-- Creator -->
            <div v-if="proj.creator" class="flex items-center gap-1.5">
              <span class="text-[9px]">By {{ proj.creator.full_name.split(' ')[0] }}</span>
              <img 
                :src="proj.creator.avatar_url" 
                :alt="proj.creator.full_name" 
                class="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        </div>

        <!-- Quick actions for Admin (Show on hover) -->
        <div v-if="isAdmin" class="opacity-0 group-hover:opacity-100 absolute top-4 right-4 flex items-center gap-1.5 bg-white dark:bg-slate-900 pl-2 transition-all">
          <button 
            @click.stop="openEditModal(proj)" 
            class="p-1 rounded text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
            title="Edit Project"
          >
            <EditIcon class="w-3.5 h-3.5" />
          </button>
          
          <button 
            @click.stop="handleDelete(proj.id)" 
            class="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-850 cursor-pointer"
            title="Delete Project"
          >
            <TrashIcon class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Project Modal form -->
    <ProjectModal 
      :is-open="modalOpen"
      :project="activeProject"
      :loading="mutationLoading"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { 
  Plus as PlusIcon, 
  Search as SearchIcon, 
  Briefcase as BriefcaseIcon, 
  Edit as EditIcon, 
  Trash2 as TrashIcon,
  ListTodo as TasksIcon
} from 'lucide-vue-next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../stores/auth'
import { dbService } from '../services/dbService'
import ProjectModal from '../components/ProjectModal.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const authStore = useAuthStore()
const queryClient = useQueryClient()

const isAdmin = computed(() => authStore.isAdmin)

const searchQuery = ref('')
const statusFilter = ref('All')

const modalOpen = ref(false)
const activeProject = ref(null)
const mutationLoading = ref(false)

// --- QUERIES ---
const { 
  data: projects, 
  isLoading: isLoadingProjects, 
  isError: isErrorProjects, 
  refetch: refetchProjects 
} = useQuery({
  queryKey: ['projects'],
  queryFn: dbService.getProjects
})

const { 
  data: tasks, 
  isLoading: isLoadingTasks, 
  isError: isErrorTasks, 
  refetch: refetchTasks 
} = useQuery({
  queryKey: ['tasks'],
  queryFn: () => dbService.getTasks()
})

function refetchAll() {
  refetchProjects()
  refetchTasks()
}

// --- MUTATIONS ---
const createMutation = useMutation({
  mutationFn: dbService.createProject,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    closeModal()
  }
})

const updateMutation = useMutation({
  mutationFn: ({ id, updates }) => dbService.updateProject(id, updates),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    closeModal()
  }
})

const deleteMutation = useMutation({
  mutationFn: dbService.deleteProject,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
  }
})

// --- COMPUTED FILTERS ---
const filteredProjects = computed(() => {
  const projs = projects.value || []
  return projs.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesStatus = statusFilter.value === 'All' || p.status === statusFilter.value
    
    return matchesSearch && matchesStatus
  })
})

const statusClasses = {
  Planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
  Active: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  'On Hold': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
}

// Helper methods to calculate task details dynamically
function getProjectTasks(projectId) {
  const tks = tasks.value || []
  return tks.filter(t => t.project_id === projectId)
}

function getTasksCount(projectId) {
  return getProjectTasks(projectId).length
}

function getProjectProgress(projectId) {
  const projTasks = getProjectTasks(projectId)
  if (projTasks.length === 0) return 0
  const completed = projTasks.filter(t => t.status === 'Completed').length
  return Math.round((completed / projTasks.length) * 100)
}

// --- MODAL TRIGGERS ---
function openCreateModal() {
  activeProject.value = null
  modalOpen.value = true
}

function openEditModal(proj) {
  activeProject.value = proj
  modalOpen.value = true
}

function closeModal() {
  modalOpen.value = false
  activeProject.value = null
  mutationLoading.value = false
}

async function handleSave(formData) {
  mutationLoading.value = true
  try {
    if (activeProject.value) {
      // Edit mode
      await updateMutation.mutateAsync({
        id: activeProject.value.id,
        updates: formData
      })
    } else {
      // Create mode
      await createMutation.mutateAsync({
        ...formData,
        created_by: authStore.userProfile?.id
      })
    }
  } catch (err) {
    console.error('Project save error:', err)
  } finally {
    mutationLoading.value = false
  }
}

async function handleDelete(id) {
  if (confirm('Are you sure you want to delete this project? This will permanently delete all associated tasks, comments, and attachments.')) {
    try {
      await deleteMutation.mutateAsync(id)
    } catch (err) {
      console.error('Delete project failed:', err)
    }
  }
}
</script>
