<template>
  <div class="slider">
    <input type="range" min="0" max="100" step="1" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ASlider',
});
</script>