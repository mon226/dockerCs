<template>
  <div class="import-popup" v-if="isImportPopup">
    <h2>Import Project</h2>
    <div class="fileImport">
      <h3>Choose a file to import</h3>
      <input type="file" @change="onFileChange" />
      <button @click="importProject">Import</button>
    </div>
    <div class="neo4jImport">
      <h3>Import from Neo4j</h3>
      <div v-if="beforeImport"><button @click="fetchNeo4jData">Load Available Projects</button></div>
      <div class="wrapper" v-if="!beforeImport">
        <div class="list">
          <ul>
            <li v-for="project in availableProjects" :key="project.id">
              <input type="radio" :id="project.id" v-model="selectedProjectId" :value="project.id" />
              <label :for="project.id">{{ project.id }} : {{ project.projectName }} : Last Saved At : {{ project.savedAt }}</label>
            </li>
          </ul>
        </div>
        <button @click="importFromNeo4j" :disabled="!selectedProjectId">
          Select
        </button>
      </div>
    </div>
    <button @click="closeImportPopup" class="close">Close</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useNetworkDataStore } from '../stores/networkData';
import axios from "axios";

export default defineComponent({
  name: 'CImportPopup',
  setup() {
    const store = useNetworkDataStore();
    const isImportPopup = computed(() => store.isImportPopup);
    const beforeImport = ref(true);
    interface Project {
      id: number;
      projectName: string;
      savedAt: string;
    }
    
    const availableProjects = ref<Project[]>([]);
    const selectedProjectId = ref<number | null>(null);
    const closeImportPopup = () => {
      store.setImportPopup("close");
      beforeImport.value = true;
    };
    const fetchNeo4jData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/get");
        availableProjects.value = response.data.data.sort((a, b) => a.id - b.id);
        beforeImport.value = false;
      } catch (error) {
        console.error("Error fetching Neo4j data:", error);
      }
    };
    const importFromNeo4j = async () => {
      if (!selectedProjectId.value) return;
      try {
        const project = availableProjects.value.find(p => p.id === selectedProjectId.value);
        if (project) {
          store.importProjectFromNeo4j(project);
        }
        store.setImportPopup("close");
      } catch (error) {
        console.error("Error importing project:", error);
      }
    };
    const onFileChange = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files.length > 0) {
        store.handleFileUpload(input.files[0]);
      }
      store.setImportPopup("close");
    };
    return {
      closeImportPopup,
      isImportPopup,
      availableProjects,
      selectedProjectId,
      fetchNeo4jData,
      importFromNeo4j,
      onFileChange,
      beforeImport,
    };
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.import-popup {
  position: absolute;
  top: 25%;
  left: 25%;
  width: 50%;
  height: 50%;
  background-color: c.$white;
  color: c.$black;
  z-index: 10000;
  border: 5px solid c.$sub_6;
  padding: 10px;
  & button {
    background-color: c.$sub_6;
    color: c.$white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
  }
}
input {
  margin-right: 10px;
  height: 100%;
  padding: 0.25rem;
}
.neo4jImport {
  h3 {
    margin-top: 10px;
  }
  ul {
    list-style: none;
    padding: 0;
    color: c.$black;
    margin: 20px 0;
    :hover {
      background-color: c.$sub_8;
      color: c.$white;
    }
  }
  li {
    margin: 5px 0;
    color: c.$black;
    input {
      margin-right: 5px;
    }

  }
}
.list {
  overflow-y: auto;
  max-height: 150px;
  width: 70%;
}
.wrapper {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}
.close {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>