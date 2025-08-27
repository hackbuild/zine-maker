<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" role="img" aria-label="Copyleft" v-bind="$attrs">
    <circle cx="50" cy="50" r="36" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <path d="M58 37a14 14 0 1 0 0 26" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 50h-9" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <polygon points="40,50 46,46 46,54" :fill="fill"/>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({ size:{type:[Number,String],default:100}, stroke:{type:String,default:'#111'}, fill:{type:String,default:'#111'} })
const noneFill = 'none'
</script>

