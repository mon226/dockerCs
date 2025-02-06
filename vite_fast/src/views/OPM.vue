<template>
  <layout>
    <template #default>
      <div class="threedOPM">
        <CSavePopup :projectNumber="projectNumber"/>
        <CImportPopup/>
        <div class="leftBody">
          <COPMLeftBody @makeNewProject="handleNewProject"  :projectNumber="projectNumber"/>
        </div>
        <div class="rightBody">
          <COPMRightBody />
        </div>
      </div>
    </template>
  </layout>
</template>

<script>
import { defineComponent, computed } from 'vue';
import layout from '@/components/CLayout.vue'
import COPMLeftBody from '@/components/COPMLeftBody.vue'
import COPMRightBody from '@/components/COPMRightBody.vue'
import CSavePopup from '@/components/CSavePopup.vue'
import CImportPopup from '@/components/CImportPopup.vue'
import { useNetworkDataStore } from "@/stores/networkData";

export default defineComponent({
  setup() {
    const store = useNetworkDataStore();
    const flag = computed(() => store.flag);
    const projectNumber = computed(() => store.projectNumber);

    const handleNewProject = () => {
      fetch("http://localhost:8080/count")
        .then((response) => response.json())
        .then((data) => {
          store.setProjectNumber(projectNumber.value = data.count !== undefined ? data.count : 0);
        })
        .catch((error) => {
          console.error("Error fetching project count:", error);
        });
      store.setFlag(1);
    };
    return {
      projectNumber,
      flag,
      handleNewProject,
      store,
    };
  },
  components: {
    layout,
    COPMLeftBody,
    COPMRightBody,
    CSavePopup,
    CImportPopup,
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.threedOPM {
  display: flex;
  min-height: 88vh;
  position: relative;
  .leftBody {
    width: 35%;
    border-right: 3px solid c.$white;
    position: relative;
  }
  .rightBody {
    width: 65%;
    position: relative;
  }
}
</style>