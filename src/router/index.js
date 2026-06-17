import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/Register.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/ForgotPassword.vue'),
    meta: { layout: 'AuthLayout', guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../pages/Dashboard.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../pages/Projects.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetails',
    component: () => import('../pages/ProjectDetails.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },
  {
    path: '/tasks/:id',
    name: 'TaskDetails',
    component: () => import('../pages/TaskDetails.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },
  {
    path: '/team',
    name: 'Team',
    component: () => import('../pages/Team.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../pages/Reports.vue'),
    meta: { 
      layout: 'DashboardLayout', 
      requiresAuth: true,
      allowedRoles: ['Super Admin', 'Admin']
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/Profile.vue'),
    meta: { layout: 'DashboardLayout', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Authentication & Role navigation guards
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  // Initialize session checks on page load
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const userRole = authStore.userRole

  // Guest Only route (e.g. Login, Register)
  if (to.meta.guestOnly && isAuthenticated) {
    return '/dashboard'
  }

  // Protected route
  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  // RBAC Role check
  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
    console.warn(`User role "${userRole}" not allowed to access route: ${to.path}`)
    return '/dashboard'
  }
})

export default router
