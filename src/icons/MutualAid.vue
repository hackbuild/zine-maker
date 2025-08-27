<template>
  <svg :width="size" :height="size" viewBox="0 0 110 100" role="img" aria-label="Mutual Aid" v-bind="$attrs">
    <path d="M55 82C30 66 18 54 18 40a16 16 0 0 1 30-9 16 16 0 0 1 30 9c0 14-12 26-23 33z"
          :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linejoin="round"/>
    <path d="M70 46l-12 10a8 8 0 0 1-10 0l-8-6" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 46l8 6m16 0l14-12" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({ size:{type:[Number,String],default:110}, stroke:{type:String,default:'#111'} })
const noneFill = 'none'
</script>

