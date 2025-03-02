<template>
  <div class="save-popup" v-if="isSavePopup">
    <div class="save-popup__inner">
      <h2>Save</h2>
      <p>Project Id: {{ projectNumber }}</p>
      <p>Project Name: {{ projectName }}</p>
      <label>
        <input type="checkbox" v-model="isJsonDownload" />
        JSON形式でダウンロード
      </label>
      <div class="button-wrapper">
        <button @click="closePopup">Close</button>
        <button @click="saveProject">Save</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useNetworkDataStore } from '../stores/networkData';

export default defineComponent({
  name: 'CSavePopup',
  props: {
    projectNumber: {
      type: Number,
      required: true
    },
  },
  setup(props) {
    const store = useNetworkDataStore();
    const isSavePopup = computed(() => store.isSavePopup);
    const projectName = computed(() => store.projectName);
    const dataset = computed(() => store.dataset as any);
    const availableGrid = computed(() => store.availableGrid);

    const isJsonDownload = ref(false); // JSONダウンロードのチェック状態

    const closePopup = () => {
      store.setPopup("close");
    };

    const saveProject = async () => {
      const saveDataset = {
        projectNumber: props.projectNumber,
        projectName: projectName.value,
        data: JSON.parse(JSON.stringify(dataset.value)),
        availableGrid: JSON.parse(JSON.stringify(availableGrid.value)),
        version: store.version,
        colors: store.colors,
        colorList: store.colorList,
        layers: store.layers,
      };
      console.log("Save dataset:", saveDataset);

      try {
        const response = await fetch("http://localhost:8080/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveDataset),
        });
        const result = await response.json();
        console.log("Success:", result);
      } catch (error) {
        console.error("Error:", error);
      }
      if (isJsonDownload.value) {
        const blob = new Blob([JSON.stringify(saveDataset)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project_${props.projectNumber}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      store.setPopup("close");
    };
    return {
      closePopup,
      isSavePopup,
      projectName,
      isJsonDownload,
      saveProject,
    };
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;

.save-popup {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
  background-color: c.$white;
  color: c.$black;
  z-index: 10000;
  border: 5px solid c.$blue;
  padding: 10px;

  & label {
    display: flex;
    align-items: center;
    margin: 10px 0;
  }

  & button {
    background-color: c.$blue;
    color: c.$white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
  }
}

.button-wrapper {
  display: flex;
  gap: 10px;
}

lable {
  display: flex;
  align-items: center;
}
</style>
