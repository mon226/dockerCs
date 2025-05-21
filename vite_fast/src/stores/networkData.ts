import { directiveHooks, set } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref, watch, reactive } from "vue";
import { reviseData } from "./versionManager";

const layers = ref(["business", "process", "object", "variable", "cost"]);
const flag = ref(0);
const nodes = ref<{ key: string; node: { name: string; layer: string } }[]>([]);
const edges = ref<{ key: string; type: string;  edge: { fromkey: string; fromname: string; fromlayer: string; tokey: string; toname: string; tolayer: string } ;   info?: { direction: string; weight: string; };}[]>([]);
const colors = ref(["#CC7F30", "#3bc3ff", "#70e483", "#731A3D", "#F4DA24"]);
const colorList = ref(["#CC7F30", "#3bc3ff", "#70e483", "#731A3D", "#F4DA24"]);
const half = ref(0);
const availableGrid = ref<{ x: number; y: number; z: number }[]>([]);
const newNodes = ref<{ key: string; node: { name: string; layer: string } }[]>([]);
const newEdges = ref<{ key: string; type: string;  edge: { fromkey: string; fromname: string; fromlayer: string; tokey: string; toname: string; tolayer: string } }[]>([]);
const dataset = ref<{}>({});
const isSavePopup = ref(false);
const projectName = ref('');
const projectNumber = ref(0);
const isImportPopup = ref(false);
const editColor = ref(new Array(layers.value.length).fill(false));
const version = import.meta.env.VITE_VERSION as string;
const planeData = ref({ m:9, d:3 });

watch(flag, () => {
  if (flag.value === 1) {
    nodes.value = [];
    edges.value = [];
    newNodes.value = [];
    newEdges.value = [];
    dataset.value = {};
    oplEdges.value = [];
    oplNodes.value = [];
    oplErrors.value = [];
    availableGrid.value = [];
    setAvailableGrid();
    nodePositions.splice(0, nodePositions.length);
    edgePositions.splice(0, edgePositions.length);
  }
});
const addLayer = (layer: string) => {
  if (layer && !layers.value.includes(layer)) {
    layers.value.push(layer);
  }
};

const removeLayer = (layer: string) => {
  const index = layers.value.indexOf(layer);
  layers.value = [...layers.value.filter((l) => l !== layer)];
  colors.value = colors.value.filter((_, i) => i !== index);
};

const setFlag = (n: number) => {
  flag.value = n;
};

const setDataset = (data: {}) => {
  dataset.value = data;
}
const oplEdges = ref<string[]>([]);
const oplNodes = ref<string[]>([]);
const oplErrors = ref<string[]>([]);

const setOPL = (opl: string) => {
  oplEdges.value = opl.split("\n").map((node) => node.slice(0, -1));
  oplEdges.value = oplEdges.value.filter((node) => {
    if (
      node.includes("relates to") ||
      node.includes("consists of") ||
      node.includes("follows") ||
      node.includes("exhibits") ||
      node.includes("is") ||
      node.includes("handles") ||
      node.includes("requires") ||
      node.includes("consumes") ||
      node.includes("yields") ||
      node.includes("affects")
    ) {
      return true;
    } else {
      oplErrors.value.push(node);
      return false;
    }
  });  
  console.log(oplErrors.value);
  console.log(oplEdges.value);
  
  oplEdges.value = oplEdges.value.map((node) =>
    node
      .replace(/・/g, "##and##")
      .replace(/ /g, " ")
      .replace(/, and /g, "##and##")
      .replace(/,/g, "##and##")
      .replace(/ and /g, "##and##")
      .replace(/relates to/g, "affects")
      .replace(/consists of/g, "consists!!!!of")
      .replace(/(consists!!!!of|follows|exhibits|is|handles|requires|consumes|yields|affects)/g, "%%%$1%%%")
      .replace(/ /g, "")
      .replace(/!!!!/g, " ")
  );  
  oplEdges.value = oplEdges.value.map((edge) => {
    if (edge.includes("##and##")) {
      const words = edge.split("%%%");
      const firstWords = words[0];
      const lastWords = words[2].split("##and##");
      const middleWords = words[1];
      const newEdges: string[] = [];
      lastWords.forEach((lastWord) => {
        newEdges.push(`${firstWords}%%%${middleWords}%%%${lastWord}`);
      });
      return newEdges;
    } else {
      return edge;
    }
  }).flat();
  oplEdges.value.forEach((edge, index) => {
    const words = edge.split("%%%");
    words.forEach((word, wordIndex) => {
      if (wordIndex % 2 === 0) { 
        const subWords = word.split(" ");
        subWords.forEach((subWord) => {
          if (subWord !== "&&" && subWord.trim() !== "") {
            if (!oplNodes.value.includes(subWord)) {
              oplNodes.value.push(subWord);
            }
            oplEdges.value[index] = oplEdges.value[index].replace(`${subWord}%%%`, `&&[${oplNodes.value.indexOf(subWord)},${subWord}]%%%`).replace(`%%%${subWord}`, `%%%&&[${oplNodes.value.indexOf(subWord)},${subWord}]`);
          }
        });
      }
    });
  });
  oplEdges.value = oplEdges.value.map((edge) => edge.replace(/%%%&&/g, ";").replace(/%%%/g, ":").replace(/&&/g, ""));
  setFlag(8);
  return oplNodes;
};

const makeNodePositionsFromOPL = ( selectedLayers: Array<string> ) => {
  oplNodes.value.forEach((node, index) => {
    const name = node;
    const layer = selectedLayers[index];
    addNode(name, layer);
  });
  return nodePositions;
}

const makeEdgePositionsFromOPL = ( selectedLayers: Array<string> ) => {
  oplEdges.value.forEach((edge) => {
    const edgeArray = edge.split(":");
    const fromNode = edgeArray[0];
    const toArray = edgeArray[1].split(";");
    const edgeType = toArray[0];
    const toNode = toArray[1];
    const fromIndex = fromNode.replace("[", "").replace("]","").split(",")[0];
    const fromName = oplNodes.value[Number(fromIndex)];
    const fromLayer = selectedLayers[Number(fromIndex)];
    const fromkey = `${fromName} ( ${fromLayer} )`;
    const toIndex = toNode.replace("[", "").replace("]","").split(",")[0];
    const toName = oplNodes.value[Number(toIndex)];
    const toLayer = selectedLayers[Number(toIndex)];
    const tokey = `${toName} ( ${toLayer} )`;
    addEdge(fromkey, fromName, fromLayer, tokey, toName, toLayer, edgeType);
  });
  return edgePositions;
}

const addNode = (name: string, layer: string) => {
  const key = `${name} ( ${layer} )`; 
  if (!nodes.value.find(node => node.key === key)) {
    nodes.value.push({ key, node: { name, layer } });
    newNodes.value.push({ key, node: { name, layer } });
  } else {
    console.warn("Node already exists with key:", key);
  }
};
const removeNode = (key: string) => {
  edgePositions.forEach(edge => {
    if ((edge.fromname === nodes.value.find(node => node.key === key)?.node.name && edge.fromlayer === nodes.value.find(node => node.key === key)?.node.layer) || (edge.toname === nodes.value.find(node => node.key === key)?.node.name && edge.tolayer === nodes.value.find(node => node.key === key)?.node.layer)) {
      edgePositions.splice(edgePositions.findIndex(edgePosition => edgePosition.key === edge.key), 1);
    }
  });
  edges.value = edges.value.filter(edge => edge.edge.fromkey !== key && edge.edge.tokey !== key);
  nodes.value = [...nodes.value.filter(node => node.key !== key)];
  nodePositions.splice(nodePositions.findIndex(node => node.key === key), 1);
}

const updateNodeKey = (oldKey: string, newName: string, newLayer: string) => {
  const newKey = `${newName} ( ${newLayer} )`;
  
  // ノードの更新前に、このキーを持つノードが既に存在するかチェック
  if (nodes.value.find(node => node.key === newKey && node.key !== oldKey)) {
    console.warn("Node already exists with key:", newKey);
    return false; // 更新を中止し、失敗を示す
  }
  
  // ノードの更新
  const node = nodes.value.find(node => node.key === oldKey);
  if (!node) {
    console.warn("Node not found with key:", oldKey);
    return false; // 更新を中止し、失敗を示す
  }
  
  // 変更前のノード情報をログに記録
  console.log("更新前のノード:", JSON.stringify(node));
  
  // ノード情報を更新
  node.key = newKey;
  node.node.name = newName;
  node.node.layer = newLayer;
  
  // nodePositionsの更新 - 重複キーの問題解決
  // すべての一致する要素のインデックスを取得
  const allMatchingIndices: number[] = [];
  nodePositions.forEach((pos, index) => {
    if (pos.key === oldKey) {
      allMatchingIndices.push(index);
    }
  });

  console.log(`nodePositions内で '${oldKey}' と一致する要素数: ${allMatchingIndices.length}`);
  console.log("一致するインデックス:", allMatchingIndices);

  if (allMatchingIndices.length > 0) {
    // 最初の一致要素は更新
    const nodePositionIndex = allMatchingIndices[0];
    console.log("更新前のノード位置:", JSON.stringify(nodePositions[nodePositionIndex]));
    
    // 位置情報を更新 (参照ではなくオブジェクト自体を更新)
    nodePositions[nodePositionIndex] = {
      ...nodePositions[nodePositionIndex],
      name: newName,
      key: newKey,
      layer: newLayer
    };
    
    console.log("更新後のノード位置:", JSON.stringify(nodePositions[nodePositionIndex]));
    
    // 残りの重複要素は削除（先頭から削除すると残りのインデックスがずれるため、後ろから削除）
    if (allMatchingIndices.length > 1) {
      for (let i = allMatchingIndices.length - 1; i > 0; i--) {
        console.log(`重複したノード位置を削除 (インデックス ${allMatchingIndices[i]}):`);
        nodePositions.splice(allMatchingIndices[i], 1);
      }
    }
  } else {
    console.warn("Node position not found with key:", oldKey);
  }
  
  // エッジの更新
  let edgesUpdated = 0;
  edges.value.forEach(edge => {
    let edgeUpdated = false;
    let oldEdgeKey = edge.key;
    
    // fromノードの更新
    if (edge.edge.fromkey === oldKey) {
      edge.edge.fromkey = newKey;
      edge.edge.fromname = newName;
      edge.edge.fromlayer = newLayer;
      edgeUpdated = true;
    }
    
    // toノードの更新
    if (edge.edge.tokey === oldKey) {
      edge.edge.tokey = newKey;
      edge.edge.toname = newName;
      edge.edge.tolayer = newLayer;
      edgeUpdated = true;
    }
    
    // エッジキーの更新
    if (edgeUpdated) {
      const newEdgeKey = `${edge.edge.fromkey} --(${edge.type})-> ${edge.edge.tokey}`;
      edge.key = newEdgeKey;
      edgesUpdated++;
      
      // edgePositionsの更新 - 重複キーの問題解決
      const allMatchingEdgeIndices: number[] = [];
      edgePositions.forEach((pos, index) => {
        if (pos.key === oldEdgeKey) {
          allMatchingEdgeIndices.push(index);
        }
      });

      if (allMatchingEdgeIndices.length > 0) {
        // 最初の一致要素は更新
        const edgePositionIndex = allMatchingEdgeIndices[0];
        
        // 位置情報を更新
        edgePositions[edgePositionIndex] = {
          ...edgePositions[edgePositionIndex],
          key: newEdgeKey
        };
        
        // 残りの重複要素は削除
        if (allMatchingEdgeIndices.length > 1) {
          for (let i = allMatchingEdgeIndices.length - 1; i > 0; i--) {
            console.log(`重複したエッジ位置を削除 (インデックス ${allMatchingEdgeIndices[i]}):`);
            edgePositions.splice(allMatchingEdgeIndices[i], 1);
          }
        }
      } else {
        console.warn("Edge position not found with key:", oldEdgeKey);
      }
    }
  });
  
  console.log(`${edgesUpdated}個のエッジを更新しました`);

  // 更新後に残っている古いキーを確認
  const checkRemainingOldKeys = () => {
    // nodes配列での確認
    const oldNodesRemaining = nodes.value.filter(node => node.key === oldKey);
    console.log(`nodes内に残っている古いキー '${oldKey}' の数: ${oldNodesRemaining.length}`);
    
    // nodePositions配列での確認
    const oldPositionsRemaining = nodePositions.filter(pos => pos.key === oldKey);
    console.log(`nodePositions内に残っている古いキー '${oldKey}' の数: ${oldPositionsRemaining.length}`);
    
    // 残っているものがあれば詳細を表示
    if (oldPositionsRemaining.length > 0) {
      console.log("残っている古いキーを持つ位置情報:", oldPositionsRemaining);
    }
  };
  
  // 確認を実行
  checkRemainingOldKeys();
  
  // 更新後のノード情報をログに記録
  console.log("更新後のノード:", JSON.stringify(node));

  return true; // 更新成功
};

const addEdge = (fromkey: string, fromname: string, fromlayer: string, tokey: string, toname: string, tolayer: string, edgetype: string) => {
  const key = `${fromkey} --(${edgetype})-> ${tokey}`;
  if (!edges.value.find(edge => edge.key === key)) {
    edges.value.push({ key, type: edgetype, edge: { fromkey, fromname, fromlayer, tokey, toname, tolayer }});
    newEdges.value.push({ key, type: edgetype, edge: { fromkey, fromname, fromlayer, tokey, toname, tolayer } });
  } else {
    console.warn("Edge already exists with key:", key);
  }
}
const removeEdge = (key: string) => {
  edges.value = [...edges.value.filter(edge => edge.key !== key)];
  edgePositions.splice(edgePositions.findIndex(edge => edge.key === key), 1);
}

const setHalf = (n: number) => {
  half.value = n;
}

const addAvailableGrid = (x: number, y: number, z: number) => {
  availableGrid.value.push({ x, y, z });
}
const removeAvailableGrid = (x: number, y: number, z: number) => {
  availableGrid.value = [...availableGrid.value.filter((grid) => grid.x !== x || grid.y !== y || grid.z !== z)];
}

const setAvailableGrid = () => {
  const size = Math.floor(half.value);
  const range = 2 * size + 1; 
  const layerCount = layers.value.length;
  const totalSize = layerCount * range * range;
  const grid = new Array(totalSize);

  let index = 0;
  for (let i = 0; i < layerCount; i++) {
    for (let j = Math.ceil(-half.value); j <= Math.floor(half.value); j++) {
      for (let k = Math.ceil(-half.value); k <= Math.floor(half.value); k++) {
        grid[index++] = { x: j, y: k, z:i };
      }
    }
  }
  availableGrid.value = grid; 
};


const nodePositions: { key: string; position: { x: number; y: number; z: number }, name: string, layer: string }[] = [];
const edgePositions: { key: string; position: { from : { x: number; y: number; z: number }, to: { x: number; y: number; z: number } }, fromname: string, fromlayer: string, toname: string, tolayer: string, type: string, info?: { direction: string; weight: string; }; }[] = [];

const makeNodePositions = ( ) => {
  if (newNodes.value.length !== 0) {
    newNodes.value.forEach(node => {
      const layerIndex = layers.value.indexOf(node.node.layer);
      const availablePositions = availableGrid.value.filter(grid => grid.z === layerIndex);
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const position = availablePositions[randomIndex];
      const positionIndex = { x: availablePositions[randomIndex].x, y: availablePositions[randomIndex].y, z: layerIndex };
      nodePositions.push({ key: node.key, position: positionIndex, name: node.node.name, layer: node.node.layer });
      availableGrid.value = [...availableGrid.value.filter((grid) => grid !== position)];
    });
    newNodes.value = [];
    return nodePositions;
  } else {
    return nodePositions;
  }
}

const makeEdgePositions = ( ) => {
  if (newEdges.value.length !== 0) {
    newEdges.value.forEach(edge => {
      const fromNode = nodePositions.find(node => node.key === edge.edge.fromkey);
      const toNode = nodePositions.find(node => node.key === edge.edge.tokey);
      if (fromNode && toNode) {
      edgePositions.push({ key: edge.key, position: { from: fromNode.position, to: toNode.position }, fromname: edge.edge.fromname, fromlayer: edge.edge.fromlayer, toname: edge.edge.toname, tolayer: edge.edge.tolayer, type: edge.type });
      } else {
      console.warn("Edge references undefined node(s):", edge, nodePositions);
      }
    });
    newEdges.value = [];
    return edgePositions;
  }  else {
    return edgePositions;
  }
}

const changeNodePositions = (oldPosition: { x: number; y: number; z: number }, newPosition: { x: number; y: number; z: number }) => {
  const node = nodePositions.find(node => node.position.x === oldPosition.x && node.position.y === oldPosition.y && node.position.z === oldPosition.z);
  if (node) {
    node.position = newPosition;
  }
  return nodePositions;
}

const changeEdgePositions = (oldPosition: { from : { x: number; y: number; z: number }, to: { x: number; y: number; z: number } }, newPosition: { from : { x: number; y: number; z: number }, to: { x: number; y: number; z: number } }) => {
  const edge = edgePositions.find(edge => edge.position.from.x === oldPosition.from.x && edge.position.from.y === oldPosition.from.y && edge.position.from.z === oldPosition.from.z && edge.position.to.x === oldPosition.to.x && edge.position.to.y === oldPosition.to.y && edge.position.to.z === oldPosition.to.z);
  if (edge) {
    edge.position = newPosition;
  }
  return edgePositions;
}

const filterNodesAndEdges = ( startPosition: { x: number; y: number; z: number },  pointNumber: number) => {
  const visitedNodes = new Map<string, number>(); 
  const visitedEdges = new Set<string>();
  const resultNodes: typeof nodePositions = [];
  const resultEdges: typeof edgePositions = [];
  const queue: { position: { x: number; y: number; z: number }; step: number }[] = [{ position: startPosition, step: 0 }];

  while (queue.length > 0) {
    const { position, step } = queue.shift()!;
    if (step > pointNumber) continue;
    const currentNode = nodePositions.find(
      (node) =>
        node.position.x === position.x &&
        node.position.y === position.y &&
        node.position.z === position.z
    );
    if (currentNode && !visitedNodes.has(currentNode.key)) {
      visitedNodes.set(currentNode.key, step);
      resultNodes.push(currentNode);
      edgePositions.forEach((edge) => {
        const fromNode = edge.position.from;
        const toNode = edge.position.to;
        const isCurrentFrom = fromNode.x === position.x && fromNode.y === position.y && fromNode.z === position.z;
        const isCurrentTo = toNode.x === position.x && toNode.y === position.y && toNode.z === position.z;

        if (isCurrentFrom || isCurrentTo) {
          const nextPosition = isCurrentFrom ? toNode : fromNode;
          const nextNode = nodePositions.find(
            (node) =>
              node.position.x === nextPosition.x &&
              node.position.y === nextPosition.y &&
              node.position.z === nextPosition.z
          );
          if (nextNode && !visitedNodes.has(nextNode.key)) {
            queue.push({ position: nextPosition, step: step + 1 });
          }
          if (
            !visitedEdges.has(edge.key) &&
            visitedNodes.has(currentNode.key) &&
            nextNode &&
            visitedNodes.has(nextNode.key)
          ) {
            visitedEdges.add(edge.key);
            resultEdges.push(edge);
          }
        }
      });
    }
  }
  return { nodes: resultNodes, edges: resultEdges };
};


const setPopup = ( command : string) => {
  if (command ==="open") {
    isSavePopup.value = true;
  }
  if (command ==="close") {
    isSavePopup.value = false;
  }
}

const setImportPopup = ( command : string) => {
  if (command ==="open") {
    isImportPopup.value = true;
  }
  if (command ==="close") {
    isImportPopup.value = false;
  }
}

const setProjectName = ( name : string) => {
  projectName.value = name;
}

const setProjectNumber = ( number : number) => {
  projectNumber.value = number;
}

const handleFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      projectName.value = data.projectName;
      projectNumber.value = data.projectNumber;
      nodes.value = data.nodes;
      edges.value = data.edges;
      let nodePositionsFromFile = data.nodePositions;
      nodePositionsFromFile.forEach((node: any) => {
        nodePositions.push({ key: node.key, position: { x: node.position.x, y: node.position.y, z: node.position.z }, name: node.name, layer: node.layer });
      });
      let edgePositionsFromFile = data.edgePositions;
      edgePositionsFromFile.forEach((edge: any) => {
        if (edge.info) {
          edgePositions.push({ key: edge.key, position: { from: { x: edge.position.from.x, y: edge.position.from.y, z: edge.position.from.z }, to : { x: edge.position.to.x, y: edge.position.to.y, z: edge.position.to.z } }, fromname: edge.fromname, fromlayer: edge.fromlayer, toname: edge.toname, tolayer: edge.tolayer, type: edge.type, info: { direction: edge.info.direction, weight: edge.info.weight } });
        }
        else {
          edgePositions.push({ key: edge.key, position: { from: { x: edge.position.from.x, y: edge.position.from.y, z: edge.position.from.z }, to : { x: edge.position.to.x, y: edge.position.to.y, z: edge.position.to.z } }, fromname: edge.fromname, fromlayer: edge.fromlayer, toname: edge.toname, tolayer: edge.tolayer, type: edge.type });
        }
      });
      colorList.value = data.colorList;
      colorList.value = data.colorList;
      layers.value = data.layers.map((layer: any) => layer.layer);
      colors.value = data.layers.map((layer: any) => layer.color);
      planeData.value = data.planeData;
      editPlaneData(data.planeData.m, data.planeData.d);
      newNodes.value = [];
      newEdges.value = [];
      setFlag(9);
    } catch (error) {
      console.error("Invalid JSON format:", error);
    }
  };
  reader.readAsText(file);
};
const importProjectFromNeo4j = (data: any) => {
  projectName.value = data.projectName;
  projectNumber.value = data.id;
  const parsedData = {
    colorList: JSON.parse(data.colorList),
    layers: JSON.parse(data.layers),
    planeData: JSON.parse(data.planeData),
    nodes: JSON.parse(data.nodes),
    edges: JSON.parse(data.edges),
    nodePositions: JSON.parse(data.nodePositions),
    edgePositions: JSON.parse(data.edgePositions),
  };
  colorList.value = parsedData.colorList;
  layers.value = parsedData.layers.map((layer: any) => layer.layer);
  colors.value = parsedData.layers.map((layer: any) => layer.color);
  planeData.value = parsedData.planeData;
  nodes.value = parsedData.nodes;
  edges.value = parsedData.edges;
  let nodePositionsFromFile = parsedData.nodePositions;
  nodePositionsFromFile.forEach((node: any) => {
    nodePositions.push({ key: node.key, position: { x: node.position.x, y: node.position.y, z: node.position.z }, name: node.name, layer: node.layer });
  });
  let edgePositionsFromFile = parsedData.edgePositions;
  edgePositionsFromFile.forEach((edge: any) => {
    if (edge.info) {
      edgePositions.push({ key: edge.key, position: { from: { x: edge.position.from.x, y: edge.position.from.y, z: edge.position.from.z }, to : { x: edge.position.to.x, y: edge.position.to.y, z: edge.position.to.z } }, fromname: edge.fromname, fromlayer: edge.fromlayer, toname: edge.toname, tolayer: edge.tolayer, type: edge.type, info: { direction: edge.info.direction, weight: edge.info.weight } });
    } else {
    edgePositions.push({ key: edge.key, position: { from: { x: edge.position.from.x, y: edge.position.from.y, z: edge.position.from.z }, to : { x: edge.position.to.x, y: edge.position.to.y, z: edge.position.to.z } }, fromname: edge.fromname, fromlayer: edge.fromlayer, toname: edge.toname, tolayer: edge.tolayer, type: edge.type});
    }
  });
  setFlag(9);
}

const addColorList = (color: string) => {
  colorList.value.push(color);
}

const setEditColor = (index: number, value: boolean) => {
  editColor.value[index] = value;
}

const changeLayerColor = (index: number, color: string) => {
  colors.value[index] = color;
}

const editPlaneData = (m: number, d: number) => {
  planeData.value = { m, d };
}

const calculatePlaneSize = () => {
  const maxNodeCount = Math.max(
    ...Object.values(nodes.value.reduce((acc, node) => {
      const layer = node.node.layer;
      if (acc[layer]) {
        acc[layer]++;
      } else {
        acc[layer] = 1;
      }
      return acc;
    }, {} as Record<string, number>))
  );
  let m = 3;
  while ( m * m / 5 < maxNodeCount) {
    m += 2;
  }
  m += 6;
  editPlaneData(m , planeData.value.d);
};

const calculateDistance = () => {
  const maxNodeCount = Math.max(
    ...Object.values(nodes.value.reduce((acc, node) => {
      const layer = node.node.layer;
      if (acc[layer]) {
        acc[layer]++;
      } else {
        acc[layer] = 1;
      }
      return acc;
    }, {} as Record<string, number>)) as number[]
  );
  let d = 3;
  while ( d * d / 2.5 < maxNodeCount) {
    d += 1;
  }
  editPlaneData(planeData.value.m , d);
  return d;
};

const selectLayer = () => {
  const selectedNodePositions = nodePositions.filter((node) => visibleLayers.value.includes(node.layer));
  const selectedEdgePositions = edgePositions.filter((edge) => visibleLayers.value.includes(edge.fromlayer) && visibleLayers.value.includes(edge.tolayer));
  return { selectedNodePositions, selectedEdgePositions };
}

let visibleLayers = ref<string[]>([]);
const setVisibleLayers = (layers: string[]) => {
  visibleLayers.value = layers;
}

const setEdgeInfo = (key: string, direction: string, weight: string) => {
  const edge = edges.value.find(edge => edge.key === key);
  if (edge) {
    edge.info = { direction, weight };
  }
  const edgePosition = edgePositions.find(edge => edge.key === key);
  if (edgePosition) {
    edgePosition.info = { direction, weight };
  }
  setFlag(12);
}

const deleteEdgeInfo = (key: string) => {
  const edge = edges.value.find(edge => edge.key === key);
  if (edge) {
    edge.info = undefined;
  }
  const edgePosition = edgePositions.find(edge => edge.key === key);
  if (edgePosition) {
    edgePosition.info = undefined;
  }
  setFlag(12);
}

const converter = (value: string ) => {
  if (typeof value === "string") {
    if (value === "→") {
      return "forward";
    } else if (value === "←") {
      return "backward";
    } else if (value === "↔︎") {
      return "bidirectional";
    } else if (value === "forward") {
      return "→";
    } else if (value === "backward") {
      return "←";
    } else if (value === "bidirectional") {
      return "↔︎";
    } 
  }
  return value;
};

export const useNetworkDataStore = defineStore("networkData", () => {
  return { layers, addLayer, removeLayer, flag, setFlag, nodes, edges, colors, addNode, addEdge, half, 
    availableGrid, setHalf, setAvailableGrid, dataset, setDataset, addAvailableGrid, removeAvailableGrid, changeNodePositions, changeEdgePositions, makeNodePositions, makeEdgePositions, filterNodesAndEdges, removeNode, removeEdge, setOPL, oplEdges, oplNodes, 
    makeNodePositionsFromOPL, makeEdgePositionsFromOPL, oplErrors, setPopup, isSavePopup, setProjectName, projectName, setImportPopup, isImportPopup, handleFileUpload, setProjectNumber, projectNumber, importProjectFromNeo4j, colorList, addColorList, editColor, 
    setEditColor, changeLayerColor, updateNodeKey, version, editPlaneData, planeData, calculatePlaneSize, nodePositions, edgePositions, calculateDistance, selectLayer, setVisibleLayers, visibleLayers , setEdgeInfo, converter, deleteEdgeInfo };
});