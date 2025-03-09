import { set } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref, watch, reactive } from "vue";
import { reviseData } from "./versionManager";

const layers = ref(["business", "process", "object", "variable", "cost"]);
const flag = ref(0);
const nodes = ref<{ key: string; node: { name: string; layer: string } }[]>([]);
const edges = ref<{ key: string; type: string;  edge: { fromkey: string; fromname: string; fromlayer: string; tokey: string; toname: string; tolayer: string } }[]>([]);
const colors = ref(["#CC7F30", "#3bc3ff", "#70e483", "#731A3D", "#F4DA24"]);
const colorList = ref(["#CC7F30", "#3bc3ff", "#70e483", "#731A3D", "#F4DA24"]);
const half = ref(0);
const availableGrid = ref<{ x: number; y: number; z: number }[]>([]);
const localNodes = ref<{ key: string; node: { name: string; layer: string } }[]>([]);
const localEdges = ref<{ key: string; type: string;  edge: { fromkey: string; fromname: string; fromlayer: string; tokey: string; toname: string; tolayer: string } }[]>([]);
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

watch(nodes, () => {
  localNodes.value = nodes.value;
});
watch(edges, () => {
  localEdges.value = edges.value;
});
watch(flag, () => {
  if (flag.value === 1) {
    nodes.value = [];
    edges.value = [];
    localNodes.value = [];
    localEdges.value = [];
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
  layers.value = [...layers.value.filter((l) => l !== layer)]; 
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
  nodes.value = [...nodes.value.filter(node => node.key !== key)];
  nodePositions.splice(nodePositions.findIndex(node => node.key === key), 1);
}

const updateNodeKey = (oldKey: string, newName: string, newLayer: string) => {
  const newKey = `${newName} ( ${newLayer} )`;
  const node = nodes.value.find(node => node.key === oldKey);
  console.log(oldKey, newKey)
  if (node) {
    if (!nodes.value.find(node => node.key === newKey)) {
      node.key = newKey;
      node.node.name = newName;
      node.node.layer = newLayer;
      const nodePosition = nodePositions.find(node => node.key === oldKey);
      if (nodePosition) {
        nodePosition.name = newName;
        nodePosition.key = newKey;
        nodePosition.layer = newLayer;
      }
      edges.value.forEach(edge => {
        if (edge.edge.fromkey === oldKey) {
          edge.edge.fromkey = newKey;
          edge.edge.fromname = newName;
          edge.edge.fromlayer = newLayer;
          const oldEdgeKey = edge.key;
          edge.key = `${newKey} --(${edge.type})-> ${edge.edge.tokey}`;
          const edgePosition = edgePositions.find(edge => edge.key === oldEdgeKey);
          if (edgePosition) {
            edgePosition.key = edge.key;
          }
        }
        if (edge.edge.tokey === oldKey) {
          edge.edge.tokey = newKey;
          edge.edge.toname = newName;
          edge.edge.tolayer = newLayer;
          const oldEdgeKey = edge.key;
          edge.key = `${edge.edge.fromkey} --(${edge.type})-> ${newKey}`;
          const edgePosition = edgePositions.find(edge => edge.key === oldEdgeKey);
          if (edgePosition) {
            edgePosition.key = edge.key;
          }
        }
      });
    } else {
      console.warn("Node already exists with key:", newKey);
    }
  }
}

const addEdge = (fromkey: string, fromname: string, fromlayer: string, tokey: string, toname: string, tolayer: string, edgetype: string) => {
  const key = `${fromkey} --(${edgetype})-> ${tokey}`;
  if (!edges.value.find(edge => edge.key === key)) {
    edges.value.push({ key, type: edgetype, edge: { fromkey, fromname, fromlayer, tokey, toname, tolayer } });
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
  availableGrid.value = [];
  for (let i = 0; i < layers.value.length; i++) {
    for (let j = Math.ceil(-half.value); j <= Math.floor(half.value); j++) {
      for (let k = Math.ceil(-half.value); k <= Math.floor(half.value); k++) {
        availableGrid.value.push({ x: j, y: k, z: planeData.value.d * (layers.value.length - i - 1) });
      }
    }
  }
}
const nodePositions: { key: string; position: { x: number; y: number; z: number }, name: string, layer: string }[] = [];
const edgePositions: { key: string; position: { from : { x: number; y: number; z: number }, to: { x: number; y: number; z: number } }, fromname: string, fromlayer: string, toname: string, tolayer: string, type: string }[] = [];

const makeNodePositions = ( ) => {
  if (newNodes.value.length !== 0) {
    newNodes.value.forEach(node => {
      const layerIndex = layers.value.indexOf(node.node.layer);
      const availablePositions = availableGrid.value.filter(grid => grid.z === planeData.value.d * (layers.value.length - layerIndex - 1));
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
      console.warn("Edge references undefined node(s):", edge);
      }
    });
    newEdges.value = [];
    return edgePositions;
  }  else {
    return edgePositions;
  }
}

//まだ
const changeNodePositions = (oldPosition: { x: number; y: number; z: number }, newPosition: { x: number; y: number; z: number }) => {
  const node = nodePositions.find(node => node.position.x === oldPosition.x && node.position.y === oldPosition.y && node.position.z === oldPosition.z);
  if (node) {
    node.position = newPosition;
  }
  return nodePositions;
}

//まだ
const changeEdgePositions = (oldPosition: { from : { x: number; y: number; z: number }, to: { x: number; y: number; z: number } }, newPosition: { from : { x: number; y: number; z: number }, to: { x: number; y: number; z: number } }) => {
  const edge = edgePositions.find(edge => edge.position.from.x === oldPosition.from.x && edge.position.from.y === oldPosition.from.y && edge.position.from.z === oldPosition.from.z && edge.position.to.x === oldPosition.to.x && edge.position.to.y === oldPosition.to.y && edge.position.to.z === oldPosition.to.z);
  if (edge) {
    edge.position = newPosition;
  }
  return edgePositions;
}

//まだ
const filterNodesAndEdges = (startPosition: { x: number; y: number; z: number }) => {
  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();
  const resultNodes: typeof nodePositions = [];
  const resultEdges: typeof edgePositions = [];
  const queue: { x: number; y: number; z: number }[] = [startPosition];

  while (queue.length > 0) {
    const currentPosition = queue.shift();

    const currentNode = nodePositions.find(
      (node) =>
        node.position.x === currentPosition?.x &&
        node.position.y === currentPosition?.y &&
        node.position.z === currentPosition?.z
    );

    if (currentNode && !visitedNodes.has(currentNode.key)) {
      visitedNodes.add(currentNode.key);
      resultNodes.push(currentNode);
      edgePositions.forEach((edge) => {
        if (
          !visitedEdges.has(edge.key) &&
            ((edge.position.from.x === currentPosition?.x &&
              edge.position.from.y === currentPosition?.y &&
              edge.position.from.z === currentPosition?.z) ||
            (edge.position.to.x === currentPosition?.x &&
              edge.position.to.y === currentPosition?.y &&
              edge.position.to.z === currentPosition?.z)
          )) {
          visitedEdges.add(edge.key);
          resultEdges.push(edge);
          const nextPosition =
            edge.position.from.x === currentPosition?.x &&
            edge.position.from.y === currentPosition?.y &&
            edge.position.from.z === currentPosition?.z
              ? edge.position.to
              : edge.position.from;
          queue.push(nextPosition); 
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
      reviseData(data);
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
        edgePositions.push({ key: edge.key, position: { from: { x: edge.position.from.x, y: edge.position.from.y, z: edge.position.from.z }, to : { x: edge.position.to.x, y: edge.position.to.y, z: edge.position.to.z } }, fromname: edge.fromname, fromlayer: edge.fromlayer, toname: edge.toname, tolayer: edge.tolayer, type: edge.type });
      });
      colorList.value = data.colorList;
      colorList.value = data.colorList;
      colors.value = data.colors;
      layers.value = data.layers;
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
  colorList.value = JSON.parse(data.colorList);
  colors.value = JSON.parse(data.colors);
  layers.value = JSON.parse(data.layers);
  planeData.value = JSON.parse(data.planeData);
  nodes.value = JSON.parse(data.nodes);
  edges.value = JSON.parse(data.edges);
  let nodePositionsFromFile = JSON.parse(data.nodePositions);
  nodePositionsFromFile.forEach((node: any) => {
    nodePositions.push({ key: node.key, position: { x: node.position.x, y: node.position.y, z: node.position.z }, name: node.name, layer: node.layer });
  });
  let edgePositionsFromFile = JSON.parse(data.edgePositions);
  edgePositionsFromFile.forEach((edge: any) => {
    edgePositions.push({ key: edge.key, position: { from: { x: edge.position.from.x, y: edge.position.from.y, z: edge.position.from.z }, to : { x: edge.position.to.x, y: edge.position.to.y, z: edge.position.to.z } }, fromname: edge.fromname, fromlayer: edge.fromlayer, toname: edge.toname, tolayer: edge.tolayer, type: edge.type });
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

export const useNetworkDataStore = defineStore("networkData", () => {
  return { layers, addLayer, removeLayer, flag, setFlag, nodes, edges, colors, addNode, addEdge, half, availableGrid, setHalf, setAvailableGrid, dataset, setDataset, addAvailableGrid, removeAvailableGrid, changeNodePositions, changeEdgePositions, makeNodePositions, makeEdgePositions, filterNodesAndEdges, removeNode, removeEdge, setOPL, oplEdges, oplNodes, makeNodePositionsFromOPL, makeEdgePositionsFromOPL, oplErrors, setPopup, isSavePopup, setProjectName, projectName, setImportPopup, isImportPopup, handleFileUpload, setProjectNumber, projectNumber, importProjectFromNeo4j, colorList, addColorList, editColor, setEditColor, changeLayerColor, updateNodeKey, version, editPlaneData, planeData, calculatePlaneSize, nodePositions, edgePositions, calculateDistance };
});