<template>
  <svg :width="size" :height="size" viewBox="0 0 120 100" role="img" aria-label="Folded Zine" v-bind="$attrs">
    <path d="M22 22h56v56H22z" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <path d="M78 22h20v56H78z" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <path d="M36 32h22M36 44h22M36 56h18" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <circle cx="78" cy="50" r="3" :fill="fill"/>
    <circle cx="98" cy="50" r="3" :fill="fill"/>
    <path d="M78 22l-8-8" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({ size:{type:[Number,String],default:120}, stroke:{type:String,default:'#111'}, fill:{type:String,default:'#111'} })
const noneFill = 'none'
</script>

