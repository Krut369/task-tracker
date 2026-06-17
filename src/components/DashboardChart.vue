<template>
  <div class="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-300">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-sm font-bold text-slate-950 dark:text-white m-0">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-slate-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="header-action"></slot>
    </div>

    <!-- Chart container -->
    <div class="flex-1 flex items-center justify-center min-h-[240px] relative">
      <!-- 1. BAR CHART -->
      <div v-if="type === 'bar'" class="w-full h-full flex flex-col relative select-none">
        <!-- SVG Grid Background & Bars -->
        <svg class="w-full h-48 overflow-visible" viewBox="0 0 400 160" preserveAspectRatio="none">
          <!-- Horizontal Grid Lines -->
          <line v-for="i in 4" :key="i" x1="0" :y1="160 - i * 40" x2="400" :y2="160 - i * 40" stroke="currentColor" class="text-slate-100 dark:text-slate-800/60" stroke-width="1" stroke-dasharray="4" />
          
          <!-- Bar Elements -->
          <g v-for="(item, index) in barData" :key="index">
            <!-- Gradient hover overlay -->
            <rect 
              :x="item.x + 4" 
              :y="item.y" 
              :width="item.width" 
              :height="item.height" 
              rx="4" 
              class="fill-primary-500/80 dark:fill-primary-500/75 hover:fill-primary-600 dark:hover:fill-primary-400 transition-all duration-300 cursor-pointer"
              @mouseenter="hoveredBar = { ...item, index }"
              @mouseleave="hoveredBar = null"
            />
          </g>
        </svg>

        <!-- Horizontal Label Axes -->
        <div class="flex justify-between mt-3 text-[10px] text-slate-400 font-semibold px-2">
          <div 
            v-for="(item, index) in chartData" 
            :key="index"
            class="text-center truncate"
            :style="{ width: `${100 / chartData.length}%` }"
          >
            {{ item.label }}
          </div>
        </div>

        <!-- Floating Bar Tooltip -->
        <div 
          v-if="hoveredBar"
          class="absolute bg-slate-950 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg shadow-xl border border-slate-800 z-10 pointer-events-none transition-all duration-150"
          :style="{ 
            left: `${(hoveredBar.index * (100 / chartData.length)) + (50 / chartData.length) - 8}%`, 
            top: `${Math.max(10, (hoveredBar.y / 1.6) - 30)}px` 
          }"
        >
          <div class="text-[9px] text-slate-400 leading-none mb-0.5">{{ hoveredBar.label }}</div>
          <div>{{ hoveredBar.value }} tasks</div>
        </div>
      </div>

      <!-- 2. DONUT CHART -->
      <div v-else-if="type === 'donut'" class="w-full flex flex-col md:flex-row items-center justify-around gap-6 select-none">
        <!-- SVG Donut -->
        <div class="relative w-40 h-40 flex-shrink-0">
          <svg class="w-full h-full -rotate-95" viewBox="0 0 100 100">
            <!-- Background base circle -->
            <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" class="text-slate-100 dark:text-slate-800" stroke-width="12" />
            
            <!-- Category circle strokes -->
            <circle 
              v-for="(segment, index) in donutSegments" 
              :key="index"
              cx="50" 
              cy="50" 
              r="40" 
              fill="transparent" 
              :stroke="segment.color" 
              stroke-width="12"
              :stroke-dasharray="segment.dashArray"
              :stroke-dashoffset="segment.dashOffset"
              class="transition-all duration-700 ease-out cursor-pointer hover:stroke-[14]"
              @mouseenter="hoveredDonut = segment"
              @mouseleave="hoveredDonut = null"
            />
          </svg>

          <!-- Center text display -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span class="text-2xl font-black text-slate-950 dark:text-white leading-none">
              {{ completionPercentage }}%
            </span>
            <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
              Done
            </span>
          </div>
        </div>

        <!-- Legend Details list -->
        <div class="flex-1 space-y-2.5 w-full">
          <div 
            v-for="(item, index) in donutLegendData" 
            :key="index"
            class="flex items-center justify-between text-xs font-semibold p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></span>
              <span class="text-slate-600 dark:text-slate-300">{{ item.label }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-slate-800 dark:text-white font-bold">{{ item.value }}</span>
              <span class="text-[10px] text-slate-400">({{ item.pct }}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'bar', // 'bar' | 'donut'
  },
  chartData: {
    type: Array,
    required: true,
    // Format: [{ label: 'Mon', value: 5 }] or [{ label: 'Completed', value: 8, color: '#ef4444' }]
  }
})

const hoveredBar = ref(null)
const hoveredDonut = ref(null)

// --- BAR CHART COMPUTED VALUE ---
const barData = computed(() => {
  if (props.type !== 'bar' || props.chartData.length === 0) return []
  
  const values = props.chartData.map(d => d.value)
  const maxVal = Math.max(...values, 5) // ensure dividing threshold
  
  const chartWidth = 400
  const chartHeight = 160
  const barPadding = 12
  const barWidth = (chartWidth / props.chartData.length) - barPadding
  
  return props.chartData.map((d, index) => {
    const barHeight = (d.value / maxVal) * 130 // height cap at 130px out of 160
    return {
      label: d.label,
      value: d.value,
      x: index * (chartWidth / props.chartData.length) + barPadding / 2,
      y: chartHeight - barHeight,
      width: barWidth,
      height: barHeight
    }
  })
})

// --- DONUT CHART COMPUTED VALUES ---
const totalDonutValue = computed(() => {
  return props.chartData.reduce((sum, d) => sum + d.value, 0)
})

const completionPercentage = computed(() => {
  if (totalDonutValue.value === 0) return 0
  const completedItem = props.chartData.find(d => d.label === 'Completed')
  if (!completedItem) return 0
  return Math.round((completedItem.value / totalDonutValue.value) * 100)
})

const donutLegendData = computed(() => {
  if (totalDonutValue.value === 0) {
    return props.chartData.map(d => ({ ...d, pct: 0 }))
  }
  return props.chartData.map(d => ({
    ...d,
    pct: Math.round((d.value / totalDonutValue.value) * 100)
  }))
})

const donutSegments = computed(() => {
  if (props.type !== 'donut' || props.chartData.length === 0) return []
  
  const total = totalDonutValue.value
  if (total === 0) return []
  
  const radius = 40
  const circumference = 2 * Math.PI * radius // ~251.2
  
  let accumulatedVal = 0
  
  return props.chartData.map(d => {
    const pct = d.value / total
    const dashArray = `${circumference}`
    // Calculate offset starting from top. Rotation makes 0 at 12 o'clock
    const dashOffset = `${circumference - (pct * circumference)}`
    
    // Position offset relative to previous accumulated values
    const segmentOffset = `${circumference - (accumulatedVal / total * circumference)}`
    accumulatedVal += d.value
    
    return {
      label: d.label,
      value: d.value,
      color: d.color || '#8b5cf6',
      dashArray,
      dashOffset: segmentOffset
    }
  })
})
</script>
