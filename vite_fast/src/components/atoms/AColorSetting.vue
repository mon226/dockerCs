<template>
  <div class="colorSetting">
    <div class="colorSetting__title">Color Setting</div>
    <div id="listWrapper">
      <font-awesome-icon 
        :icon="['fas', 'folder']"
        style="color: #d3d3d5; font-size: 2rem;"
      />
      <div id="list">
        <button 
          v-for="(color) in colorList" 
          :key="color" 
          :style="{ backgroundColor: color, width: '20px', height: '20px', border: 'none', cursor: 'pointer' }"
          @click="alertColor(color, index)"
        ></button>
      </div>
      <button @click="newColor" style="background: none; border: none; padding: 0; cursor: pointer; height: 20px;">
        <font-awesome-icon 
          :icon="['fas', 'plus']"
          style="color: #d3d3d5; font-size: 15px; border: 1px solid #d3d3d5; padding: 1.5px 2.4375px;"
        />
      </button>
    </div>
    <div id = "setFreeColor" v-if = "freeColor">
      <input id="inputColor" type="color" list="color-picker">
      <button id="confirmColor" @click="confirmColor">OK</button>
    </div>
  </div>
</template>
  
<script lang="ts">
  import { defineComponent, onMounted, ref, watch } from "vue";
  import { useNetworkDataStore } from "../../stores/networkData";
  import { computed } from 'vue';

  export default defineComponent({
    props: {
      index : Number,
    },
    setup() {
      const store = useNetworkDataStore();
      const colorList = computed(() => store.colorList);
      const freeColor = ref(false);
      const newColor = () => {
        freeColor.value = true;
      };

      const confirmColor = () => {
        const colorInput = document.getElementById('inputColor') as HTMLInputElement;
        if (colorInput) {
          const color = colorInput.value;
          store.addColorList(color);
          freeColor.value = false;
        }
      };
      const alertColor = (color: string, index: number) => {
        store.changeLayerColor(index, color);
        store.setEditColor(index, false);
      };
      return {
        colorList,
        newColor,
        freeColor,
        confirmColor,
        alertColor,
      };
    },
  })
</script>
<style lang="scss">
@use "@/assets/style/color" as c;
.colorSetting {
  background-color: c.$gray;
  padding: 1rem;
  color: c.$white;
  width: 250px;
  height: 150px;
  overflow-y: auto;
  position: absolute;
  z-index: 10000;
  &__title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
}
#listWrapper {
  display: flex;
  align-items: flex-end;
  gap: 5px;
}
#list {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
}
#inputColor {
  border: 1px c.$white solid;
  height: 30px;
  margin-top: 5px;
}
</style>