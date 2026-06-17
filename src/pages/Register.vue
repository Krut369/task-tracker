<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 transition-colors duration-300">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="inline-flex p-3 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 mb-3">
        <ActivityIcon class="w-6 h-6 animate-pulse" />
      </div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white leading-none">Create Account</h2>
      <p class="text-xs text-slate-400 mt-2">Get started immediately to track goals and project lanes.</p>
    </div>

    <!-- Error banner -->
    <div 
      v-if="errorMessage" 
      class="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5"
    >
      <AlertTriangleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
      <div>{{ errorMessage }}</div>
    </div>

    <!-- Register form -->
    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Full Name -->
      <div class="space-y-1">
        <label for="fullName" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Full Name
        </label>
        <input 
          id="fullName"
          v-model="form.fullName"
          type="text"
          required
          placeholder="e.g. John Miller"
          :class="[
            'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white',
            errors.fullName ? 'form-input-error' : ''
          ]"
        />
        <span v-if="errors.fullName" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
          <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.fullName }}
        </span>
      </div>

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
            'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white',
            errors.email ? 'form-input-error' : ''
          ]"
        />
        <span v-if="errors.email" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
          <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.email }}
        </span>
      </div>

      <!-- Role selection -->
      <div class="space-y-1">
        <label for="role" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          I am registering as:
        </label>
        <select 
          id="role"
          v-model="form.role"
          class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
        >
          <option value="User">Employee / Team Member</option>
          <option value="Admin">Admin / Manager</option>
        </select>
      </div>

      <!-- Password -->
      <div class="space-y-1">
        <label for="password" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Password
        </label>
        <input 
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="At least 6 characters"
          :class="[
            'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white',
            errors.password ? 'form-input-error' : ''
          ]"
        />
        <span v-if="errors.password" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
          <AlertCircleIcon class="w-3.5 h-3.5" /> {{ errors.password }}
        </span>
      </div>

      <!-- Submit button -->
      <button 
        type="submit" 
        :disabled="loading"
        class="w-full py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
      >
        <LoaderIcon v-if="loading" class="w-4 h-4 animate-spin" />
        <UserPlusIcon v-else class="w-4 h-4" />
        Create Account
      </button>
    </form>

    <!-- Redirect login -->
    <div class="mt-6 text-center text-xs text-slate-500">
      Already have an account? 
      <router-link 
        to="/login" 
        class="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-350 hover:underline"
      >
        Sign in instead
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Activity as ActivityIcon, 
  UserPlus as UserPlusIcon, 
  Loader as LoaderIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon
} from 'lucide-vue-next'
import { z } from 'zod'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  fullName: '',
  email: '',
  role: 'User',
  password: ''
})

const errors = ref({
  fullName: '',
  email: '',
  password: ''
})

const errorMessage = ref('')
const loading = ref(false)

// Schema
const registerSchema = z.object({
  fullName: z.string().trim().min(2, { message: 'Enter your full name' }),
  email: z.string().trim().email({ message: 'Enter a valid email address' }),
  role: z.enum(['User', 'Admin']),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' })
})

async function handleRegister() {
  errorMessage.value = ''
  errors.value = { fullName: '', email: '', password: '' }

  const result = registerSchema.safeParse(form.value)
  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors
    if (errorMap.fullName) errors.value.fullName = errorMap.fullName[0]
    if (errorMap.email) errors.value.email = errorMap.email[0]
    if (errorMap.password) errors.value.password = errorMap.password[0]
    return
  }

  loading.value = true
  try {
    await authStore.register(
      form.value.email,
      form.value.password,
      form.value.fullName,
      form.value.role
    )
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err.message || 'Registration failed. Please check your inputs.'
  } finally {
    loading.value = false
  }
}
</script>
