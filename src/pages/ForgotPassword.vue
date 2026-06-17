<template>
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 transition-colors duration-300">
    <!-- Header -->
    <div class="text-center mb-6">
      <div class="inline-flex p-3 rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 mb-3">
        <KeyIcon class="w-6 h-6" />
      </div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white leading-none">Recover Password</h2>
      <p class="text-xs text-slate-400 mt-2">Enter your email and we'll send you recovery steps.</p>
    </div>

    <!-- Success state -->
    <div v-if="submitted" class="space-y-5 text-center animate-fade-in">
      <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-start gap-2.5 text-left">
        <CheckCircleIcon class="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Recovery email sent! Check your inbox (<code class="font-bold">{{ email }}</code>) for password recovery instructions.
        </div>
      </div>
      
      <p class="text-xs text-slate-500">
        Didn't receive the email? Check your spam folder or click below to retry.
      </p>

      <div class="flex flex-col gap-2">
        <button 
          @click="submitted = false"
          class="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
        >
          Try a different email
        </button>
        
        <router-link 
          to="/login"
          class="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/10"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5" /> Back to Sign In
        </router-link>
      </div>
    </div>

    <!-- Active Form -->
    <form v-else @submit.prevent="handleSubmit" class="space-y-5">
      <div class="space-y-1">
        <label for="email" class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          Email Address
        </label>
        <input 
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="e.g. user@company.com"
          :class="[
            'w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white',
            error ? 'form-input-error' : ''
          ]"
        />
        <span v-if="error" class="text-xs font-medium text-red-500 flex items-center gap-1 mt-1">
          <AlertCircleIcon class="w-3.5 h-3.5" /> {{ error }}
        </span>
      </div>

      <button 
        type="submit" 
        :disabled="loading"
        class="w-full py-3 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 active:scale-[0.98] disabled:opacity-50 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 cursor-pointer text-sm"
      >
        <LoaderIcon v-if="loading" class="w-4 h-4 animate-spin" />
        <SendIcon v-else class="w-4 h-4" />
        Send Recovery Email
      </button>

      <div class="text-center text-xs">
        <router-link 
          to="/login"
          class="font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-350 hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeftIcon class="w-3.5 h-3.5" /> Return to Login
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { 
  Key as KeyIcon, 
  Send as SendIcon, 
  Loader as LoaderIcon, 
  ArrowLeft as ArrowLeftIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-vue-next'
import { z } from 'zod'

const email = ref('')
const error = ref('')
const loading = ref(false)
const submitted = ref(false)

const emailSchema = z.string().trim().email({ message: 'Enter a valid email address' })

function handleSubmit() {
  error.value = ''
  
  const result = emailSchema.safeParse(email.value)
  if (!result.success) {
    error.value = result.error.errors[0].message
    return
  }

  loading.value = true
  setTimeout(() => {
    loading.value = false
    submitted.value = true
  }, 800)
}
</script>
