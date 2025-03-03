<template>
  <div id="crossKey" v-if="flag === 5">
    <div class="grid-item"></div>
    <div class="grid-item"><button class="grid-item button" @click="crossKeyClick('up')">↑</button></div>
    <div class="grid-item"></div>
    <div class="grid-item"><button class="grid-item button" @click="crossKeyClick('left')">←</button></div>
    <div class="grid-center"><button class="grid-center button" @click="confirmMoving">OK</button></div>
    <div class="grid-item"><button class="grid-item button" @click="crossKeyClick('right')">→</button></div>
    <div class="grid-item"></div>
    <div class="grid-item"><button class="grid-item button" @click="crossKeyClick('down')">↓</button></div>
    <div class="grid-item"></div>
  </div>
  <div id="choosePoint" v-if="flag === 5">
    <button @click="choosePoint">選択</button>
  </div>
  <div id="resetChoosePoint" v-if="flag === 7">
    <button @click="resetChoosePoint">終了</button>
  </div>
  <div class="plotyWrapper">
    <div ref="plotlyChart" class="plotlyChart"></div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from "vue";
import Plotly from "plotly.js-dist";
import { useNetworkDataStore } from "../stores/networkData";
import { computed } from 'vue';

export default defineComponent({
  setup(props, { emit }) {
    const plotlyChart = ref<HTMLDivElement | null>(null);
    const store = useNetworkDataStore();
    const layers = computed<any>(() => store.layers);
    const flag = computed<any>(() => store.flag);
    const nodes = computed<any>(() => store.nodes);
    const edges = computed(() => store.edges);
    const colors = computed<any>(() => store.colors);
    const dataset = computed(() => store.dataset);
    let selectedTraceIndex = ref(0);
    const availableGrid = computed<any>(() => store.availableGrid);
    const planeData = computed<any>(() => store.planeData);

    const calculatePlaneSize = () => {
      if ( nodes.value.length === 0 ) {
        let m = planeData.value.m;
        return m;
      } else {
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
        let m = 3;
        while ( m * m / 5 < maxNodeCount) {
          m += 2;
        }
        m += 6;
        store.editPlaneData(m , planeData.value.d);
        return m;
      }
    };

    const generatePlanes = (layers: string[], colors: any[]) => {
      const planes = [];
      const m = calculatePlaneSize();
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const z = planeData.value.d * (layers.length - i - 1);
        const half = m/ 2;
        store.setHalf(half);
        const plane = {
          x: [-half, -half, half, half, -half],
          y: [-half, half, half, -half, -half],
          z: [z, z, z, z, z],
          type: "mesh3d",
          color: colors[i], 
          opacity: 0.5,
          name: `Layer ${layer}`,
          hoverinfo: "none",
        };
        planes.push(plane);
      }
      return planes;
    };

    const generateCones = (edgesData: any[], color: string, place: string) => {
      const cones = edgesData.map((edge) => {
        const from = edge.position.from;
        const to = edge.position.to;
        const u = to.x - from.x;
        const v = to.y - from.y;
        const w = to.z - from.z;
        return {
          type: "cone",
          x: [to.x], y: [to.y], z: [to.z], u: [u], v: [v], w: [w],
            ...(place === 'to' ? { x: [to.x], y: [to.y], z: [to.z] } :
              place === 'from' ? { x: [from.x], y: [from.y], z: [from.z], u: [-u], v: [-v], w: [-w] } :
              place === 'tomiddle' ? { x: [(from.x + to.x) / 2], y: [(from.y + to.y) / 2], z: [(from.z + to.z) / 2] } :
              { x: [(from.x + to.x) / 2], y: [(from.y + to.y) / 2], z: [(from.z + to.z) / 2], u: [-u], v: [-v], w: [-w] }),
          colorscale: [[0, color], [1, color]],
          sizemode: "absolute", 
          sizeref: 0.5,
          anchor: "tip",
          showscale: false,
          hoverinfo: "none",
          name: `cone {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}${place}`,
        };
      });
      return cones;
    };
    const generateSpheres = (edgesData: any[], color: string, place: string) => {
      const spheres = edgesData.map((edge) => {
      const from = edge.position.from;
      const to = edge.position.to;
      const vX = to.x - from.x;
      const vY = to.y - from.y;
      const vZ = to.z - from.z;
        return {
          type: "scatter3d",
          x: [to.x - 0.2 * vX / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)], y: [to.y - 0.2 * vY / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)], z: [to.z - 0.2 * vZ / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)],
          ...(place === 'from' ? { x: [from.x + 0.2 * vX / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)], y: [from.y + 0.2 * vY / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)], z: [from.z + 0.2 * vZ / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)] } : { x: [to.x - 0.2 * vX / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)], y: [to.y - 0.2 * vY / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)], z: [to.z - 0.2 * vZ / Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2)] }),
          u: [0], 
          v: [0], 
          w: [0],
          colorscale: [[0, color], [1, color]], 
          sizemode: "absolute", 
          sizeref: 0.3,
          marker: { size: 3, color: color },
          anchor: "tip", 
          showscale: false, 
          hoverinfo: "none", 
          name: `sphere {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}${place}`,
        };
      });
      return spheres;
    };

    const renderPlot = (data) => {
      if (plotlyChart.value) {
        const plotlyElement = plotlyChart.value;
        plotlyElement.addEventListener('wheel', (event) => {
          
        }, { passive: true });
        Plotly.newPlot(plotlyChart.value, data, {
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        plotlyChart.value.addEventListener(
          "touchstart",
          (e) => e.preventDefault(),
          { passive: true }
        );
        (plotlyChart.value as any).on("plotly_click", (event: any) => {
          const pointData = event.points[0];
          const dataType = pointData.data.type;
          const mode = pointData.data.mode; 
          if (dataType === "scatter3d" && mode === "markers+text" && ( flag.value === 3 || flag.value === 4 || flag.value === 6) ) {
            selectedTraceIndex.value = event.points[0].curveNumber;
            store.setFlag(5);
            const updatedData = [...data]; 
            updatedData.forEach((trace, index) => {
              if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
                trace.marker.color = index === selectedTraceIndex.value ? 'red' : trace.marker.color;
              }
            });
            Plotly.react(plotlyChart.value, updatedData, {
              scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }},
              hovermode: "false",
              margin: { l: 10, r: 10,  t: 10,  b: 10},
              showlegend: false,
              paper_bgcolor: "gray",
            });
            store.setDataset(updatedData);
      }});
    }};

    const updatePlot = () => {
      if (flag.value === 1 || flag.value === 2) {
        renderPlot(dataset);
      } else if (flag.value === 3 || flag.value === 4) {
        const planes = generatePlanes(layers.value, colors.value);
        store.setAvailableGrid();
        const nodePositions = store.makeNodePositions();
        const edgePositions = store.makeEdgePositions();
        const dataset1 = nodePositions.map((node) => {
          const layerIndex = layers.value.indexOf(node.layer);
          const color = colors.value[layerIndex];
          return { x: [node.position.x], y: [node.position.y], z: [node.position.z], type: "scatter3d", mode: 'markers+text', marker: { size: 5, color: color }, name: node.name, text: node.name };
        });
        const dataset2 = edgePositions.map((edge) => {
          return { x: [edge.position.from.x, edge.position.to.x], y: [edge.position.from.y, edge.position.to.y], z: [edge.position.from.z, edge.position.to.z], type: "scatter3d", mode: "lines", line: { color: "black", width: 2 }, name: `${edge.key}`, hoverinfo: "none" , text: `${edge.type}`};
        });
        const options = edgePositions.flatMap((edge) => {
          if (edge.type === 'follows') {
            return generateCones([edge], 'blue', 'from');
          } else if (edge.type === 'consists of') {
            return generateCones([edge], 'black', 'frommiddle');
          } else if (edge.type === 'exhibits') {
            return generateCones([edge], 'gray', 'frommiddle');
          } else if (edge.type === 'is') {
            return generateCones([edge], 'white', 'tomiddle');
          } else if (edge.type === 'handles') {
            return generateSpheres([edge], 'black', 'to');
          } else if (edge.type === 'requires') {
            return generateSpheres([edge], 'white', 'from');
          } else if (edge.type === 'consumes') {
            return generateCones([edge], 'white', 'from');
          } else if (edge.type === 'yields') {
            return generateCones([edge], 'white', 'to');
          } else if (edge.type === 'affects') {
            return [...generateCones([edge], 'white', 'from'), ...generateCones([edge], 'white', 'to')];
          } else {
            return generateSpheres([edge], 'red', 'to');
          }
        });
        store.setDataset([...dataset1, ...planes, ...dataset2, ...options]);
        renderPlot([...dataset1, ...planes, ...dataset2, ...options]);
      } else if (flag.value === 9) {
        renderPlot(store.dataset);
        store.setFlag(3);
      }
    };
    watch(flag, () => {
      updatePlot();
    });

    onMounted(() => {
      updatePlot();
    });

    onUnmounted(() => {
      if (plotlyChart.value) {
        Plotly.purge(plotlyChart.value);
      }
    });

    const choosePoint = () => {
      if (plotlyChart.value) {
        const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        updatedData.forEach((trace, index) => {
          if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
            if (index === selectedTraceIndex.value) {
              const planes = generatePlanes(layers.value, colors.value);
              const { nodes, edges } = store.filterNodesAndEdges( {  x: trace.x[0], y: trace.y[0], z: trace.z[0] } );
              const dataset3 = nodes.map((node) => {
                const layerIndex = layers.value.indexOf(node.layer);
                const color = colors.value[layerIndex];
                return { x: [node.position.x], y: [node.position.y], z: [node.position.z], type: "scatter3d", mode: 'markers+text', marker: { size: 5, color: color }, name: node.name, text: node.name };
              });
              const dataset4 = edges.map((edge) => {
                return { x: [edge.position.from.x, edge.position.to.x], y: [edge.position.from.y, edge.position.to.y], z: [edge.position.from.z, edge.position.to.z], type: "scatter3d", mode: "lines", line: { color: "black", width: 2 }, name: `${edge.key}`, hoverinfo: "none" , text: `${edge.type}`};
              });
              const options2 = edges.flatMap((edge) => {
                if (edge.type === 'follows') {
                  return generateCones([edge], 'black', 'from');
                } else if (edge.type === 'consists of') {
                  return generateCones([edge], 'black', 'frommiddle');
                } else if (edge.type === 'exhibits') {
                  return generateCones([edge], 'gray', 'frommiddle');
                } else if (edge.type === 'is') {
                  return generateCones([edge], 'white', 'tomiddle');
                } else if (edge.type === 'handles') {
                  return generateSpheres([edge], 'black', 'to');
                } else if (edge.type === 'requires') {
                  return generateSpheres([edge], 'white', 'from');
                } else if (edge.type === 'consumes') {
                  return generateCones([edge], 'white', 'from');
                } else if (edge.type === 'yields') {
                  return generateCones([edge], 'white', 'to');
                } else if (edge.type === 'affects') {
                  return [...generateCones([edge], 'white', 'from'), ...generateCones([edge], 'white', 'to')];
                } else {
                  return generateSpheres([edge], 'red', 'to');
                }
              });
              Plotly.react(plotlyChart.value, [...dataset3, ...planes, ...dataset4, ...options2], {
                scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }},
                hovermode: "false",
                margin: { l: 10, r: 10,  t: 10,  b: 10},
                showlegend: false,
                paper_bgcolor: "gray",
              });
              store.setFlag(7);
            }
          }
        });
      }
    };
    const resetChoosePoint = () => {
      if (plotlyChart.value) {
        const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        Plotly.react(plotlyChart.value, updatedData, {
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        store.setFlag(3);
      }
    };

    const crossKeyClick = (direction: string) => {
      if (plotlyChart.value) {
        const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        updatedData.forEach((trace, index) => {
          if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
            if (index === selectedTraceIndex.value) {
              const x = trace.x[0];
              const y = trace.y[0];
              const z = trace.z[0];
              const oldPosition = { x, y, z };
              if (direction === 'up') {
                if (availableGrid.value.some((grid) => grid.x === x && grid.y === y + 1 && grid.z === z)) {
                  trace.y[0] = y + 1;
                }
              } else if (direction === 'down') {
                if (availableGrid.value.some((grid) => grid.x === x && grid.y === y - 1 && grid.z === z)) {
                  trace.y[0] = y - 1;
                }
              } else if (direction === 'left') {
                if (availableGrid.value.some((grid) => grid.x === x - 1 && grid.y === y && grid.z === z)) {
                  trace.x[0] = x - 1;
                }
              } else if (direction === 'right') {
                if (availableGrid.value.some((grid) => grid.x === x + 1 && grid.y === y && grid.z === z)) {
                  trace.x[0] = x + 1;
                }
              }
              const newPosition = { x: trace.x[0], y: trace.y[0], z: trace.z[0] };
              store.addAvailableGrid(oldPosition.x, oldPosition.y, oldPosition.z);
              store.removeAvailableGrid(newPosition.x, newPosition.y, newPosition.z);
              store.changeNodePositions({ x: oldPosition.x, y: oldPosition.y, z: oldPosition.z }, { x: newPosition.x, y: newPosition.y, z: newPosition.z });
              const lines = updatedData.filter((trace) => trace.type === 'scatter3d' && trace.mode === 'lines');
              lines.forEach((line) => {
                if (line.x[0] === oldPosition.x && line.y[0] === oldPosition.y && line.z[0] === oldPosition.z) {
                  line.x[0] = newPosition.x;
                  line.y[0] = newPosition.y;
                  line.z[0] = newPosition.z;
                  store.changeEdgePositions({ from: { x: oldPosition.x, y: oldPosition.y, z: oldPosition.z }, to: { x: line.x[1], y: line.y[1], z: line.z[1] } }, { from: { x: newPosition.x, y: newPosition.y, z: newPosition.z }, to: { x: line.x[1], y: line.y[1], z: line.z[1] } });
                } else if (line.x[1] === oldPosition.x && line.y[1] === oldPosition.y && line.z[1] === oldPosition.z) {
                  line.x[1] = newPosition.x;
                  line.y[1] = newPosition.y;
                  line.z[1] = newPosition.z;
                  store.changeEdgePositions({ from: { x: line.x[0], y: line.y[0], z: line.z[0] }, to: { x: oldPosition.x, y: oldPosition.y, z: oldPosition.z } }, { from: { x: line.x[0], y: line.y[0], z: line.z[0] }, to: { x: newPosition.x, y: newPosition.y, z: newPosition.z } });
                }
              });
              const options = updatedData.filter((trace) => trace.name.startsWith('cone') || trace.name.startsWith('sphere'));
              options.forEach((option) => {
                const position = option.name.match(/\{from (.+?)\}}/)[0];
                const positions = position.match(/\{x: (.+?), y: (.+?), z: (.+?)\}/g);
                if (positions[0] === `{x: ${oldPosition.x}, y: ${oldPosition.y}, z: ${oldPosition.z}}`) {
                  const newFrom = { x: newPosition.x, y: newPosition.y, z: newPosition.z };
                  const to = { x: parseFloat(positions[1].match(/x: (.+?),/)[1]), y: parseFloat(positions[1].match(/y: (.+?),/)[1]), z: parseFloat(positions[1].match(/z: (.+?)\}/)[1]) };
                  if (option.name.startsWith('cone')) {
                    if (option.name.endsWith('from')) {
                      option.x[0] = newFrom.x;
                      option.y[0] = newFrom.y;
                      option.z[0] = newFrom.z;
                      option.u[0] = -(to.x - newFrom.x);
                      option.v[0] = -(to.y - newFrom.y);
                      option.w[0] = -(to.z - newFrom.z);
                      option.name = `cone {from {x: ${newFrom.x}, y: ${newFrom.y}, z: ${newFrom.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}from`;
                    } else if (option.name.endsWith('frommiddle')) {
                      option.x[0] = (newFrom.x + to.x) / 2;
                      option.y[0] = (newFrom.y + to.y) / 2;
                      option.z[0] = (newFrom.z + to.z) / 2;
                      option.u[0] = -(to.x - newFrom.x);
                      option.v[0] = -(to.y - newFrom.y);
                      option.w[0] = -(to.z - newFrom.z);
                      option.name = `cone {from {x: ${newFrom.x}, y: ${newFrom.y}, z: ${newFrom.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}frommiddle`;
                    } else if (option.name.endsWith('tomiddle')) {
                      option.x[0] = (newFrom.x + to.x) / 2;
                      option.y[0] = (newFrom.y + to.y) / 2;
                      option.z[0] = (newFrom.z + to.z) / 2;
                      option.u[0] = to.x - newFrom.x;
                      option.v[0] = to.y - newFrom.y;
                      option.w[0] = to.z - newFrom.z;
                      option.name = `cone {from {x: ${newFrom.x}, y: ${newFrom.y}, z: ${newFrom.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}tomiddle`;
                    } else if (option.name.endsWith('to')) {
                      option.x[0] = to.x;
                      option.y[0] = to.y;
                      option.z[0] = to.z;
                      option.u[0] = to.x - newFrom.x;
                      option.v[0] = to.y - newFrom.y;
                      option.w[0] = to.z - newFrom.z;
                      option.name = `cone {from {x: ${newFrom.x}, y: ${newFrom.y}, z: ${newFrom.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}to`;
                    }
                  } else {
                    if (option.name.endsWith('from')) {
                      option.x[0] = newPosition.x + 0.2 * (to.x - newPosition.x) / Math.sqrt((to.x - newPosition.x) ** 2 + (to.y - newPosition.y) ** 2 + (to.z - newPosition.z) ** 2);
                      option.y[0] = newPosition.y + 0.2 * (to.y - newPosition.y) / Math.sqrt((to.x - newPosition.x) ** 2 + (to.y - newPosition.y) ** 2 + (to.z - newPosition.z) ** 2);
                      option.z[0] = newPosition.z + 0.2 * (to.z - newPosition.z) / Math.sqrt((to.x - newPosition.x) ** 2 + (to.y - newPosition.y) ** 2 + (to.z - newPosition.z) ** 2);
                      option.name = `sphere {from {x: ${newPosition.x}, y: ${newPosition.y}, z: ${newPosition.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}from`;
                    } else {
                      option.x[0] = to.x - 0.2 * (to.x - newPosition.x) / Math.sqrt((to.x - newPosition.x) ** 2 + (to.y - newPosition.y) ** 2 + (to.z - newPosition.z) ** 2);
                      option.y[0] = to.y - 0.2 * (to.y - newPosition.y) / Math.sqrt((to.x - newPosition.x) ** 2 + (to.y - newPosition.y) ** 2 + (to.z - newPosition.z) ** 2);
                      option.z[0] = to.z - 0.2 * (to.z - newPosition.z) / Math.sqrt((to.x - newPosition.x) ** 2 + (to.y - newPosition.y) ** 2 + (to.z - newPosition.z) ** 2);
                      option.name = `sphere {from {x: ${newPosition.x}, y: ${newPosition.y}, z: ${newPosition.z}}, to {x: ${to.x}, y: ${to.y}, z: ${to.z}}}to`;
                    }
                  }
                } else if (positions[1] === `{x: ${oldPosition.x}, y: ${oldPosition.y}, z: ${oldPosition.z}}`) {
                  const from = { x: parseFloat(positions[0].match(/x: (.+?),/)[1]), y: parseFloat(positions[0].match(/y: (.+?),/)[1]), z: parseFloat(positions[0].match(/z: (.+?)\}/)[1]) };
                  const newTo = { x: newPosition.x, y: newPosition.y, z: newPosition.z };
                  if (option.name.startsWith('cone')) {
                    if (option.name.endsWith('from')) {
                      option.x[0] = from.x;
                      option.y[0] = from.y;
                      option.z[0] = from.z;
                      option.u[0] = -(newTo.x - from.x);
                      option.v[0] = -(newTo.y - from.y);
                      option.w[0] = -(newTo.z - from.z);
                      option.name = `cone {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${newTo.x}, y: ${newTo.y}, z: ${newTo.z}}}from`;
                    } else if (option.name.endsWith('frommiddle')) {
                      option.x[0] = (from.x + newTo.x) / 2;
                      option.y[0] = (from.y + newTo.y) / 2;
                      option.z[0] = (from.z + newTo.z) / 2;
                      option.u[0] = -(newTo.x - from.x);
                      option.v[0] = -(newTo.y - from.y);
                      option.w[0] = -(newTo.z - from.z);
                      option.name = `cone {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${newTo.x}, y: ${newTo.y}, z: ${newTo.z}}}frommiddle`;
                    } else if (option.name.endsWith('tomiddle')) {
                      option.x[0] = (from.x + newTo.x) / 2;
                      option.y[0] = (from.y + newTo.y) / 2;
                      option.z[0] = (from.z + newTo.z) / 2;
                      option.u[0] = newTo.x - from.x;
                      option.v[0] = newTo.y - from.y;
                      option.w[0] = newTo.z - from.z;
                      option.name = `cone {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${newTo.x}, y: ${newTo.y}, z: ${newTo.z}}}tomiddle`;
                    } else {
                      option.x[0] = newTo.x;
                      option.y[0] = newTo.y;
                      option.z[0] = newTo.z;
                      option.u[0] = newTo.x - from.x;
                      option.v[0] = newTo.y - from.y;
                      option.w[0] = newTo.z - from.z;
                      option.name = `cone {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${newTo.x}, y: ${newTo.y}, z: ${newTo.z}}}to`;
                    }
                  } else {
                    if (option.name.endsWith('from')) {
                      option.x[0] = from.x + 0.2 * (newTo.x - from.x) / Math.sqrt((newTo.x - from.x) ** 2 + (newTo.y - from.y) ** 2 + (newTo.z - from.z) ** 2);
                      option.y[0] = from.y + 0.2 * (newTo.y - from.y) / Math.sqrt((newTo.x - from.x) ** 2 + (newTo.y - from.y) ** 2 + (newTo.z - from.z) ** 2);
                      option.z[0] = from.z + 0.2 * (newTo.z - from.z) / Math.sqrt((newTo.x - from.x) ** 2 + (newTo.y - from.y) ** 2 + (newTo.z - from.z) ** 2);
                      option.name = `sphere {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${newTo.x}, y: ${newTo.y}, z: ${newTo.z}}}from`;
                    } else {
                      option.x[0] = newTo.x - 0.2 * (newTo.x - from.x) / Math.sqrt((newTo.x - from.x) ** 2 + (newTo.y - from.y) ** 2 + (newTo.z - from.z) ** 2);
                      option.y[0] = newTo.y - 0.2 * (newTo.y - from.y) / Math.sqrt((newTo.x - from.x) ** 2 + (newTo.y - from.y) ** 2 + (newTo.z - from.z) ** 2);
                      option.z[0] = newTo.z - 0.2 * (newTo.z - from.z) / Math.sqrt((newTo.x - from.x) ** 2 + (newTo.y - from.y) ** 2 + (newTo.z - from.z) ** 2);
                      option.name = `sphere {from {x: ${from.x}, y: ${from.y}, z: ${from.z}}, to {x: ${newTo.x}, y: ${newTo.y}, z: ${newTo.z}}}to`;
                    }
                  }
                }
              });
            }
          }
        });
        Plotly.react(plotlyChart.value, updatedData, {
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        store.setDataset(updatedData);
      }
    };
    const confirmMoving = () => {
      store.setFlag(6);
      if (plotlyChart.value) {
        const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        updatedData.forEach((trace, index) => {
          if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
            const i = layers.value.length - (trace.z[0] / planeData.value.d) - 1;
            const color = colors.value[i];
            trace.marker.color = index === selectedTraceIndex.value ? color : trace.marker.color;
          }
        });
        Plotly.react(plotlyChart.value, updatedData, {
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        store.setDataset(updatedData);
      }
    };
    return {
      plotlyChart,
      flag,
      crossKeyClick,
      confirmMoving,
      choosePoint,
      resetChoosePoint,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
.plotyWrapper {
  width: 100%;
  height: 88vh;
  border: 5px solid c.$blue;
  background-color: c.$white;
}
.plotlyChart {
  width: 100%;
  height: 100%;
}
canvas {
  border: 1px solid c.$yellow;
}
#crossKey {
  display: grid;
  grid-template-columns: repeat(3, 1fr); 
  grid-template-rows: repeat(3, 1fr); 
  width: 100px;
  z-index: 100;
  position: absolute;
  border: 5px solid c.$blue;
  background-color: c.$gray-light;
}

#choosePoint {
  width: 100px;
  z-index: 100;
  position: absolute;
  right: 0;
  height: 100px;
  border: 5px solid c.$blue;
  background-color: c.$gray-light;
  display: flex;
  justify-content: center;
  align-items: center;

  & button {
    background-color: c.$black;
    color: c.$white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    border-radius: 4px;
    height: 75%;
    width: 75%;
    &:hover {
      background-color: c.$maroon;
    }
  }
}
#resetChoosePoint {
  width: 100px;
  z-index: 100;
  position: absolute;
  right: 0;
  height: 100px;
  border: 5px solid c.$blue;
  background-color: c.$gray-light;
  display: flex;
  justify-content: center;
  align-items: center;

  & button {
    background-color: c.$black;
    color: c.$white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    border-radius: 4px;
    height: 75%;
    width: 75%;
    &:hover {
      background-color: c.$maroon;
    }
  }
}
.grid-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
}

.button {
  background-color: c.$blue;
  color: c.$white;
  border: none;
  cursor: pointer;
  font-size: 18px;
  border-radius: 4px;
  height: 100%;
  width: 100%;
  &:hover {
    background-color: c.$yellow-light;
  }
}
.grid-center {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
}
.grid-center button {
  background-color: c.$black;
  color: c.$white;
  border: none;
  cursor: pointer;
  font-size: 10px;
  border-radius: 4px;
  height: 100%;
  width: 100%;
  &:hover {
    background-color: c.$maroon;
  }
}
</style>
