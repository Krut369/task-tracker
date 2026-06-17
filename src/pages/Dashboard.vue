<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white m-0">
          Hello, {{ userProfile?.fullName.split(' ')[0] }}
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Here is what's happening with your workspace and team performance today.
        </p>
      </div>
      
      <!-- Date stamp -->
      <div class="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-sm self-start">
        <CalendarIcon class="w-4 h-4 text-primary-500" />
        {{ currentFormattedDate }}
      </div>
    </div>

    <!-- Error State -->
    <ErrorState 
      v-if="isErrorProjects || isErrorTasks" 
      error-message="Failed to retrieve latest workspace analytics."
      @retry="refetchAll"
    />

    <!-- Loading Skeleton state -->
    <div v-else-if="isLoadingProjects || isLoadingTasks" class="space-y-6">
      <LoadingSkeleton type="stats" :count="4" />
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LoadingSkeleton type="chart" class="lg:col-span-2" />
        <LoadingSkeleton type="card" :count="1" />
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="space-y-6">
      
      <!-- ==================== ADMIN & SUPER ADMIN VIEW ==================== -->
      <div v-if="isAdmin" class="space-y-6 animate-fade-in">
        <!-- Stats Widgets -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <!-- Total Projects -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Total Projects</span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.totalProjects }}</h3>
              <p class="text-[10px] text-slate-400 font-medium">Across all workspaces</p>
            </div>
            <div class="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/35 dark:text-blue-400">
              <FolderIcon class="w-6 h-6" />
            </div>
          </div>

          <!-- Total Tasks -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Active Tasks</span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.totalTasks }}</h3>
              <p class="text-[10px] text-slate-400 font-medium">Pending status or in-progress</p>
            </div>
            <div class="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/35 dark:text-purple-400">
              <TasksIcon class="w-6 h-6" />
            </div>
          </div>

          <!-- Completed Tasks -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Completed</span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ stats.completedTasks }}</h3>
              <p class="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUpIcon class="w-3.5 h-3.5" /> {{ stats.completionRate }}% success rate
              </p>
            </div>
            <div class="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400">
              <CheckCircleIcon class="w-6 h-6" />
            </div>
          </div>

          <!-- Overdue Tasks -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Overdue</span>
              <h3 class="text-2xl font-black text-red-600 dark:text-red-400">{{ stats.overdueTasks }}</h3>
              <p class="text-[10px] text-slate-400 font-medium">Requires immediate action</p>
            </div>
            <div class="p-3 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/35 dark:text-red-400">
              <AlertCircleIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Productivity Bar Chart -->
          <DashboardChart 
            type="bar" 
            title="Team Task Distribution"
            subtitle="Number of tasks assigned to each user"
            :chart-data="stats.teamChartData"
            class="lg:col-span-2"
          />

          <!-- Task Status Donut -->
          <DashboardChart 
            type="donut" 
            title="Task Completion Ratio"
            subtitle="Distribution across workflow states"
            :chart-data="stats.statusChartData"
          />
        </div>

        <!-- Leaderboard & Recent Activities -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Leaderboard / Team performance -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col">
            <div class="mb-4">
              <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">Team Performance</h3>
              <p class="text-xs text-slate-400 mt-0.5">Ranking of team members by task completions</p>
            </div>

            <div class="flex-1 overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                    <th class="py-2.5 pb-3">User</th>
                    <th class="py-2.5 pb-3 text-center">Assigned</th>
                    <th class="py-2.5 pb-3 text-center">Completed</th>
                    <th class="py-2.5 pb-3 text-center">Avg Progress</th>
                    <th class="py-2.5 pb-3 text-right">Performance Index</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                  <tr v-for="user in leaderboard" :key="user.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td class="py-3 flex items-center gap-2">
                      <img :src="user.avatarUrl" :alt="user.fullName" class="w-7 h-7 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
                      <div>
                        <div class="font-bold text-slate-850 dark:text-slate-200">{{ user.fullName }}</div>
                        <div class="text-[10px] text-slate-400 font-medium">{{ user.role }}</div>
                      </div>
                    </td>
                    <td class="py-3 text-center text-slate-800 dark:text-white font-bold">{{ user.assignedCount }}</td>
                    <td class="py-3 text-center text-emerald-600 dark:text-emerald-400 font-bold">{{ user.completedCount }}</td>
                    <td class="py-3 text-center">
                      <div class="flex items-center justify-center gap-1.5">
                        <span class="font-black text-slate-800 dark:text-white">{{ user.avgProgress }}%</span>
                        <div class="w-10 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div class="h-full bg-primary-500" :style="{ width: `${user.avgProgress}%` }"></div>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 text-right text-slate-800 dark:text-white font-black">
                      <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">{{ user.indexRating }}</span>
                    </td>
                  </tr>
                  <tr v-if="leaderboard.length === 0">
                    <td colspan="5" class="py-8 text-center text-slate-450">No users found to evaluate.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Recent Activity Feed -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">Recent Activities</h3>
                <p class="text-xs text-slate-400 mt-0.5">Platform actions logs</p>
              </div>
              <ActivityIcon class="w-4 h-4 text-slate-400" />
            </div>

            <div class="flex-1 overflow-y-auto space-y-4 max-h-[300px]">
              <div 
                v-for="act in recentActivities" 
                :key="act.id" 
                class="flex gap-3 text-xs"
              >
                <div class="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></div>
                <div class="space-y-1">
                  <p class="text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
                    {{ act.message }}
                  </p>
                  <span class="text-[9px] text-slate-400 font-bold block">{{ act.time }}</span>
                </div>
              </div>
              
              <div v-if="recentActivities.length === 0" class="text-center py-8 text-slate-400">
                No recent platform activities recorded.
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- ==================== USER / EMPLOYEE VIEW ==================== -->
      <div v-else class="space-y-6 animate-fade-in">
        <!-- Personal stats grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <!-- Total Assigned -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">My Assigned Tasks</span>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white">{{ userStats.assigned }}</h3>
              <p class="text-[10px] text-slate-400 font-medium">Pending or in work status</p>
            </div>
            <div class="p-3 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/35 dark:text-blue-400">
              <TasksIcon class="w-6 h-6" />
            </div>
          </div>

          <!-- Tasks Due Today -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Due Today</span>
              <h3 class="text-2xl font-black" :class="userStats.dueToday > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'">{{ userStats.dueToday }}</h3>
              <p class="text-[10px] text-slate-400 font-medium">Tasks reaching deadline today</p>
            </div>
            <div class="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400">
              <ClockIcon class="w-6 h-6" />
            </div>
          </div>

          <!-- Completed Tasks -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between interactive-card">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-450 dark:text-slate-550 uppercase tracking-wider">Completed</span>
              <h3 class="text-2xl font-black text-emerald-600 dark:text-emerald-400">{{ userStats.completed }}</h3>
              <p class="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                <TrendingUpIcon class="w-3.5 h-3.5" /> {{ userStats.completionRate }}% personal rate
              </p>
            </div>
            <div class="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400">
              <CheckCircleIcon class="w-6 h-6" />
            </div>
          </div>
        </div>

        <!-- Main employee panel -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Assigned Tasks Focus Listing -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col">
            <div class="mb-5 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">My Priority Tasks</h3>
                <p class="text-xs text-slate-400 mt-0.5">Quick update controls for active task items</p>
              </div>
              <router-link to="/projects" class="text-xs font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline">
                View Kanban Board
              </router-link>
            </div>

            <!-- Task rows list -->
            <div class="flex-1 space-y-3">
              <div 
                v-for="task in userStats.activeTasksList" 
                :key="task.id"
                class="p-4 rounded-xl border border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 hover:bg-slate-50/20 dark:hover:bg-slate-800/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 cursor-pointer"
                @click="$router.push(`/tasks/${task.id}`)"
              >
                <div class="space-y-1 flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span 
                      :class="[
                        'px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider',
                        task.priority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/35 dark:text-red-400' :
                        task.priority === 'High' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/35 dark:text-amber-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-950/35 dark:text-blue-400'
                      ]"
                    >
                      {{ task.priority }}
                    </span>
                    <span class="text-[10px] text-slate-400 font-semibold truncate max-w-[120px]">
                      {{ task.project?.title }}
                    </span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white truncate m-0 mt-1">
                    {{ task.title }}
                  </h4>
                </div>

                <div class="flex items-center gap-4 justify-between sm:justify-end">
                  <!-- Progress Bar details -->
                  <div class="text-right space-y-1">
                    <div class="text-[10px] text-slate-400 font-bold">{{ task.progress }}% Complete</div>
                    <div class="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div class="h-full bg-primary-500 rounded-full" :style="{ width: `${task.progress}%` }"></div>
                    </div>
                  </div>

                  <!-- Date status -->
                  <div class="text-[10px] text-slate-400 font-bold flex items-center gap-1 min-w-[70px] justify-end">
                    <ClockIcon class="w-3.5 h-3.5 text-slate-400" />
                    {{ task.due_date ? task.due_date : 'No deadline' }}
                  </div>
                </div>
              </div>

              <!-- Empty personal state -->
              <EmptyState 
                v-if="userStats.activeTasksList.length === 0"
                title="No tasks on your plate!"
                description="You are fully caught up. Have a great day!"
              >
                <template #icon>
                  <CheckCircleIcon class="w-7 h-7 text-emerald-500" />
                </template>
              </EmptyState>
            </div>
          </div>

          <!-- Personal activity timeline -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">My Performance Score</h3>
                <p class="text-xs text-slate-400 mt-0.5">Task statistics comparison</p>
              </div>
              <ActivityIcon class="w-4 h-4 text-slate-400" />
            </div>

            <!-- Radial Performance Gauge -->
            <div class="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
              <div class="relative w-36 h-36 flex items-center justify-center">
                <!-- SVG Circle track -->
                <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-width="8" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-primary-500)" stroke-width="8" :stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (userStats.completionRate / 100) * 251.2" stroke-linecap="round" class="transition-all duration-1000 ease-out" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-black text-slate-950 dark:text-white">{{ userStats.completionRate }}%</span>
                  <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Rating</span>
                </div>
              </div>
              
              <div class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 max-w-[200px]">
                You have completed <strong class="text-slate-800 dark:text-white">{{ userStats.completed }}</strong> of your <strong class="text-slate-800 dark:text-white">{{ userStats.totalCount }}</strong> total assigned task scopes.
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Calendar as CalendarIcon, 
  Clock as ClockIcon,
  CheckCircle2 as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  TrendingUp as TrendingUpIcon,
  FolderDot as FolderIcon,
  ListTodo as TasksIcon,
  Activity as ActivityIcon
} from 'lucide-vue-next'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useAuthStore } from '../stores/auth'
import { dbService } from '../services/dbService'
import { authService } from '../services/authService'
import DashboardChart from '../components/DashboardChart.vue'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'

const authStore = useAuthStore()
const queryClient = useQueryClient()

const userProfile = computed(() => authStore.userProfile)
const isAdmin = computed(() => authStore.isAdmin)

// --- VUE QUERY HOOKS ---
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

const { 
  data: profiles, 
  refetch: refetchProfiles 
} = useQuery({
  queryKey: ['profiles'],
  queryFn: authService.getProfiles,
  enabled: computed(() => isAdmin.value) // only fetch user listing for admin dashboards
})

function refetchAll() {
  refetchProjects()
  refetchTasks()
  if (isAdmin.value) refetchProfiles()
}

// Format current date
const currentFormattedDate = computed(() => {
  return new Date().toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
})

// --- ADMIN STATS & COMPUTATIONS ---
const stats = computed(() => {
  const projs = projects.value || []
  const tks = tasks.value || []
  const users = profiles.value || []
  
  const totalProjects = projs.length
  const totalTasks = tks.length
  const completedTasks = tks.filter(t => t.status === 'Completed').length
  
  const today = new Date().setHours(0, 0, 0, 0)
  const overdueTasks = tks.filter(t => {
    if (t.status === 'Completed' || !t.due_date) return false
    const due = new Date(t.due_date).setHours(0, 0, 0, 0)
    return due < today
  }).length

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Chart data calculations
  // 1. Status Donut Chart
  const statusCounts = { Pending: 0, 'In Progress': 0, Review: 0, Completed: 0 }
  tks.forEach(t => {
    if (statusCounts[t.status] !== undefined) statusCounts[t.status]++
  })

  const statusChartData = [
    { label: 'Pending', value: statusCounts.Pending, color: '#94a3b8' },
    { label: 'In Progress', value: statusCounts['In Progress'], color: '#3b82f6' },
    { label: 'Review', value: statusCounts.Review, color: '#f59e0b' },
    { label: 'Completed', value: statusCounts.Completed, color: '#10b981' }
  ]

  // 2. Bar Chart (Tasks by User)
  const teamCounts = {}
  users.forEach(u => {
    teamCounts[u.full_name] = 0
  })
  
  tks.forEach(t => {
    if (t.assignee) {
      const name = t.assignee.full_name
      teamCounts[name] = (teamCounts[name] || 0) + 1
    }
  })

  // Format into { label, value } array, sort and take top 5
  const teamChartData = Object.keys(teamCounts).map(name => ({
    label: name.split(' ')[0], // first name for label fit
    value: teamCounts[name]
  })).slice(0, 6)

  // Fallback if empty
  if (teamChartData.length === 0) {
    teamChartData.push({ label: 'Unassigned', value: tks.filter(t => !t.assigned_to).length })
  }

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    completionRate,
    statusChartData,
    teamChartData
  }
})

// --- LEADERBOARD RANKS ---
const leaderboard = computed(() => {
  const users = profiles.value || []
  const tks = tasks.value || []

  return users.map(u => {
    const userTasks = tks.filter(t => t.assigned_to === u.id)
    const assignedCount = userTasks.length
    const completedCount = userTasks.filter(t => t.status === 'Completed').length
    const totalProgress = userTasks.reduce((sum, t) => sum + (t.progress || 0), 0)
    const avgProgress = assignedCount > 0 ? Math.round(totalProgress / assignedCount) : 0

    // Rating formula index
    const indexRating = Math.round((completedCount * 10) + (avgProgress * 0.5))

    return {
      id: u.id,
      fullName: u.full_name,
      role: u.role,
      avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.email}`,
      assignedCount,
      completedCount,
      avgProgress,
      indexRating
    }
  }).sort((a, b) => b.indexRating - a.indexRating).slice(0, 5) // top 5
})

// --- RECENT PLATFORM ACTIVITIES ---
const recentActivities = computed(() => {
  const tks = tasks.value || []
  const projs = projects.value || []

  // Combine projects and tasks updates, sort by date
  const items = []
  
  projs.forEach(p => {
    items.push({
      id: `p-${p.id}`,
      message: `Project "${p.title}" was registered in status: ${p.status}`,
      date: new Date(p.created_at),
      time: formatRelativeTime(p.created_at)
    })
  })

  tks.forEach(t => {
    items.push({
      id: `t-c-${t.id}`,
      message: `New task "${t.title}" assigned to ${t.assignee?.full_name || 'Unassigned'}`,
      date: new Date(t.created_at),
      time: formatRelativeTime(t.created_at)
    })
    
    if (t.status === 'Completed') {
      items.push({
        id: `t-comp-${t.id}`,
        message: `Task "${t.title}" was marked as completed`,
        date: new Date(t.created_at), // fallback
        time: 'Recently'
      })
    }
  })

  return items.sort((a, b) => b.date - a.date).slice(0, 5)
})

// --- EMPLOYEE STATS COMPUTATIONS ---
const userStats = computed(() => {
  const tks = tasks.value || []
  const myUserId = authStore.userProfile?.id
  
  const myTasks = tks.filter(t => t.assigned_to === myUserId)
  const totalCount = myTasks.length
  
  const activeTasksList = myTasks.filter(t => t.status !== 'Completed')
  const assigned = activeTasksList.length
  const completed = myTasks.filter(t => t.status === 'Completed').length
  
  const today = new Date().toISOString().split('T')[0]
  const dueToday = activeTasksList.filter(t => t.due_date === today).length
  
  const completionRate = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0

  return {
    totalCount,
    assigned,
    completed,
    dueToday,
    completionRate,
    activeTasksList
  }
})

function formatRelativeTime(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>
