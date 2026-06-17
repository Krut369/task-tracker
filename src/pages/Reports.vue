<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-black text-slate-900 dark:text-white m-0">Analytics & Reports</h2>
        <p class="text-xs text-slate-400 mt-1">
          Export spreadsheet CSV reports and inspect operational logs across workspaces.
        </p>
      </div>

      <!-- Export CSV button -->
      <button 
        @click="handleExport"
        class="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 rounded-xl transition-all shadow-md shadow-primary-500/10 cursor-pointer self-start sm:self-auto"
      >
        <DownloadIcon class="w-4 h-4" />
        Export to CSV
      </button>
    </div>

    <!-- Report type tabs selector -->
    <div class="border-b border-slate-200 dark:border-slate-800 flex gap-4 overflow-x-auto pb-px">
      <button 
        v-for="tab in tabOptions" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="[
          'pb-3 text-xs font-bold uppercase tracking-wider transition-all relative cursor-pointer border-b-2 whitespace-nowrap px-1',
          activeTab === tab.id 
            ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-black' 
            : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        ]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Error State -->
    <ErrorState 
      v-if="isErrorProjects || isErrorTasks" 
      error-message="Failed to retrieve report data tables."
      @retry="refetchAll"
    />

    <!-- Loading Skeleton -->
    <div v-else-if="isLoadingProjects || isLoadingTasks" class="py-6 space-y-4">
      <LoadingSkeleton type="list" :count="4" />
    </div>

    <!-- Main Reports Content Tables -->
    <div v-else class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm overflow-hidden transition-colors duration-300">
      
      <!-- 1. USER PERFORMANCE TABLE -->
      <div v-if="activeTab === 'performance'" class="overflow-x-auto animate-fade-in">
        <table class="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400">
              <th class="py-3 px-3">Team Member</th>
              <th class="py-3 px-3">Role</th>
              <th class="py-3 px-3 text-center">Assigned Tasks</th>
              <th class="py-3 px-3 text-center">Completed</th>
              <th class="py-3 px-3 text-center">Avg Progress</th>
              <th class="py-3 px-3 text-right">Performance Score</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
            <tr v-for="user in userReportData" :key="user.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td class="py-3.5 px-3 flex items-center gap-2">
                <img :src="user.avatarUrl" :alt="user.fullName" class="w-6 h-6 rounded-full object-cover" />
                <span class="font-bold text-slate-850 dark:text-slate-100">{{ user.fullName }}</span>
              </td>
              <td class="py-3.5 px-3 text-slate-450">{{ user.role }}</td>
              <td class="py-3.5 px-3 text-center font-bold">{{ user.assigned }}</td>
              <td class="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-450 font-bold">{{ user.completed }}</td>
              <td class="py-3.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <span class="font-bold text-slate-800 dark:text-white">{{ user.avgProgress }}%</span>
                  <div class="w-12 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500" :style="{ width: `${user.avgProgress}%` }"></div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-3 text-right text-slate-900 dark:text-white font-black">{{ user.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 2. PROJECT PROGRESS TABLE -->
      <div v-else-if="activeTab === 'projects'" class="overflow-x-auto animate-fade-in">
        <table class="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400">
              <th class="py-3 px-3">Project Title</th>
              <th class="py-3 px-3">Status</th>
              <th class="py-3 px-3 text-center">Total Tasks</th>
              <th class="py-3 px-3 text-center">Completed</th>
              <th class="py-3 px-3 text-center">Completion Progress</th>
              <th class="py-3 px-3 text-right">Created Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
            <tr v-for="proj in projectReportData" :key="proj.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td class="py-3.5 px-3 font-bold text-slate-850 dark:text-slate-150">{{ proj.title }}</td>
              <td class="py-3.5 px-3">
                <span 
                  :class="[
                    'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                    statusBadgeClasses[proj.status] || 'bg-slate-100 text-slate-650'
                  ]"
                >
                  {{ proj.status }}
                </span>
              </td>
              <td class="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-white">{{ proj.tasksCount }}</td>
              <td class="py-3.5 px-3 text-center text-emerald-600 dark:text-emerald-450 font-bold">{{ proj.completedCount }}</td>
              <td class="py-3.5 px-3 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <span class="font-black text-slate-800 dark:text-white">{{ proj.progress }}%</span>
                  <div class="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-primary-500" :style="{ width: `${proj.progress}%` }"></div>
                  </div>
                </div>
              </td>
              <td class="py-3.5 px-3 text-right text-slate-450">{{ proj.created }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 3. TASK ANALYTICS TABLE -->
      <div v-else-if="activeTab === 'tasks'" class="overflow-x-auto animate-fade-in">
        <table class="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr class="border-b border-slate-100 dark:border-slate-800 text-slate-400">
              <th class="py-3 px-3">Task Name</th>
              <th class="py-3 px-3">Project</th>
              <th class="py-3 px-3">Assignee</th>
              <th class="py-3 px-3 text-center">Priority</th>
              <th class="py-3 px-3 text-center">Status</th>
              <th class="py-3 px-3 text-center">Progress</th>
              <th class="py-3 px-3 text-right">Due Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
            <tr v-for="t in taskReportData" :key="t.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td class="py-3.5 px-3 font-bold text-slate-850 dark:text-slate-150">{{ t.title }}</td>
              <td class="py-3.5 px-3 text-slate-450 max-w-[120px] truncate">{{ t.project }}</td>
              <td class="py-3.5 px-3 flex items-center gap-1.5">
                <img v-if="t.assignee" :src="t.assignee.avatar_url" class="w-5 h-5 rounded-full object-cover" />
                <span>{{ t.assigneeName }}</span>
              </td>
              <td class="py-3.5 px-3 text-center">
                <span 
                  :class="[
                    'px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider',
                    priorityBadgeClasses[t.priority] || 'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ t.priority }}
                </span>
              </td>
              <td class="py-3.5 px-3 text-center">
                <span 
                  :class="[
                    'px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider',
                    statusBadgeClasses[t.status] || 'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ t.status }}
                </span>
              </td>
              <td class="py-3.5 px-3 text-center font-bold text-slate-800 dark:text-white">{{ t.progress }}%</td>
              <td class="py-3.5 px-3 text-right text-slate-450">{{ t.dueDate }}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Download as DownloadIcon } from 'lucide-vue-next'
import { useQuery } from '@tanstack/vue-query'
import { dbService } from '../services/dbService'
import { authService } from '../services/authService'
import LoadingSkeleton from '../components/LoadingSkeleton.vue'
import ErrorState from '../components/ErrorState.vue'

const activeTab = ref('performance')

const tabOptions = [
  { id: 'performance', name: 'User Performance' },
  { id: 'projects', name: 'Project Progress' },
  { id: 'tasks', name: 'Task Analytics' }
]

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

const { 
  data: profiles, 
  refetch: refetchProfiles 
} = useQuery({
  queryKey: ['profiles'],
  queryFn: authService.getProfiles
})

function refetchAll() {
  refetchProjects()
  refetchTasks()
  refetchProfiles()
}

// --- REPORT COMPUTED TABLES TRANSFORMS ---
const userReportData = computed(() => {
  const users = profiles.value || []
  const tks = tasks.value || []

  return users.map(u => {
    const userTasks = tks.filter(t => t.assigned_to === u.id)
    const assigned = userTasks.length
    const completed = userTasks.filter(t => t.status === 'Completed').length
    const totalProgress = userTasks.reduce((sum, t) => sum + (t.progress || 0), 0)
    const avgProgress = assigned > 0 ? Math.round(totalProgress / assigned) : 0
    const score = Math.round((completed * 10) + (avgProgress * 0.5))

    return {
      id: u.id,
      fullName: u.full_name,
      avatarUrl: u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.email}`,
      email: u.email,
      role: u.role,
      assigned,
      completed,
      avgProgress,
      score
    }
  })
})

const projectReportData = computed(() => {
  const projs = projects.value || []
  const tks = tasks.value || []

  return projs.map(p => {
    const projTasks = tks.filter(t => t.project_id === p.id)
    const tasksCount = projTasks.length
    const completedCount = projTasks.filter(t => t.status === 'Completed').length
    const progress = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0
    const created = new Date(p.created_at).toLocaleDateString()

    return {
      id: p.id,
      title: p.title,
      status: p.status,
      tasksCount,
      completedCount,
      progress,
      created
    }
  })
})

const taskReportData = computed(() => {
  const tks = tasks.value || []
  return tks.map(t => {
    return {
      id: t.id,
      title: t.title,
      project: t.project?.title || 'Unknown',
      assignee: t.assignee,
      assigneeName: t.assignee?.full_name || 'Unassigned',
      priority: t.priority,
      status: t.status,
      progress: t.progress,
      dueDate: t.due_date || 'No Deadline'
    }
  })
})

// --- CSV GENERATOR ---
function handleExport() {
  let headers = []
  let rows = []
  let filename = 'report'

  if (activeTab.value === 'performance') {
    filename = 'user_performance_report'
    headers = ['Full Name', 'Email', 'Role', 'Assigned Tasks', 'Completed Tasks', 'Avg Task Progress (%)', 'Performance Score']
    rows = userReportData.value.map(u => [
      u.fullName,
      u.email,
      u.role,
      u.assigned,
      u.completed,
      u.avgProgress,
      u.score
    ])
  } else if (activeTab.value === 'projects') {
    filename = 'project_progress_report'
    headers = ['Project Name', 'Status', 'Total Tasks', 'Completed Tasks', 'Completion Progress (%)', 'Creation Date']
    rows = projectReportData.value.map(p => [
      p.title,
      p.status,
      p.tasksCount,
      p.completedCount,
      p.progress,
      p.created
    ])
  } else if (activeTab.value === 'tasks') {
    filename = 'task_analytics_report'
    headers = ['Task Name', 'Project', 'Assignee', 'Priority', 'Status', 'Progress (%)', 'Due Date']
    rows = taskReportData.value.map(t => [
      t.title,
      t.project,
      t.assigneeName,
      t.priority,
      t.status,
      t.progress,
      t.dueDate
    ])
  }

  // Create CSV String
  const csvString = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n')

  // Export as download download Blob link
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const statusBadgeClasses = {
  Planning: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
  Active: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  'On Hold': 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
  Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  Pending: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
  'In Progress': 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  Review: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
}

const priorityBadgeClasses = {
  Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400',
  Medium: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400',
  High: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400',
  Critical: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
}
</script>
