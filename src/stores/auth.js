import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)
  const isInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  
  const userRole = computed(() => {
    return user.value?.role || 'User'
  })

  const isAdmin = computed(() => {
    return userRole.value === 'Admin' || userRole.value === 'Super Admin'
  })

  const isSuperAdmin = computed(() => {
    return userRole.value === 'Super Admin'
  })

  const userProfile = computed(() => {
    if (!user.value) return null
    return {
      id: user.value.id,
      email: user.value.email,
      fullName: user.value.full_name || 'User',
      role: userRole.value,
      avatarUrl: user.value.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.value.email}`
    }
  })

  async function initializeAuth() {
    loading.value = true
    try {
      const profile = await authService.getSession()
      if (profile) {
        user.value = profile
      } else {
        user.value = null
      }
    } catch (e) {
      console.error('Error initializing authentication:', e)
      user.value = null
    } finally {
      loading.value = false
      isInitialized.value = true
    }
  }

  async function login(email, password) {
    loading.value = true
    try {
      const profile = await authService.login(email, password)
      user.value = profile
      return user.value
    } catch (error) {
      user.value = null
      throw error
    } finally {
      loading.value = false
    }
  }

  async function register(email, password, fullName, role = 'User') {
    loading.value = true
    try {
      const profile = await authService.register(email, password, fullName, role)
      user.value = profile
      return user.value
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authService.logout()
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      user.value = null
      loading.value = false
    }
  }

  async function updateProfile(updates) {
    if (!user.value) return
    loading.value = true
    try {
      const updatedProfile = await authService.updateProfile(user.value.id, updates)
      user.value = updatedProfile
      return user.value
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isInitialized,
    isAuthenticated,
    userRole,
    isAdmin,
    isSuperAdmin,
    userProfile,
    initializeAuth,
    login,
    register,
    logout,
    updateProfile
  }
})
