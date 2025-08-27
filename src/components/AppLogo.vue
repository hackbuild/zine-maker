<template>
  <div class="app-logo" :style="wrapperStyle">
    <img src="@/assets/zeenster-sheet.png" alt="Zeenster" class="logo-sprite" :style="spriteStyle" />
  </div>
</template>

<script setup lang="ts">
// Crops the first logo from the sheet using CSS object-position
// Tweak offsets if the source sheet changes
const width = 140; // rendered width
const height = 28; // rendered height
// Sprite source area (px in the sheet)
const crop = { x: 430, y: 205, w: 420, h: 120 };

const wrapperStyle = {
  width: `${width}px`,
  height: `${height}px`,
  overflow: 'hidden',
  display: 'inline-block'
};

const spriteStyle = {
  width: '1000px', // large enough to retain quality; scales down
  height: 'auto',
  objectFit: 'none',
  objectPosition: `-${crop.x}px -${crop.y}px`,
  transform: `scale(${width / crop.w}, ${height / crop.h})`,
  transformOrigin: 'top left'
};
</script>

<style scoped>
.logo-sprite { display: block; }
</style>


