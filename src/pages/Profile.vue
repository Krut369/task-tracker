<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-black text-slate-900 dark:text-white m-0">My Profile Settings</h2>
      <p class="text-xs text-slate-400 mt-1">
        Update your personal details, choose custom avatars, and review account permissions.
      </p>
    </div>

    <!-- Alert Banners -->
    <div 
      v-if="successMessage" 
      class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 animate-fade-in"
    >
      <CheckCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>{{ successMessage }}</div>
    </div>
    
    <div 
      v-if="errorMessage" 
      class="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-650 dark:text-red-400 flex items-start gap-2.5 animate-fade-in"
    >
      <AlertTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>{{ errorMessage }}</div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      <!-- Profile Preview & Avatar Selector -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-sm transition-colors duration-300">
        <div class="relative group">
          <img 
            :src="form.avatar_url" 
            :alt="form.full_name" 
            class="w-24 h-24 rounded-full object-cover border-4 border-slate-100 dark:border-slate-850 shadow-md transition-transform duration-300 group-hover:scale-102"
          />
          <div class="absolute -bottom-1 -right-1 p-2 bg-primary-600 rounded-full text-white shadow-md">
            <CameraIcon class="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <h3 class="text-sm font-black text-slate-900 dark:text-white truncate m-0">
            {{ userProfile?.fullName }}
          </h3>
          <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{{ userProfile?.role }}</p>
        </div>

        <!-- Avatar Presets Grid -->
        <div class="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div class="text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-2.5 text-left">Choose avatar preset:</div>
          <div class="grid grid-cols-5 gap-2">
            <button 
              v-for="url in avatarPresets" 
              :key="url"
              type="button"
              @click="form.avatar_url = url"
              :class="[
                'w-8 h-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer hover:scale-110',
                form.avatar_url === url ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent'
              ]"
            >
              <img :src="url" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>

      <!-- Form Inputs Panel -->
      <div class="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm transition-colors duration-300">
        <form @submit.prevent="handleSave" class="space-y-4">
          <!-- Full Name -->
          <div class="space-y-1">
            <label for="fullName" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Full Name
            </label>
            <input 
              id="fullName"
              v-model="form.full_name"
              type="text"
              required
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
            />
          </div>

          <!-- Email (Disabled) -->
          <div class="space-y-1 opacity-70">
            <label for="email" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Email Address (Authentication Link)
            </label>
            <input 
              id="email"
              v-model="form.email"
              type="email"
              disabled
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs cursor-not-allowed select-none dark:text-slate-400"
            />
          </div>

          <!-- Role (Disabled) -->
          <div class="space-y-1 opacity-70">
            <label for="role" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Assigned Role
            </label>
            <input 
              id="role"
              v-model="form.role"
              type="text"
              disabled
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs cursor-not-allowed select-none dark:text-slate-400"
            />
          </div>

          <!-- Avatar URL Input -->
          <div class="space-y-1">
            <label for="avatarUrl" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Custom Avatar URL
            </label>
            <input 
              id="avatarUrl"
              v-model="form.avatar_url"
              type="url"
              placeholder="e.g. https://domain.com/avatar.png"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-955 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
            />
          </div>

          <!-- Submit actions -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button 
              type="submit" 
              :disabled="loading"
              class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 disabled:opacity-50 transition-all rounded-xl cursor-pointer shadow-md shadow-primary-500/10"
            >
              <SaveIcon v-if="!loading" class="w-4 h-4" />
              <LoaderIcon v-else class="w-4 h-4 animate-spin" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  Camera as CameraIcon, 
  Save as SaveIcon, 
  Loader as LoaderIcon,
  CheckCircle as CheckCircleIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const userProfile = computed(() => authStore.userProfile)

const form = ref({
  full_name: '',
  email: '',
  role: '',
  avatar_url: ''
})

const successMessage = ref('')
const errorMessage = ref('')
const loading = ref(false)

const avatarPresets = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bear',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Cookie',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Garfield',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Shadow',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Tigger',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Lilly',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Misty'
]

watch(userProfile, (newProfile) => {
  if (newProfile) {
    form.value = {
      full_name: newProfile.fullName || '',
      email: newProfile.email || '',
      role: newProfile.role || 'User',
      avatar_url: newProfile.avatarUrl || ''
    }
  }
}, { immediate: true })

async function handleSave() {
  successMessage.value = ''
  errorMessage.value = ''
  
  if (!form.value.full_name.trim()) {
    errorMessage.value = 'Full name field cannot be empty.'
    return
  }

  loading.value = true
  try {
    await authStore.updateProfile({
      full_name: form.value.full_name,
      avatar_url: form.value.avatar_url
    })
    successMessage.value = 'Profile settings successfully updated!'
    
    // Clear notification after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to update profile settings.'
  } finally {
    loading.value = false
  }
}
</script>
