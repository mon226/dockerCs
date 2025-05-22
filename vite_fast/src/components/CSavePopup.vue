<template>
  <div class="save-popup" v-if="isSavePopup">
    <div class="save-popup__inner">
      <h2>Save</h2>
      <p>Project Id: {{ projectNumber }}</p>
      <p>Project Name: {{ projectName }}</p>
      <div class="checkbox-group">
        <label>
          <input type="checkbox" v-model="isNeo4jSave" />
          Neo4jに保存
        </label>
        <label>
          <input type="checkbox" v-model="isJsonDownload" />
          JSON形式でダウンロード
        </label>
        <label>
          <input type="checkbox" v-model="isDsmDownload" />
          DSMでダウンロード
        </label>
      </div>
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
import * as XLSX from 'xlsx';

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
    const isNeo4jSave = ref(false); // デフォルトでtrue
    const isJsonDownload = ref(false);
    const isDsmDownload = ref(false);

    const closePopup = () => {
      store.setPopup("close");
    };

    const saveProject = async () => {
      const storeColors = store.colors;
      const storeLayers = store.layers;
      const layers = [];
      for (let i = 0; i < storeLayers.length; i++) {
        layers.push({ layer: storeLayers[i], color: storeColors[i] });
      }
      const saveDataset = {
        projectNumber: props.projectNumber,
        projectName: projectName.value,
        version: store.version,
        colorList: store.colorList,
        layers: layers,
        planeData: store.planeData,
        nodes: store.nodes,
        edges: store.edges,
        nodePositions: store.nodePositions,
        edgePositions: store.edgePositions,
      };
      console.log("Save dataset:", saveDataset);

      // Neo4jに保存
      if (isNeo4jSave.value) {
        try {
          const response = await fetch("http://localhost:8080/save", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(saveDataset),
          });
          const result = await response.json();
          console.log("Neo4j Save Success:", result);
        } catch (error) {
          console.error("Neo4j Save Error:", error);
        }
      }

      // JSONでダウンロード
      if (isJsonDownload.value) {
        const blob = new Blob([JSON.stringify(saveDataset)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project_${props.projectNumber}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // DSMでダウンロード
      if (isDsmDownload.value) {
        downloadDSM(saveDataset);
      }

      store.setPopup("close");
    };

    const downloadDSM = (saveDataset: any) => {
      const { nodes, edges, layers } = saveDataset;
      
      // nodesをlayersの順番でソート
      const sortedNodes = [...nodes].sort((a, b) => {
        const layerIndexA = layers.findIndex((layer: any) => layer.layer === a.node.layer);
        const layerIndexB = layers.findIndex((layer: any) => layer.layer === b.node.layer);
        if (layerIndexA !== layerIndexB) {
          return layerIndexA - layerIndexB;
        }
        return a.node.name.localeCompare(b.node.name);
      });

      const nodeCount = sortedNodes.length;
      
      // ワークブック作成
      const workbook = XLSX.utils.book_new();

      // 基本の行列フレームワークを作成する関数
      const createBaseMatrix = () => {
        const matrix: any[][] = [];
        
        // ヘッダー行1（layer）
        const layerRow = ['', ''];
        let currentLayer = '';
        for (const node of sortedNodes) {
          if (node.node.layer !== currentLayer) {
            layerRow.push(node.node.layer);
            currentLayer = node.node.layer;
          } else {
            layerRow.push('');
          }
        }
        matrix.push(layerRow);

        // ヘッダー行2（name）
        const nameRow = ['', ''];
        for (const node of sortedNodes) {
          nameRow.push(node.node.name);
        }
        matrix.push(nameRow);

        // データ行
        for (let i = 0; i < nodeCount; i++) {
          const row: any[] = [];
          const node = sortedNodes[i];
          
          // 行のlayer（初回のみ）
          let rowLayer = '';
          if (i === 0 || sortedNodes[i].node.layer !== sortedNodes[i-1].node.layer) {
            rowLayer = node.node.layer;
          }
          row.push(rowLayer);
          
          // 行のname
          row.push(node.node.name);
          
          // データセル（初期化）
          for (let j = 0; j < nodeCount; j++) {
            row.push('');
          }
          matrix.push(row);
        }
        
        return matrix;
      };

      // 重み文字列の逆数を取得する関数
      const getInverseWeight = (weight: string): string => {
        const inverseMap: { [key: string]: string } = {
          '+3': '+1/3',
          '+1': '+1',
          '+1/3': '+3',
          '0': '0',
          '-1/3': '-3',
          '-1': '-1',
          '-3': '-1/3'
        };
        return inverseMap[weight] || weight;
      };

      // セルスタイルを取得する関数
      const getCellStyle = (weight: string) => {
        const colorMap: { [key: string]: { bg: string; font: string } } = {
          '+3': { bg: '004563', font: 'FFFFFF' },
          '+1': { bg: '588da2', font: 'FFFFFF' },
          '+1/3': { bg: 'c3dde2', font: '000000' },
          '0': { bg: 'C0C0C0', font: 'FFFFFF' },
          '-1/3': { bg: 'e9c1c9', font: '000000' },
          '-1': { bg: 'c94c62', font: 'FFFFFF' },
          '-3': { bg: '9f1e35', font: 'FFFFFF' }
        };
        return colorMap[weight] || { bg: 'FFFFFF', font: '000000' };
      };

      // シート1: 対称行列（○印）
      const matrix1 = createBaseMatrix();
      for (const edge of edges) {
        const fromIndex = sortedNodes.findIndex(n => n.key === edge.edge.fromkey);
        const toIndex = sortedNodes.findIndex(n => n.key === edge.edge.tokey);
        if (fromIndex !== -1 && toIndex !== -1) {
          matrix1[fromIndex + 2][toIndex + 2] = '○';
          matrix1[toIndex + 2][fromIndex + 2] = '○';
        }
      }
      const sheet1 = XLSX.utils.aoa_to_sheet(matrix1);

      // シート2: type（非対称）
      const matrix2 = createBaseMatrix();
      for (const edge of edges) {
        const fromIndex = sortedNodes.findIndex(n => n.key === edge.edge.fromkey);
        const toIndex = sortedNodes.findIndex(n => n.key === edge.edge.tokey);
        if (fromIndex !== -1 && toIndex !== -1) {
          matrix2[fromIndex + 2][toIndex + 2] = edge.type;
        }
      }
      const sheet2 = XLSX.utils.aoa_to_sheet(matrix2);

      // シート3: weight（direction考慮）
      const matrix3 = createBaseMatrix();
      const sheet3Styles: { [key: string]: any } = {};
      for (const edge of edges) {
        const fromIndex = sortedNodes.findIndex(n => n.key === edge.edge.fromkey);
        const toIndex = sortedNodes.findIndex(n => n.key === edge.edge.tokey);
        if (fromIndex !== -1 && toIndex !== -1 && edge.info) {
          const weight = edge.info.weight;
          const direction = edge.info.direction;
          const style = getCellStyle(weight);
          
          if (direction === 'forward') {
            matrix3[fromIndex + 2][toIndex + 2] = weight;
            const cellRef = XLSX.utils.encode_cell({ r: fromIndex + 2, c: toIndex + 2 });
            sheet3Styles[cellRef] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
          } else if (direction === 'backward') {
            matrix3[toIndex + 2][fromIndex + 2] = weight;
            const cellRef = XLSX.utils.encode_cell({ r: toIndex + 2, c: fromIndex + 2 });
            sheet3Styles[cellRef] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
          } else if (direction === 'bidirectional') {
            matrix3[fromIndex + 2][toIndex + 2] = weight;
            matrix3[toIndex + 2][fromIndex + 2] = weight;
            const cellRef1 = XLSX.utils.encode_cell({ r: fromIndex + 2, c: toIndex + 2 });
            const cellRef2 = XLSX.utils.encode_cell({ r: toIndex + 2, c: fromIndex + 2 });
            sheet3Styles[cellRef1] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
            sheet3Styles[cellRef2] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
          }
        }
      }
      const sheet3 = XLSX.utils.aoa_to_sheet(matrix3);
      
      // シート4: weight（逆数考慮）
      const matrix4 = createBaseMatrix();
      const sheet4Styles: { [key: string]: any } = {};
      for (const edge of edges) {
        const fromIndex = sortedNodes.findIndex(n => n.key === edge.edge.fromkey);
        const toIndex = sortedNodes.findIndex(n => n.key === edge.edge.tokey);
        if (fromIndex !== -1 && toIndex !== -1 && edge.info) {
          const weight = edge.info.weight;
          const direction = edge.info.direction;
          const inverseWeight = getInverseWeight(weight);
          const style = getCellStyle(weight);
          const inverseStyle = getCellStyle(inverseWeight);
          
          if (direction === 'forward') {
            matrix4[fromIndex + 2][toIndex + 2] = weight;
            matrix4[toIndex + 2][fromIndex + 2] = inverseWeight;
            const cellRef1 = XLSX.utils.encode_cell({ r: fromIndex + 2, c: toIndex + 2 });
            const cellRef2 = XLSX.utils.encode_cell({ r: toIndex + 2, c: fromIndex + 2 });
            sheet4Styles[cellRef1] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
            sheet4Styles[cellRef2] = {
              fill: { fgColor: { rgb: inverseStyle.bg } },
              font: { color: { rgb: inverseStyle.font } }
            };
          } else if (direction === 'backward') {
            matrix4[toIndex + 2][fromIndex + 2] = weight;
            matrix4[fromIndex + 2][toIndex + 2] = inverseWeight;
            const cellRef1 = XLSX.utils.encode_cell({ r: toIndex + 2, c: fromIndex + 2 });
            const cellRef2 = XLSX.utils.encode_cell({ r: fromIndex + 2, c: toIndex + 2 });
            sheet4Styles[cellRef1] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
            sheet4Styles[cellRef2] = {
              fill: { fgColor: { rgb: inverseStyle.bg } },
              font: { color: { rgb: inverseStyle.font } }
            };
          } else if (direction === 'bidirectional') {
            matrix4[fromIndex + 2][toIndex + 2] = weight;
            matrix4[toIndex + 2][fromIndex + 2] = weight;
            const cellRef1 = XLSX.utils.encode_cell({ r: fromIndex + 2, c: toIndex + 2 });
            const cellRef2 = XLSX.utils.encode_cell({ r: toIndex + 2, c: fromIndex + 2 });
            sheet4Styles[cellRef1] = {
              fill: { fgColor: { rgb: style.bg } },
              font: { color: { rgb: style.font } }
            };
            sheet4Styles[cellRef2] = {
              fill: { fgColor: { rgb: style.bg } },  
              font: { color: { rgb: style.font } }
            };
          }
        }
      }
      const sheet4 = XLSX.utils.aoa_to_sheet(matrix4);

      // ワークブックにシートを追加
      XLSX.utils.book_append_sheet(workbook, sheet1, 'DSM_対称行列');
      XLSX.utils.book_append_sheet(workbook, sheet2, 'DSM_タイプ');
      XLSX.utils.book_append_sheet(workbook, sheet3, 'DSM_重み');
      XLSX.utils.book_append_sheet(workbook, sheet4, 'DSM_重み逆数');

      // ファイルをダウンロード
      XLSX.writeFile(workbook, `DSM_project_${props.projectNumber}.xlsx`);
    };

    return {
      closePopup,
      isSavePopup,
      projectName,
      isNeo4jSave,
      isJsonDownload,
      isDsmDownload,
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
  border: 5px solid c.$sub_6;
  padding: 10px;

  .checkbox-group {
    margin: 20px 0;
  }

  & label {
    display: flex;
    align-items: center;
    margin: 10px 0;
  }

  & button {
    background-color: c.$sub_6;
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
</style>