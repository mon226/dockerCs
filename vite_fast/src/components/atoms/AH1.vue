<template>
  <div class="h1-wrapper">
    <img src="@/assets/image/h1/h1.svg" alt="h1" class="h1-img">
    <h1 class="h1-uline" :id="h1Id">
      {{ h1Title }}
    </h1>
    <svg class="h1-svg" width="15" height="15" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
      <circle class="h1-circle" cx="1" cy="1" r="1"/>
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    h1Id: {
      type: String,
      required: true,
    },
    h1Title: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.h1-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 30px;

  /* 子要素の高さを揃える */
}

h1 {
  padding: 0px 10px 0px 5px;
  /* 下線を引く */
}

.h1-uline {
  border-bottom: 2px solid c.$yellow;
  display: inline-block;
}

.h1-img {
  padding-bottom: 8px;
  border-bottom: 2px solid c.$yellow;
  width: 40px;
  height: 50px;
  margin-top: 3px;
}

.h1-svg {
  vertical-align: middle;
  margin-top: 51.195px;
}

.h1-circle {
  fill: c.$yellow;
}
</style>
