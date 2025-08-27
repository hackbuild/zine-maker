<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" role="img" aria-label="Mesh Network" v-bind="$attrs">
    <circle cx="24" cy="24" r="8" :fill="fill"/>
    <circle cx="76" cy="24" r="8" :fill="fill"/>
    <circle cx="24" cy="76" r="8" :fill="fill"/>
    <circle cx="76" cy="76" r="8" :fill="fill"/>
    <circle cx="50" cy="50" r="8" :fill="accent"/>
    <path d="M24 24l26 26m0-26l26 26M24 76l26-26m26 26L50 50"
          :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
  </svg>
</template>
<script setup lang="ts">
defineProps({
  size:{type:[Number,String],default:100},
  stroke:{type:String,default:'#111'},
  fill:{type:String,default:'#111'},
  accent:{type:String,default:'#5CFF6A'}
})
const noneFill = 'none'
</script>

