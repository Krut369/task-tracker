<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 transition-colors duration-300">
    <!-- Brand Title -->
    <div class="text-center mb-8">
      <div class="inline-flex p-3 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 mb-4">
        <ActivityIcon class="w-6 h-6 animate-pulse" />
      </div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white leading-none">Welcome back</h2>
      <p class="text-xs text-slate-400 mt-2">Log in to track your team progress and manage tasks.</p>
    </div>

    <!-- Error Callout Banner -->
    <div 
      v-if="errorMessage" 
      class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5"
    >
      <AlertTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>{{ errorMessage }}</div>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="space-y-5">
      <!-- Email Address -->
      <div class="space-y-1">
        <label for="email" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Email Address
        </label>
        <input 
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="e.g. employee@company.com"
          :class="[
            'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white',
            errors.email ? 'form-input-error' : ''
          ]"
        />
        <span v-if="errors.email" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
          <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.email }}
        </span>
      </div>

      <!-- Password -->
      <div class="space-y-1">
        <div class="flex items-center justify-between">
          <label for="password" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Password
          </label>
          <router-link 
            to="/forgot-password" 
            class="text-[11px] font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-350 hover:underline"
          >
            Forgot Password?
          </router-link>
        </div>
        <input 
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="••••••••"
          :class="[
            'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white',
            errors.password ? 'form-input-error' : ''
          ]"
        />
        <span v-if="errors.password" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
          <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.password }}
        </span>
      </div>

      <!-- Submit Trigger -->
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
      >
        <LoaderIcon v-if="loading" class="w-4 h-4 animate-spin" />
        <LogInIcon v-else class="w-4 h-4" />
        Sign In
      </button>
    </form>


    <!-- Redirect Register -->
    <div class="mt-6 text-center text-xs text-slate-500">
      Don't have an account? 
      <router-link 
        to="/register" 
        class="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-350 hover:underline"
      >
        Create account
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Activity as ActivityIcon, 
  LogIn as LogInIcon, 
  Loader as LoaderIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'
import { z } from 'zod'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const errors = ref({
  email: '',
  password: ''
})

const errorMessage = ref('')
const loading = ref(false)

  // Login Schema Validator
  const loginSchema = z.object({
    email: z.string().trim().email({ message: 'Enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
  })

async function handleLogin() {
  errorMessage.value = ''
  errors.value = { email: '', password: '' }
  
  // Validate schema
  const result = loginSchema.safeParse(form.value)
  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors
    if (errorMap.email) errors.value.email = errorMap.email[0]
    if (errorMap.password) errors.value.password = errorMap.password[0]
    return
  }

  loading.value = true
  try {
    await authStore.login(form.value.email, form.value.password)
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err.message || 'Incorrect email or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
