<template>
  <div class="app-logo" :style="wrapperStyle">
    <img :src="logoSrc" alt="Zeenster" class="logo" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, type CSSProperties } from 'vue';
// direct assets (no cropping)
// @ts-ignore - Vite will inline/serve the image
import logoSrc from '@/assets/logo-header.png';
// @ts-ignore
import pressSrc from '@/assets/press.png';

const width = 140;
const height = 28;

const wrapperStyle: CSSProperties = {
  width: `${width}px`,
  height: `${height}px`,
  overflow: 'hidden',
  display: 'inline-block'
};

onMounted(() => {
  // Set favicon to the press icon
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';
  link.href = pressSrc as unknown as string;
});
</script>

<style scoped>
.logo { display: block; width: 100%; height: 100%; object-fit: contain; }
</style>


