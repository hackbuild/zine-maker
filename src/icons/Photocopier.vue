<template>
  <svg :width="size" :height="size" viewBox="0 0 120 100" role="img" aria-label="Photocopier" v-bind="$attrs">
    <rect x="16" y="34" width="88" height="44" rx="4"
          :stroke="stroke" :fill="noneFill" stroke-width="3"/>
    <rect x="28" y="46" width="44" height="18" :fill="fill"/>
    <path d="M16 34l44-16 44 16" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linejoin="round"/>
    <path d="M76 72h20M76 62h20" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round"/>
    <path d="M58 20l10-6 28 10M58 20l-28 10" :stroke="stroke" :fill="noneFill" stroke-width="3" stroke-linecap="round" />
  </svg>
</template>
<script setup lang="ts">
defineProps({ size:{type:[Number,String],default:120}, stroke:{type:String,default:'#111'}, fill:{type:String,default:'#111'} })
const noneFill = 'none'
</script>

