<template>
  <div class="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300">
    <DashboardLayout v-if="route.meta.layout === 'DashboardLayout'" />
    <AuthLayout v-else-if="route.meta.layout === 'AuthLayout'" />
    <router-view v-else />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import DashboardLayout from './layouts/DashboardLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

const route = useRoute()
</script>
