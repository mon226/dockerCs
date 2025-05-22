<template>
  <div class="h2-wrapper">
    <h2>{{ h2Title }}</h2>
    <font-awesome-icon
      :icon="['fas', 'download']"
      @click="download(content)"
      style="color: #373231;"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useNetworkDataStore } from "../../stores/networkData";
import * as XLSX from 'xlsx';

export default defineComponent({
  props: {
    h2Title: String,
    content: String,
  },
  setup() {
    const projectName = computed(() => store.projectName);
    const store = useNetworkDataStore();
    const nodes = computed(() => store.nodes);
    const nodesCopy = ref(nodes.value);
    const edges = computed(() => store.edges);
    const edgesCopy = ref(edges.value);

    const download = (content: string) => {
      if (content === "nodes") {
        // ノードデータを配列形式に変換
        const data = nodesCopy.value.map(node => ({
          name: node.node.name,
          layer: node.node.layer
        }));

        // ワークシートを作成
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // ワークブックを作成
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Nodes");
        
        // ファイルをダウンロード
        XLSX.writeFile(workbook, `${projectName.value}_nodes.xlsx`);
        
      } else if (content === "edges") {
        // エッジデータを配列形式に変換
        const data = edgesCopy.value.map(edge => ({
          type: edge.type,
          fromname: edge.edge.fromname,
          fromlayer: edge.edge.fromlayer,
          toname: edge.edge.toname,
          tolayer: edge.edge.tolayer,
          // edge.infoが存在する場合は追加情報も含める
          ...(edge.info && {
            direction: edge.info.direction || '',
            weight: edge.info.weight || ''
          })
        }));

        // ワークシートを作成
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        // 列幅を自動調整（オプション）
        const columnWidths = [
          { wch: 10 }, // type
          { wch: 20 }, // fromname
          { wch: 15 }, // fromlayer
          { wch: 20 }, // toname
          { wch: 15 }, // tolayer
          { wch: 10 }, // direction
          { wch: 10 }  // weight
        ];
        worksheet['!cols'] = columnWidths;
        
        // ワークブックを作成
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Edges");
        
        // ファイルをダウンロード
        XLSX.writeFile(workbook, `${projectName.value}_edges.xlsx`);
      }
    };

    return {
      nodes,
      edges,
      download,
    };
  },
});
</script>

<style lang="scss">
.h2-wrapper {
  display: flex;
  align-items: center;
  gap: 30px;
}
</style>