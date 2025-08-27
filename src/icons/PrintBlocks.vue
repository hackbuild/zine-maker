<template>
  <svg :width="size" :height="size" viewBox="0 0 110 100" role="img" aria-label="Print Blocks" v-bind="$attrs">
    <rect x="18" y="18" width="28" height="28" :fill="fill"/>
    <rect x="64" y="18" width="28" height="28" :fill="fill"/>
    <rect x="18" y="54" width="28" height="28" :fill="fill"/>
    <rect x="64" y="54" width="28" height="28" :fill="accent"/>
    <path d="M18 18h74v64H18z" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
  </svg>
</template>
<script setup lang="ts">
defineProps({
  size:{type:[Number,String],default:110},
  stroke:{type:String,default:'#111'},
  fill:{type:String,default:'#111'},
  accent:{type:String,default:'#5CFF6A'}
})
const noneFill = 'none'
</script>

