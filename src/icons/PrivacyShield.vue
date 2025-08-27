<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" v-bind="$attrs" role="img" aria-label="Privacy Shield">
    <defs>
      <mask id="m-strike">
        <rect x="0" y="0" width="100" height="100" fill="#fff"/>
        <rect x="18" y="48" width="64" height="6" transform="rotate(-20 50 51)" fill="#000"/>
      </mask>
    </defs>
    <path :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
          d="M50 12l30 10v22c0 22-14 34-30 44-16-10-30-22-30-44V22l30-10z" />
    <path :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
          d="M20 52c6-10 16-16 30-16s24 6 30 16" mask="url(#m-strike)"/>
    <circle cx="50" cy="52" r="9" :fill="fill" mask="url(#m-strike)"/>
  </svg>
</template>
<script setup lang="ts">
defineProps({
  size: { type: [Number, String], default: 100 },
  stroke: { type: String, default: '#111' },
  fill: { type: String, default: '#111' }
})
const noneFill = 'none'
</script>

