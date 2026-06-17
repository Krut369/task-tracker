<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-black text-slate-900 dark:text-white m-0">Team Directory</h2>
      <p class="text-xs text-slate-400 mt-1">
        Monitor team statistics, project loads, and track overall productivity indices.
      </p>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm">
      <div class="w-full sm:max-w-xs relative">
        <SearchIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search members by name..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      <div class="flex items-center gap-3 w-full sm:w-auto">
        <label for="sort-member" class="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide whitespace-nowrap">Sort By:</label>
        <select 
          id="sort-member"
          v-model="sortBy"
          class="w-full sm:w-44 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        >
          <option value="name">Name (Alphabetical)</option>
          <option value="completions">Completions Count</option>
          <option value="progress">Average Progress</option>
        </select>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <LoadingSkeleton v-if="isLoadingProfiles || isLoadingTasks" type="list" :count="4" />

    <!-- Error State -->
    <ErrorState 
      v-else-if="isErrorProfiles || isErrorTasks" 
      error-message="Failed to fetch team directories."
      @retry="refetchAll"
    />

    <!-- Empty State -->
    <EmptyState 
      v-else-if="sortedTeam.length === 0"
      title="No members found"
      description="We couldn't locate any profiles matching your search parameters."
    />

    <!-- Team Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="user in sortedTeam" 
        :key="user.id"
        class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between interactive-card transition-colors duration-300"
      >
        <!-- Header Info -->
        <div class="flex items-start gap-4 mb-4">
          <img 
            :src="user.avatarUrl" 
            :alt="user.fullName" 
            class="w-12 h-12 rounded-2xl object-cover border border-slate-100 dark:border-slate-800"
          />
          <div class="min-w-0">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white truncate m-0">
              {{ user.fullName }}
            </h3>
            <p class="text-[10px] text-slate-400 font-semibold truncate">{{ user.email }}</p>
            
            <span 
              :class="[
                'inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider mt-1.5',
                roleClasses[user.role] || 'bg-slate-100 text-slate-600'
              ]"
            >
              {{ user.role }}
            </span>
          </div>
        </div>

        <!-- Performance Stats -->
        <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div class="grid grid-cols-3 gap-2 text-center">
            <!-- Active Tasks -->
            <div class="space-y-0.5 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-850/80">
              <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Assigned</span>
              <div class="text-sm font-black text-slate-800 dark:text-white">{{ user.assignedCount }}</div>
            </div>
            
            <!-- Completions -->
            <div class="space-y-0.5 bg-slate-50 dark:bg-slate-955 p-2 rounded-xl border border-slate-100 dark:border-slate-850/80">
              <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Completed</span>
              <div class="text-sm font-black text-emerald-600 dark:text-emerald-400">{{ user.completedCount }}</div>
            </div>

            <!-- Index -->
            <div class="space-y-0.5 bg-slate-50 dark:bg-slate-955 p-2 rounded-xl border border-slate-100 dark:border-slate-850/80">
              <span class="text-[8px] font-bold text-slate-400 uppercase tracking-wide">Rating</span>
              <div class="text-sm font-black text-primary-500">{{ user.ratingScore }}</div>
            </div>
          </div>

          <!-- Average Progress Bar -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
              <span>Avg Task Progress</span>
              <span>{{ user.avgProgress }}%</span>
            </div>
            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                class="h-full bg-primary-500 rounded-full transition-all duration-500"
                :style="{ width: `${user.avgProgress}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search as SearchIcon, Users as UsersIcon, Star as StarIcon } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { authService } from '../services/authService'
import { dbService } from '../services/dbService'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const searchQuery = ref('')
const sortBy = ref('name')

// --- QUERIES ---
const {
  data: profiles,
  isLoading: isLoadingProfiles,
  isError: isErrorProfiles,
  refetch: refetchProfiles
} = useQuery({
  queryKey: ['profiles'],
  queryFn: authService.getProfiles
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
  refetchProfiles()
  refetchTasks()
}

// --- COMPUTED DATA TRANSFORMS ---
const evaluatedTeam = computed(() => {
  const users = profiles.value || []
  const tks = tasks.value || []

  return users.map(u => {
    const userTasks = tks.filter(t => t.assigned_to === u.id)
    const assignedCount = userTasks.length
    const completedCount = userTasks.filter(t => t.status === 'Completed').length
    
    const totalProgress = userTasks.reduce((sum, t) => sum + (t.progress || 0), 0)
    const avgProgress = assignedCount > 0 ? Math.round(totalProgress / assignedCount) : 0

    // Rating metric
    const ratingScore = Math.round((completedCount * 10) + (avgProgress * 0.5))

    return {
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.email}`,
      assignedCount,
      completedCount,
      avgProgress,
      ratingScore
    }
  })
})

const filteredTeam = computed(() => {
  const team = evaluatedTeam.value
  return team.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const sortedTeam = computed(() => {
  const list = [...filteredTeam.value]
  if (sortBy.value === 'name') {
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName))
  } else if (sortBy.value === 'completions') {
    return list.sort((a, b) => b.completedCount - a.completedCount)
  } else if (sortBy.value === 'progress') {
    return list.sort((a, b) => b.avgProgress - a.avgProgress)
  }
  return list
})

const roleClasses = {
  'Super Admin': 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/30',
  Admin: 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30',
  User: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30'
}
</script>
