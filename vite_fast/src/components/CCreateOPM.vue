<template>
  <div class="app">
    <!-- レイヤー表示のDiv -->
    <div class="layer-display">
      <h2>Layer一覧</h2>
      <ul>
        <li v-for="layer in layers" :key="layer">
          {{ layer }}
          <button class="delete-btn" @click="removeLayer(layer)">×</button>
        </li>
      </ul>
    </div>

    <!-- ノード追加のDiv -->
    <div class="node-add">
      <h2>Node追加</h2>
      <input v-model="nodeName" placeholder="ノード名を入力" />
      <select v-model="nodeLayer">
        <option v-for="layer in layers" :key="layer" :value="layer">
          {{ layer }}
        </option>
      </select>
      <button @click="addNode">追加</button>
    </div>

    <!-- ノード表示のDiv -->
    <div class="node-display">
      <h2>Node一覧</h2>
      <ul>
        <li v-for="node in nodes" :key="node.name + node.layer">
          {{ node.name }} ({{ node.layer }})
        </li>
      </ul>
    </div>

    <!-- エッジ追加のDiv -->
    <div class="edge-add">
      <h2>Edge追加</h2>
      <select v-model="edgeFrom">
        <option v-for="node in nodes" :key="'from-' + node.name + node.layer" :value="node">
          {{ node.name }} ({{ node.layer }})
        </option>
      </select>
      <select v-model="edgeType">
        <option v-for="type in edgeTypes" :key="type" :value="type">
          {{ type }}
        </option>
      </select>
      <select v-model="edgeTo">
        <option v-for="node in nodes" :key="'to-' + node.name + node.layer" :value="node">
          {{ node.name }} ({{ node.layer }})
        </option>
      </select>
      <button @click="addEdge">追加</button>
    </div>

    <!-- エッジ表示のDiv -->
    <div class="edge-display">
      <h2>Edge一覧</h2>
      <ul>
        <li v-for="edge in edges" :key="edge.from.name + edge.to.name">
          [{{ edge.from.name }}, {{ edge.to.name }}, {{ edge.from.layer }}, {{ edge.to.layer }}, {{ edge.type }}]
        </li>
      </ul>
      <button @click="emitEdges">表示</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "CreateOPM",
  emits: ["updateEdges", "updateNodes"],
  setup(_, { emit }) {
    const layers = ref(["business", "process", "object", "variable", "cost"]);
    const nodes = ref<{ name: string; layer: string }[]>([]);
    const edges = ref<
      { from: { name: string; layer: string }; to: { name: string; layer: string }; type: string }[]
    >([]);

    // ノード追加用の入力データ
    const nodeName = ref("");
    const nodeLayer = ref("process");

    // エッジ追加用の入力データ
    const edgeFrom = ref<{ name: string; layer: string } | null>(null);
    const edgeTo = ref<{ name: string; layer: string } | null>(null);
    const edgeType = ref("consists of");

    // エッジタイプのリスト
    const edgeTypes = [
      "consists of",
      "follows",
      "exhibits",
      "is",
      "handles",
      "requires",
      "consumes",
      "yields",
      "affects",
    ];

    // ノードを追加する関数
    const addNode = () => {
      if (!nodeName.value.trim()) {
        alert("ノード名を入力してください。");
        return;
      }
      nodes.value.push({ name: nodeName.value.trim(), layer: nodeLayer.value });
      nodeName.value = "";
      nodeLayer.value = "process";
      emit("updateNodes", nodes.value);
    };

    // エッジを追加する関数
    const addEdge = () => {
      if (!edgeFrom.value || !edgeTo.value) {
        alert("fromとtoの両方を選択してください。");
        return;
      }
      edges.value.push({ from: edgeFrom.value, to: edgeTo.value, type: edgeType.value });
      edgeFrom.value = null;
      edgeTo.value = null;
      edgeType.value = "consists of";
      emit("updateEdges", edges.value);
    };

    // エッジ情報を親コンポーネントに送信
    const emitEdges = () => {
      emit("updateEdges", edges.value);
      emit("updateNodes", nodes.value);
    };

    // レイヤーを削除する関数
    const removeLayer = (layer: string) => {
      layers.value = layers.value.filter(l => l !== layer);
    };

    return {
      layers,
      nodes,
      edges,
      edgeTypes,
      nodeName,
      nodeLayer,
      edgeFrom,
      edgeTo,
      edgeType,
      addNode,
      addEdge,
      emitEdges,
      removeLayer,
    };
  },
});
</script>


<style lang="scss">
@use "@/assets/style/color" as c;
.app {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px;

  .layer-display {
    border: 1px solid c.$gray;
    border-radius: 8px;
    padding: 10px;
    background-color: c.$white;
    color: c.$black;

    ul {
      list-style: none;
      padding: 0;

      li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 0;

        .delete-btn {
          background: c.$red;
          color: c.$white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &:hover {
            background: c.$maroon;
          }
        }
      }
    }
  }

  .node-add,
  .node-display,
  .edge-add,
  .edge-display {
    border: 1px solid c.$gray;
    border-radius: 8px;
    padding: 10px;
    background-color: c.$white;
    color: c.$black;
  }

  h2 {
    margin-bottom: 10px;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 5px 0;
    }
  }

  input,
  select,
  button {
    margin-right: 10px;
    margin-bottom: 5px;
    padding: 5px;
    font-size: 14px;
    border: 1px solid c.$gray-light;
  }

  button {
    background-color: c.$blue-light;
    color: c.$white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: c.$maroon;
    }
  }

  input {
    &:focus {
      border: 1px solid c.$maroon;
    }
  }
}
</style>
