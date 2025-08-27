<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" role="img" aria-label="Encrypted Lock" v-bind="$attrs">
    <rect x="22" y="42" width="56" height="40" rx="8"
          :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linejoin="round"/>
    <path d="M35 42v-9a15 15 0 0 1 30 0v9"
          :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="62" r="6" :fill="fill"/>
    <path d="M50 68v8" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 58h-6m6 0l-8-8m54 8h6m-6 0l8-8"
          :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({
  size:{type:[Number,String],default:100},
  stroke:{type:String,default:'#111'},
  fill:{type:String,default:'#111'}
})
const noneFill = 'none'
</script>

