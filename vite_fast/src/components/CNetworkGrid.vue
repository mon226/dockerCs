<template>
  <div class="grid-container">
    <div class="parent-div"
      v-for="(children, parentKey, i) in gridData"
      :key="parentKey">
      <div
        v-for="(value, childKey, j) in children"
        :key="childKey"
        :id="`${parentKey}-${childKey}`"
        :class="{ hidden: isHidden(`${parentKey}-${childKey}`) }"
        :style="calculateStyle(i, j)"
      >
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    gridData: {
      type: Object as () => { [key: string]: { [key: string]: number } },
      required: true
    },
    displayNone: {
      type: Object as () => { [key: string]: { [key: string]: number } },
      required: true
    }
  },
  methods: {
    isHidden(id: string): boolean {
      const [parentKey, childKey] = id.split('-');
      return this.displayNone[parentKey]?.[childKey] !== undefined;
    },
    calculateCoordinates(row: number, col: number): string {
      const topLeftX = 100 + row * 500;
      const topLeftY = 100 + col * 500;
      return `(${topLeftX}, ${topLeftY}) ~ (${topLeftX + 500}, ${topLeftY + 500})`;
    },
    calculateStyle(row: number, col: number) {
      const topLeftX = 100 + row * 500;
      const topLeftY = 100 + col * 500;
      return {
        position: 'absolute',
        left: `${topLeftX}px`,
        top: `${topLeftY}px`,
        width: '500px',
        height: '500px',
        backgroundColor: '#f3f3f3',
        color: 'black',
      };
    }
  }
});
</script>


<style lang="scss" scoped>
.grid-container {
  position: relative;
  width: 4700px;
  height: 4700px;
}

.hidden {
  display: none; 
}
</style>
