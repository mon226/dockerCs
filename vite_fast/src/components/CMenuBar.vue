<template>
  <div class="menubar">
    <a-hambuger-menu/>
    <div class="othermenu">
      <button @click="handleButtonClick" class="opmbutton">
        <img src="@/assets/image/OPM/objectDrag.svg" />
      </button>
      <AScalingButton :selectedLabel="parentLabel" @update:selectedLabel="updateParentLabel"/>
      <font-awesome-icon 
        :icon="['fas', 'floppy-disk']" 
        class="icon" 
        @mouseover="changeCursor('pointer')"
        @mouseleave="resetCursor"
        @click="saveLog"
      />
    </div>
    <ADescriptionHolder 
      :openCardInfo="openCardInfo"
      @update:openCardInfo="updateOpenCardInfo"
      :selectedCard="selectedCard"
      @update:selectedCard="updateSelectedCard"
      :cards="cards"
      :arrows="arrows"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, ref } from 'vue';
import AScalingButton from './atoms/AScalingButton.vue';
import AHambugerMenu from './atoms/AHambugerMenu.vue';
import ADescriptionHolder from './atoms/ADescriptionHolder.vue';

interface Card {
  t: string;
  x: number;
  y: number;
}

export default defineComponent({
  components: {
    AScalingButton,
    AHambugerMenu,
    ADescriptionHolder
  },
  props: {
    handleButtonClick: Function, 
    changeCursor: Function, 
    resetCursor: Function, 
    saveLog: Function, 
    openCardInfo: Boolean,
    selectedCard: Object as PropType<{ [key: string]: Card } | null>,
    cards: Object as PropType<{ [key: string]: Card } | null>,
    arrows: Object as PropType<{ id: string; style: Record<string, any>; from: string; to: string }[]>,
  },
  emits: ['update:openCardInfo', 'update:selectedCard'],
  data() {
    return {
      parentLabel: '100%' 
    };
  },
  methods: {
    updateParentLabel(label: string) {
      this.parentLabel = label;
      this.$emit('update:selectedLabel', label);
    },
    updateOpenCardInfo(newValue: boolean) {
      this.$emit('update:openCardInfo', newValue);
    }
  },
  setup(props, { emit }) {
    //　孫から受け取った更新を親に伝播
    const updateSelectedCard = (updatedCard: { [key: string]: Card }) => {
      emit('update:selectedCard', updatedCard);
    };
    return {
      updateSelectedCard
    };
  }
});
</script>

<style scoped lang="scss">
@use "@/assets/style/color" as c;
.menubar {
  width: 100%;
  height: 10vh;
  background-color: c.$white;
  border: 2px solid c.$yellow;
  display: flex;
  align-items: center;
  color: c.$black;
  position: relative;
  z-index: 50;
}
.othermenu {
  display: flex;
  justify-content: space-around;
  width: 100%;
  align-items: center;
}
.icon {
  font-size: 30px;
  border: 1px solid c.$black;
  padding: 5px;
  border-radius: 5px;
}
.opmbutton {
  display: flex;
}
img {
  height: 40px;
}
</style>
