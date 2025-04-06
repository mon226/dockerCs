<script lang="ts">
import { defineComponent, onMounted, onUnmounted } from 'vue';
import Header from './Header.vue';

export default defineComponent({
  components: {
    Header
  },
  methods: {
    setScrollbarWidth() {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar', `${scrollbarWidth}px`);
    }
  },
  mounted() {
    this.setScrollbarWidth();
    window.addEventListener('load', this.setScrollbarWidth);
    window.addEventListener('resize', this.setScrollbarWidth);
  },
  beforeUnmount() {
    window.removeEventListener('load', this.setScrollbarWidth);
    window.removeEventListener('resize', this.setScrollbarWidth);
  }
});
</script>

<template>
  <div>
    <Header />
    <img src="@/assets/image/stripe.png" alt="stripe" class="background-img">
    <svg class="background-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polygon points="50,0 100,0 100,100 70,100" fill="#0d0d0d" stroke="#0d0d0d" stroke-width="0"/>
    </svg>
    <div class="cbody">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
@use "@/assets/style/color" as c;
.cbody {
  margin: 0;
  width: calc(100vw);
  position: relative;
  overflow-y: auto;
  padding: 0 3vw;
  padding-top: 2vh;
}

.background-img {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
  opacity: 0.6;
}

.background-svg {
  position: fixed;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
}

::-webkit-scrollbar {
  width: 11px;
  height: 11px;
  background: c.$white;
}

::-webkit-scrollbar-thumb {
  border-radius: 11px;
  background-color: c.$yellow-light;

  &:hover {
    background-color: c.$yellow;
  }
}
</style>