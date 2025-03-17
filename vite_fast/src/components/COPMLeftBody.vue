<template>
  <div class="OPMsetting">
    <div class="wrapper">
      <ul>
        <li>
          <a href="#">Menu</a>
          <button @click="toggleMenu" id="triangle">
            {{ isMenuOpen ? '\u25B3' : '\u25BD' }}
          </button>
        </li>
        <div v-if="isMenuOpen" class="submenu">
          <li><a href="#" @click="makeNewProject">Make a New Project</a></li>
          <li><a href="#" @click="save">Save</a></li>
          <li><a href="#" @click="importModel">Import</a></li>
        </div>
      </ul>
    </div>
    <div class="projectInfo" v-if="isVisibleInfo">
      <AH1 :h1Id="'projectSetting'" h1Title="Project Setting" />
      <p>Project Id: {{ projectNumber }}</p>
      <label for="projectName">Now Open：</label>
      <input
        id="projectName"
        type="text"
        v-model="store.projectName"
        v-if="!isNameConfirmed"
      />
      <span v-else>{{ projectName }}</span>
      <button @click="confirmProjectName" v-if="!isNameConfirmed" class="square-btn">作成</button>
    </div>
    <div class="layerControl" v-if="isVisibleInfo">
      <div id="layerControlWrapper">
        <h2>Layer Control</h2>
        <button @click="toggleLayerControl" id="triangle">
          {{ isLayerVisible ? '\u25B3' : '\u25BD' }}
        </button>
      </div>
      <div v-if="isLayerVisible" class="expanded">
        <ul>
          <li v-for="(layer, index) in layersCopy" :key="index">
            {{ layer }}
            <div class="layerSetting">
              <button 
                :style="{ backgroundColor: colors[index], width: '20px', height: '20px', border: 'none', cursor: 'pointer' }"
                @click="alertColor(index)"
                class="layerColor"
              ></button>
              <AColorSetting
                v-if="editColor[index]"
                :index = "index"
              />
              <button @click="removeLayer(layer)" class="delete-btn" v-if="!isLayerConfirmed">×</button>
            </div>
          </li>
        </ul>
        <input v-model="newLayer" placeholder="Add a new layer" v-if="!isLayerConfirmed"/>
        <button @click="addLayer" class="square-btn" id="addLayer" v-if="!isLayerConfirmed">追加</button>
        <button @click="confirmLayer" class="square-btn" v-if="!isLayerConfirmed">確定</button>
        <button @click="editLayer" class="square-btn" v-if="isLayerConfirmed">編集</button>
      </div>
    </div>
    <div id="importOPL" v-if="isVisibleInfo">
      <div id="importOPLWrapper">
        <h2>Import OPL</h2>
        <button @click="toggleImportOPL" id="triangle">
          {{ isImportOPLVisible ? '\u25B3' : '\u25BD' }}
        </button>
      </div>
      <div id="inputOPL" v-if="isImportOPLVisible">
        <div id="canImportOPL" v-if="canImportOPL">
          <textarea v-model="oplText" rows="10" cols="50"></textarea>
          <button class="square-btn" @click="inputOPL">Import</button>
        </div>
        <div id="oplSetting" v-if="canSettingOPL">
          <table>
          <tbody>
            <tr v-for="(node, index) in oplNodesCopy" :key="index">
              <td>{{ index }}</td>
              <td>{{ node }}</td>
              <td>
                <select v-model="selectedLayers[index]">
                  <option v-for="(layer, index) in layersCopy" :key="index" :value="layer">
                    {{ layer }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
          </table>
          <button class="square-btn" @click="confirmOPL">確定</button>
        </div>
      </div>
    </div>
    <div class="nodeControl" v-if="isVisibleInfo">
      <div id="nodeControlWrapper">
        <h2>Node Control</h2>
        <button @click="toggleNodeControl" id="triangle">
          {{ isNodeVisible ? '\u25B3' : '\u25BD' }}
        </button>
      </div>
      <div class="nodeInfo" v-if="isNodeVisible">
        <div class="newNode" v-if="ableAddNewNode">
          <input v-model="newNodeName" type="text" placeholder="New Node Name" />
          <select v-model="selectedLayer">
            <option v-for="(layer, index) in layersCopy" :key="index" :value="layer">
              {{ layer }}
            </option>
          </select>
          <button @click="addNode" class="square-btn">追加</button>
        </div>
        <AH2 h2Title="Node List" :content="'nodes'" />
        <ul>
          <li v-for="(node, index) in sortedNodes" :key="index"  :style="getNodeStyle(node.node.layer)">
            <div class="nodeWrapper">
              <input
                v-if="editingNodeKey === node.key"
                v-model="editedKey"
                @blur="saveEdit(node)"
                @keyup.enter="saveEdit(node)"
                class="edit-input"
              />
              <span v-else class="longKey">
                {{ node.key }}
              </span>
              <button 
                @click="startEditing(node)" 
                v-if="editingNodeKey !== node.key"
                style="background: none; border: none; padding: 0; cursor: pointer; height: 25px; margin-right: 0.5rem;"
              >
                <font-awesome-icon 
                  :icon="['fas', 'pen-to-square']"
                  style="color: #0d0d0d; font-size: 20px; border: 1px solid transparent; padding: 1.5px;"
                />
              </button>
              <button @click="removeNode(node.key)" class="delete-btn">×</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="edgeControl" v-if="isVisibleInfo">
      <div id="edgeControlWrapper">
        <h2>Edge Control</h2>
        <button @click="toggleEdgeControl" id="triangle">
          {{ isEdgeVisible ? '\u25B3' : '\u25BD' }}
        </button>
      </div>
      <div class="edgeInfo" v-if="isEdgeVisible">
        <div class="newEdge" v-if="canMakeNewEdge">
          <select v-model="edgeFrom">
            <option v-for="(node, index) in nodes" :key="index" :value="node.key">
              {{ node.key }}
            </option>
          </select>
          <select v-model="edgeType">
            <option v-for="(type, index) in edgeTypes" :key="index" :value="type">
              {{ type }}
            </option>
          </select>
          <select v-model="edgeTo">
            <option v-for="(node, index) in nodes" :key="index" :value="node.key">
              {{ node.key }}
            </option>
          </select>
          <button @click="addEdge" class="square-btn">追加</button>
        </div>
        <AH2 h2Title="Edge List" :content="'edges'" />
        <ul>
          <li v-for="(edge, index) in sortedEdges" :key="index">
            <span class="longKey">
              <div class="edgeName">
                {{ edge.edge.fromname }}
                <span class="edgeType" :style="getEdgeTypeStyle(edge.type)">
                  {{ edge.type }}
                </span>
                {{ edge.edge.toname }}
              </div>
            </span>
            <button @click="removeEdge(edge.key)" class="delete-btn">×</button>
          </li>
        </ul>
      </div>
    </div>
  </div>

</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import AH1 from '@/components/atoms/AH1.vue';
import AH2 from '@/components/atoms/AH2.vue';
import AColorSetting from '@/components/atoms/AColorSetting.vue';
import { useNetworkDataStore } from "@/stores/networkData";
import { computed } from 'vue';

export default defineComponent({
  props: {
    projectNumber: {
      type: Number,
      required: true
    },
  },
  setup(props, { emit }) {
    const projectName = computed(() => store.projectName);
    const isMenuOpen = ref(false);
    const isVisibleInfo = ref(false);
    const isNameConfirmed = ref(false);
    const store = useNetworkDataStore();
    const newLayer = ref("");
    const layers = computed(() => store.layers);
    const layersCopy = ref(layers.value);
    const isLayerConfirmed = ref(false);
    const flag = computed(() => store.flag);
    const ableAddNewNode = ref(false);
    const newNodeName = ref('');
    const selectedLayer = ref('');
    const nodes = computed(() => store.nodes);
    const isLayerVisible = ref(false);
    const isNodeVisible = ref(false);
    const isEdgeVisible = ref(false);
    const edgeFrom = ref('');
    const edgeType = ref('');
    const edgeTo = ref('');
    const edgeTypes = ["consists of", "follows",  "exhibits",  "is",  "handles",  "requires",  "consumes",  "yields",  "affects"];
    const edgeTypesColor = ["#262730", "#5d98b0", "#26273033", "#f3f3f3", "#f4da24", "#e0815e", "#2e9058", "#b61f22", "#731a3d"];
    const edges = computed(() => store.edges);
    const canMakeNewEdge = computed(() => nodes.value.length > 1);
    const canImportOPL = ref(false);
    const oplText = ref('');
    const oplEdges = computed(() => store.oplEdges);
    const isImportOPLVisible = ref(false);
    const canSettingOPL = ref(false);
    const oplNodes = computed(() => store.oplNodes);
    const oplNodesCopy = ref(oplNodes.value);
    const selectedLayers = ref([]);
    const colors = computed(() => store.colors);
    const colorList = computed(() => store.colorList);
    const editColor = computed(() => store.editColor);
    const aColorSettingList = ref(new Array(layersCopy.value.length).fill(false));
    const editingNodeKey = ref("");
    const editedKey = ref("");

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };
    const toggleLayerControl = () => {
      isLayerVisible.value = !isLayerVisible.value;
    };
    const toggleNodeControl = () => {
      isNodeVisible.value = !isNodeVisible.value;
    };
    const toggleEdgeControl = () => {
      isEdgeVisible.value = !isEdgeVisible.value;
    };
    const toggleImportOPL = () => {
      isImportOPLVisible.value = !isImportOPLVisible.value;
    };

    const makeNewProject = () => {
      emit('makeNewProject');
      isMenuOpen.value = false;
      isVisibleInfo.value = true;
      selectedLayers.value = new Array(oplNodes.value.length).fill('');
    };

    const save = () => {
      isMenuOpen.value = false;
      store.setPopup("open");
    };

    const importModel = () => {
      isMenuOpen.value = false;
      store.setImportPopup("open");
    };

    const inputOPL = () => {
      store.setOPL(oplText.value);
      oplNodesCopy.value = store.oplNodes;
      oplText.value = '';
      canImportOPL.value = false;
      canSettingOPL.value = true;
    };
    const confirmOPL = () => {
      if (selectedLayers.value.includes('')) {
        alert('全てのノードにレイヤーを設定してください');
        return;
      }
      canSettingOPL.value = false;
      isImportOPLVisible.value = false;
      store.makeNodePositionsFromOPL(selectedLayers.value);
      store.makeEdgePositionsFromOPL(selectedLayers.value);
      isNodeVisible.value = true;
      isEdgeVisible.value = true;
      if (flag.value === 3) {
        store.setFlag(4);
      } else {
        store.setFlag(3);
      }
    };
    const confirmProjectName = ( ) => {
      const confirmed = confirm(`「${projectName.value}」というプロジェクト名で良いですか？`);
      if (confirmed) {
        isNameConfirmed.value = true;
        store.setFlag(2);
        isLayerVisible.value = true;
        store.setProjectName(projectName.value);
      }
    };
    const addLayer = () => {
      if (newLayer.value.trim()) {
        layersCopy.value = [...layersCopy.value, newLayer.value.trim()];
        store.addLayer(newLayer.value.trim());
        newLayer.value = ""; 
      }
    };
    const removeLayer = (layer) => {
      store.removeLayer(layer);
      layersCopy.value = layersCopy.value.filter((l) => l !== layer);
    };
    const confirmLayer = () => {
      isLayerConfirmed.value = true;
      store.setFlag(3);
      ableAddNewNode.value = true;
      isLayerVisible.value = false;
      canImportOPL.value = true;
    };
    const editLayer = () => {
      isLayerConfirmed.value = false;
      store.setFlag(2);
      ableAddNewNode.value = false;
      canImportOPL.value = false;
    };
    const getEdgeTypeStyle = (type) => {
      const index = edgeTypes.indexOf(type);
      if (index === -1) return {};

      const backgroundColor = edgeTypesColor[index];
      let textColor = "#0d0d0d";
      let border = "";

      if (backgroundColor === "#262730" || backgroundColor === "#26273033" || backgroundColor === "#731a3d") {
        textColor = "#f3f3f3";
      } else if (backgroundColor === "#f3f3f3") {
        border = "1px solid #0d0d0d";
      }

      return {
        backgroundColor,
        color: textColor,
        border
      };
    };
    const getNodeStyle = (type) => {
      const index = layersCopy.value.indexOf(type);
      if (index === -1) return {};

      const backgroundColor = `${colors.value[index]}66`; 
      const width = "100%";
      return {
        backgroundColor,
        width,
      };
    }
    const alertColor = (index) => {
      store.setEditColor(index, true);
    };
    const addNode = () => {
      if (newNodeName.value.trim() && selectedLayer.value) {
        const key = `${newNodeName.value} ( ${selectedLayer.value} )`;
        if (!nodes.value.find(nodeData => nodeData.key === key)) {
          store.addNode(newNodeName.value.trim(), selectedLayer.value);
          if (flag.value === 3) {
            store.setFlag(4);
          } else {
            store.setFlag(3);
          }
        } else {
          alert('このノードは既に存在します');
        }
        newNodeName.value = '';
        selectedLayer.value = '';
      } else {
        alert('ノード名とレイヤーを選択してください');
      }
    };
    const removeNode = (key) => {
      store.removeNode(key);
      if (flag.value === 3) {
        store.setFlag(4);
      } else {
        store.setFlag(3);
      }
    };
    const startEditing = (node) => {
      editingNodeKey.value = node.key;
      editedKey.value = node.node.name;
    };

    const saveEdit = (node) => {
      if (editedKey.value.trim() && editedKey.value !== node.node.name) {
        store.updateNodeKey(node.key, editedKey.value, node.node.layer);
        if (flag.value === 3) {
          store.setFlag(4);
        } else {
          store.setFlag(3);
        }
      }
      editingNodeKey.value = null;
    };

    const addEdge = () => {
      if (edgeFrom.value && edgeTo.value) {
        if (edgeFrom.value === edgeTo.value) {
          alert('fromとtoが同じノードです');
          return;
        }
        store.addEdge( edgeFrom.value, nodes.value.find(node => node.key === edgeFrom.value).node.name, nodes.value.find(node => node.key === edgeFrom.value).node.layer, edgeTo.value, nodes.value.find(node => node.key === edgeTo.value).node.name, nodes.value.find(node => node.key === edgeTo.value).node.layer, edgeType.value );
        if (flag.value === 3) {
          store.setFlag(4);
        } else {
          store.setFlag(3);
        }
        edgeFrom.value = '';
        edgeTo.value = '';
        edgeType.value = '';
      } else {
        alert('fromとtoの両方を選択してください');
      }
    };
    const removeEdge = (key) => {
      store.removeEdge(key);
      if (flag.value === 3) {
        store.setFlag(4);
      } else {
        store.setFlag(3);
      }
    };
    watch(
      () => flag.value, 
      (newFlag) => {
        if (newFlag === 1) {
          store.setProjectName("New Project");
          isVisibleInfo.value = true;
          isNameConfirmed.value = false;
          isLayerConfirmed.value = false;
          isLayerVisible.value = false;
          isNodeVisible.value = false;
          isEdgeVisible.value = false;
          isImportOPLVisible.value = false;
          canImportOPL.value = false;
          canSettingOPL.value = false;
          oplNodesCopy.value = [];
          selectedLayers.value = [];
        } 
      },
      (newFlag) => {
        if (newFlag === 8) {
          oplNodesCopy.value = [...oplNodesCopy.value, ...oplNodes.value];
          store.setFlag(3);
        }
      },
      { immediate: true }
    );
    watch(flag, () => {
      if (flag.value === 9) {
          isMenuOpen.value = false;
          isNameConfirmed.value = true;
          isVisibleInfo.value = true;
          isEdgeVisible.value = true;
          isNodeVisible.value = true;
          isLayerConfirmed.value = true;
          ableAddNewNode.value = true;
          layersCopy.value = [];
          layersCopy.value = [...layers.value];
        }
      },
      { immediate: true }
    ); 

    return {
      makeNewProject,
      projectName,
      confirmProjectName,
      isMenuOpen,
      toggleMenu,
      save,
      importModel,
      isVisibleInfo,
      isNameConfirmed,
      layers: store.layers,
      newLayer,
      addLayer,
      removeLayer,
      layersCopy,
      isLayerConfirmed,
      confirmLayer,
      editLayer,
      store,
      ableAddNewNode,
      nodes,
      addNode,
      newNodeName,
      selectedLayer,
      toggleLayerControl,
      isLayerVisible,
      toggleNodeControl,
      isNodeVisible,
      isEdgeVisible,
      toggleEdgeControl,
      toggleImportOPL,
      isImportOPLVisible,
      edgeFrom,
      edgeType,
      edgeTo,
      edgeTypes,
      edges,
      addEdge,
      canMakeNewEdge,
      removeNode,
      removeEdge,
      canImportOPL,
      oplText,
      inputOPL,
      oplEdges,
      canSettingOPL,
      oplNodes,
      oplNodesCopy,
      selectedLayers,
      confirmOPL,
      colors,
      colorList,
      alertColor,
      editColor,
      aColorSettingList,
      startEditing,
      editedKey,
      saveEdit,
      editingNodeKey,
      flag,
      edgeTypesColor,
      getEdgeTypeStyle,
      getNodeStyle
    };
  },
  components: {
    AH1,
    AH2,
    AColorSetting
  },
  computed: {
    sortedNodes() {
      const layerOrder = this.layersCopy;

      return [...this.nodes].sort((a, b) => {
        return layerOrder.indexOf(a.node.layer) - layerOrder.indexOf(b.node.layer);
      });
    },
    sortedEdges() {
      const layerOrder = this.layersCopy;

      return [...this.edges].sort((a, b) => {
        const fromLayerOrder = layerOrder.indexOf(a.edge.fromlayer) - layerOrder.indexOf(b.edge.fromlayer);
        if (fromLayerOrder !== 0) {
          return fromLayerOrder;
        }
        return layerOrder.indexOf(a.edge.tolayer) - layerOrder.indexOf(b.edge.tolayer);
      });
    }
  },
  emits: ['makeNewProject']
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.OPMsetting {
  width: 95%;
  min-height: 85vh;
  background-color: #f3f3f3CC;
  border: 5px solid c.$blue;
}
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  & ul {
    padding: 0;
    width: 100%;
  }
  & li {
    list-style: none;
    line-height: 1;
    padding: 1rem;
    border-bottom: 1px dashed c.$gray;
  }
  & li:last-child {
    border-bottom: none;
  }
  & a {
    color: c.$black;
    text-decoration: none;
    font-size: 1.2rem;
    padding: 0 0rem;
    &:hover {
      background-color: c.$maroon;
      color: c.$white;
    }
  }
}
li {
  &:hover {
    background-color: c.$maroon;
    a {
      color: c.$white;
    }
    #triangle {
      color: c.$white;
    }
  }
}

.projectInfo {
  border-top: 5px solid c.$blue;
  border-bottom: 5px solid c.$blue;
  padding: 1rem;
  color: c.$black;
  & .h1-wrapper {
    margin-bottom: 10px;
  }
}

.layerControl {
  margin-top: 1rem;
  padding: 0 1rem 1rem 1rem;
  border-bottom: 5px solid c.$blue;

  .expanded {
    color: c.$black;
  }
}

#triangle {
  margin-left: 10px;
  font-size: 1.2rem;
  color: c.$gray;
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: c.$white;
  }

  &:focus {
    outline: none;
  }
}
button {
  color: c.$white;
}
h2 {
  color: c.$black;
}
.expanded li {
  background-color: c.$blue;
  padding: 0.5rem;
  color: c.$white;
  width: 45%;
  margin-bottom: 0.5rem;
  border-radius: 5px;
}
.layerSetting {
  float: right;
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
}
.delete-btn {
  background: c.$maroon;
  color: c.$white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: c.$red;
  }
}
.expanded ul {
  list-style-type: none;
  display: flex;
  flex-wrap: wrap;
  gap: 2.5%;
}
.square-btn {
  padding: 0.25rem 0.5rem;
  background-color: c.$blue;
  color: c.$white;
  border-radius: 5px;
  margin-left: 10px
}
input {
  height: 30px;
  border: 2px solid c.$maroon;
  padding: 0 0.25rem;
}

.nodeControl {
  margin-top: 1rem;
  padding: 0 1rem 1rem 1rem;
  border-bottom: 5px solid c.$blue;
}
#layerControlWrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nodeControl select {
  margin-left: 0.5rem;
  border: 2px solid c.$maroon;
  padding: 0 0.25rem;
}
.nodeControl ul {
  color: c.$black;
  list-style-type: none;
}
#nodeControlWrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nodeInfo {
  max-height: 200px;
  overflow-y: auto;
  & li {
    display: flex;
    align-items: center;;
  }
  & li span {
    margin-right: 1rem;
  }
}
.edgeControl {
  margin-top: 1rem;
  padding: 0 1rem 1rem 1rem;
  border-bottom: 5px solid c.$blue;
}
#edgeControlWrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.edgeControl select {
  border: 2px solid c.$maroon;
  padding: 0 0.25rem;
}
.edgeControl ul {
  color: c.$black;
  list-style-type: none;
}
.edgeInfo {
  max-height: 200px;
  overflow-y: auto;
  & li {
    min-width: 95%;
    display: flex;
  }
  & button {
    margin-left: 2.5px;
  }
}
.newEdge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
#importOPL {
  margin-top: 1rem;
  padding: 0 1rem 1rem 1rem;
  border-bottom: 5px solid c.$blue;
  & p {
    color: c.$black;
    text-decoration: none;
    font-size: 1.2rem;
    padding: 1rem;
    line-height: 1;
  }
}

#canImportOPL {
  display: flex;
  align-items: flex-end;
  padding: 0 1rem 1rem 1rem;
  & textarea {
    width: 100%;
    border: 2px solid c.$maroon;
    padding: 0.5rem;
  }
}
#importOPLWrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#oplSetting {
  color: c.$black;
  & select {
    margin-left: 0.5rem;
    border: 2px solid c.$maroon;
    padding: 0 0.25rem;
}
}
.longKey {
  display: inline-block;
  max-width: calc(100% - 30px);
  overflow: auto;
  white-space: nowrap;
  padding-right: 0.5rem;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: c.$white;
}
.edgeName {
  display: flex;
  align-items: center;
}
.edgeType {
  font-size: 0.8rem;
  padding: 0.1rem 0.3rem;
  border-radius: 5px;
  margin: 0 0.1rem;
}
.nodeWrapper {
  display: flex;
  align-items: center;
  width: 100%;
  &:hover {
    background-color: c.$maroon;
  }
}
</style>

