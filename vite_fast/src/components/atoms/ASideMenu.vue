<template>
  <div class="sideMenu" :class="{ 'closed': !isMenuOpen }">
    <div class="pullMenu" :class="{ 'open': isMenuOpen , 'closed': !isMenuOpen }" @click="toggleMenu">
      {{ isMenuOpen ? '〉' : '〈' }}
    </div>
    <div class="sideMenu__content" v-show="isMenuOpen">
      <h4>表示非表示切り替え</h4>
      <ul>
        <li v-for="(layer, index) in layers" :key="index">
          <button :style="{ height: '40px', width: '100%', backgroundColor: buttonColors[index] }" @click="toggleColor(index)">
            {{ layer }}
          </button>
        </li>
      </ul>
      <p>※ノードの追加・削除等は全レイヤー表示時にしてください。</p>
    </div>
  </div>
</template>

<script lang="ts">
import { get } from 'http';
import { defineComponent, computed, ref, watch } from 'vue';
import { useNetworkDataStore } from "../../stores/networkData";

export default defineComponent({
  name: 'ASideMenu',
  setup() {
    const store = useNetworkDataStore();
    const layers = computed(() => store.layers);
    const colors = computed(() => store.colors);
    const isMenuOpen = ref(false);

    const buttonColors = ref([...colors.value]);

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const toggleColor = (index: number) => {
      if (buttonColors.value[index] === 'gray') {
        buttonColors.value[index] = colors.value[index];
        getVisibleLayers();
      } else {
        buttonColors.value[index] = 'gray';
        getVisibleLayers();
      }
    };

    const getVisibleLayers = () => {
      const visibleLayers = buttonColors.value.reduce((acc: string[], color, index) => {
      if (color !== 'gray') {
        acc.push(layers.value[index]);
      }
      return acc;
      }, []);
      if ( visibleLayers.length === layers.value.length) {
        store.setFlag(3);
      } else {
        store.setVisibleLayers(visibleLayers);
        store.setFlag(15);
      }
    };

    return {
      layers,
      colors,
      isMenuOpen,
      toggleMenu,
      toggleColor,
      buttonColors,
      getVisibleLayers,
    };
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.sideMenu {
  position: absolute;
  right: 0;
  z-index: 1000;
  height: 100%;
  display: flex;
  align-items: center;
  p {
    color: c.$black;
    font-size: 0.7rem;
  }
}
.sideMenu.closed {
  transform: translateX(100%);
}
.sideMenu__content {
  width: 200px;
  height: 100%;
  padding: 1rem;
  background-color: c.$white;
  border-left: 5px solid c.$blue;
  transition: opacity 0.3s ease-in-out;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      margin-bottom: 1rem;
    }
  }
}
.pullMenu {
  width: 30px;
  height: 100px;
  background-color: c.$blue;
  border-radius: 5px 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: c.$white;
  font-size: 1.5rem;
  font-weight: bold;
  &.open {
    padding-left: 15px;
  }
  &.closed {
    padding-right: 10px;
    margin-left: -30px;
  }
}
h4 {
  color: c.$black;
  margin-bottom: 1rem;
}
</style>