<template>
  <div class="mui-box">
    <div class="mui-input-root">
      <label>
        <input
          class="mui-input"
          type="text"
          v-model="localCard[Object.keys(localCard)[0]].t"
        />
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch, PropType, reactive } from 'vue';

interface Card {
  t: string;
  x: number;
  y: number;
  math: string; 
}

export default defineComponent({
  name: 'ANameInput',
  props: {
    card: {
      type: Object as PropType<{ [key: string]: Card } | null>,
      required: true,
    },
  },
  emits: ['update:card'],
  setup(props, { emit }) {
    const localCard = reactive({ ...props.card });
    watch(
      () => props.card,
      (newCard) => {
        if (newCard) {
          Object.keys(localCard).forEach((key) => delete localCard[key]);
          Object.assign(localCard, newCard);
        }
      },
      { immediate: true, deep: true }
    );
    watch(
      () => localCard,
      (newVal) => {
        emit('update:card', newVal);
      },
      { deep: true }
    );
    return {
      localCard,
    };
  },
});
</script>


<style lang="scss">
@use "@/assets/style/color" as c;
.mui-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mui-input-root {
  display: flex;
  align-items: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-color: c.$sub_6;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:focus-within::after {
    transform: scaleX(1);
  }
}

.mui-input {
  width: 250px;
  padding: 8px 12px;
  border: none;
  outline: none;
  background: white;
  border-radius: 4px;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  letter-spacing: inherit;
  text-align: center;
  font-size: 1.5rem;

  &:focus {
    background: c.$gray-light;
  }
}
</style>
