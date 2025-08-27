<template>
  <svg :width="size" :height="size" viewBox="0 0 100 100" role="img" aria-label="Open Keyhole" v-bind="$attrs">
    <circle cx="50" cy="50" r="36" :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <path d="M50 22a28 28 0 1 1 0 56v-16a12 12 0 1 0 0-24V22z" :fill="fill"/>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({ size:{type:[Number,String],default:100}, stroke:{type:String,default:'#111'}, fill:{type:String,default:'#111'} })
const noneFill = 'none'
</script>

