<template>
  <button type="button" class="btn-border-gradient-wrap" @click="handleClick" :id="btnId">
    <div class="btn btn-border-gradient">{{ btnText }}</div>
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    btnId: {
      type: String,
      required: true
    },
    btnText: {
      type: String,
      required: true
    }
  },
  emits: ['click'],
  methods: {
    handleClick() {
      this.$emit('click');
    }
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
*,
*:before,
*:after {
  box-sizing: inherit;
}

.btn,
div.btn,
button.btn {
  position: relative;
  width: 200px;
  height: 50px;
  user-select: none;
  transition: all 0.3s;
  text-align: center;
  vertical-align: middle;
  text-decoration: none;
  letter-spacing: 0.1em;
  border-radius: 0.5rem;
  font-size: 12px;
}

.btn-border-gradient-wrap {
  display: inline-block;
  padding: 0.2rem;
  border: 0;
  border-radius: 0.5rem;
  background: linear-gradient(to right, c.$yellow, c.$green);

  &:hover {
    background: linear-gradient(to left, c.$yellow, c.$green);
  }
}

.btn-border-gradient {
  color: c.$black;
  background: c.$white;
  display: table-cell;
  transition: color 0.3s ease, background 0.3s ease;
}

.btn-border-gradient-wrap:hover .btn-border-gradient {
  color: c.$white;
  background: transparent;
}
</style>
