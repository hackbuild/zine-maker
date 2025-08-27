<template>
  <svg :width="size" :height="size" viewBox="0 0 120 100" role="img" aria-label="Terminal Branch" v-bind="$attrs">
    <rect x="14" y="20" width="92" height="60" rx="8" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <path d="M22 32h20M22 44h12" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 66c10 0 10-22 20-22" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <circle cx="50" cy="66" r="4" :fill="fill"/>
    <circle cx="70" cy="44" r="4" :fill="fill"/>
    <circle cx="84" cy="66" r="4" :fill="fill"/>
    <path d="M70 44v22h14" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
  </svg>
</template>
<script setup lang="ts">
defineProps({ size:{type:[Number,String],default:120}, stroke:{type:String,default:'#111'}, fill:{type:String,default:'#111'} })
const noneFill = 'none'
</script>

