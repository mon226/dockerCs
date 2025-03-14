<template>
  <div class="h2-wrapper">
    <h2>{{ h2Title }}</h2>
    <font-awesome-icon
      :icon="['fas', 'download']"
      @click="download(content)"
      style="color: #0d0d0d;"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { useNetworkDataStore } from "../../stores/networkData";

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
        let csvContent = `"name","layer"\n`;
        for (const node of nodesCopy.value) {
          csvContent += `${node.node.name},${node.node.layer}\n`;
        }
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName.value}_nodes.csv`;
        a.click();
      } else if (content === "edges") {
        let csvContent = "type,fromname,fromlayer,toname,tolayer\n";
        for (const edge of edgesCopy.value) {
          csvContent += `${edge.edge.fromname},${edge.edge.fromlayer},${edge.type},${edge.edge.toname},${edge.edge.tolayer}\n`;
        }
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName.value}_edges.csv`;
        a.click();
        // iconv -c -f utf-8 -t shift-JIS 洋上浮体発電システム_nodes.csv > 洋上浮体発電システム_nodes.csv
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