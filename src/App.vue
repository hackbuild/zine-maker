<template>
  <div id="app" :data-theme="theme">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const theme = ref<'light'|'dark'>( (localStorage.getItem('theme') as any) || 'light');

function applyTheme() { 
  document.documentElement.setAttribute('data-theme', theme.value); 
}

onMounted(() => {
  applyTheme();
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Mobile touch optimizations */
button, .tool-button, .header-button {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
}

/* Prevent text selection on UI elements */
.app-header, .app-toolbar, .page-list-header, .properties-header {
  user-select: none;
  -webkit-user-select: none;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f8fafc;
  color: #1f2937;
  /* Mobile optimizations */
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for mobile */
  display: flex;
  flex-direction: column;
  /* Safe area support for iOS */
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
</style>