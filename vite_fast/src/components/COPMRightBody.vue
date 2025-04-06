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
    <input type="number" id="pointNumber" v-model="pointNumber" value="2" />
    <button @click="choosePoint(pointNumber)">抽出</button>
  </div>
  <div id="resetChoosePoint" v-if="flag === 7">
    <button @click="resetChoosePoint">終了</button>
  </div>
  <div class="plotyWrapper">
    <ASideMenu v-if="flag > 2" />
    <div ref="plotlyChart" class="plotlyChart">
    </div>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, watch } from "vue";
import Plotly from "plotly.js-dist";
import { useNetworkDataStore } from "../stores/networkData";
import { computed } from 'vue';
import ASideMenu from '@/components/atoms/ASideMenu.vue';

export default defineComponent({
  setup(props, { emit }) {
    const plotlyChart = ref<HTMLDivElement | null>(null);
    const store = useNetworkDataStore();
    const layers = computed<any>(() => store.layers);
    const flag = computed<any>(() => store.flag);
    const nodes = computed<any>(() => store.nodes);
    const colors = computed<any>(() => store.colors);
    const dataset = computed(() => store.dataset);
    let selectedTraceIndex = ref(0);
    const availableGrid = computed<any>(() => store.availableGrid);
    const planeData = computed<any>(() => store.planeData);
    let d = planeData.value.d;
    let m = planeData.value.m;
    const pointNumber = ref(2);
    const cameraData = ref<string[]>([]);

    const calculatePlaneSize = () => {
      if ( nodes.value.length === 0 ) {
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
        store.editPlaneData(m , d);
        return m;
      }
    };

    const calculateDistance = () => {
      if ( nodes.value.length === 0 ) {
        return d;
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
        while ( d * d / 2.5 < maxNodeCount) {
          d += 1;
        }
        store.editPlaneData(m , d);
        return d;
      }
    };

    const generatePlanes = (layers: string[], colors: any[]) => {
      const planes = [];
      const m = calculatePlaneSize();
      const d = calculateDistance();
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        const z = d * (layers.length - i - 1);
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
        const u = to.x - from.x
        const v = to.y - from.y;
        const w = -(to.z - from.z) * d;
        const toZ = (layers.value.length - to.z - 1) * d;
        const fromZ = (layers.value.length - from.z - 1) * d;
        return {
          type: "cone",
          x: [to.x], y: [to.y], z: [toZ], u: [u], v: [v], w: [w],
            ...(place === 'to' ? { x: [to.x], y: [to.y], z: [toZ] } :
              place === 'from' ? { x: [from.x], y: [from.y], z: [fromZ], u: [-u], v: [-v], w: [-w] } :
              place === 'tomiddle' ? { x: [(from.x + to.x) / 2], y: [(from.y + to.y) / 2], z: [(toZ + fromZ) / 2] } :
              { x: [(from.x + to.x) / 2], y: [(from.y + to.y) / 2], z: [(toZ + fromZ) / 2], u: [-u], v: [-v], w: [-w] }),
          colorscale: [[0, color], [1, color]],
          sizemode: "absolute", 
          sizeref: 0.4,
          anchor: "tip",
          showscale: false,
          hoverinfo: "none",
          name: `cone {from {x: ${from.x}, y: ${from.y}, z: ${fromZ}}, to {x: ${to.x}, y: ${to.y}, z: ${toZ}}}${place}`,
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
      const vZ = -(to.z - from.z) * d;
      const toZ = (layers.value.length - to.z - 1) * d;
      const fromZ = (layers.value.length - from.z - 1) * d;
      const norm = Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2);
      const scale = 0.2 / norm; 
      const adjX = vX * scale;
      const adjY = vY * scale;
      const adjZ = vZ * scale;
        return {
          type: "scatter3d",
          x: [to.x - adjX], y: [to.y - adjY], z: [toZ - adjZ],
          ...(place === 'from' ? { x: [from.x + adjX], y: [from.y + adjY], z: [fromZ + adjZ] } : { x: [to.x - adjX], y: [to.y - adjY], z: [toZ - adjZ] }),
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
          name: `sphere {from {x: ${from.x}, y: ${from.y}, z: ${fromZ}}, to {x: ${to.x}, y: ${to.y}, z: ${toZ}}}${place}`,
        };
      });
      return spheres;
    };

    const generateCustomArrow = (edgesData: any[]) => {
      const arrows = [];
      edgesData.forEach((edge) => {
        const from = edge.position.from;
        const to = edge.position.to;
        const vX = to.x - from.x;
        const vY = to.y - from.y;
        const vZ = -(to.z - from.z) * d;
        const toZ = (layers.value.length - to.z - 1) * d;
        const fromZ = (layers.value.length - from.z - 1) * d;
        const norm = Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2);
        const scale = 0.2 / norm;
        const adjX = vX * scale;
        const adjY = vY * scale;
        const adjZ = vZ * scale;

        const createArrow = (baseX, baseY, baseZ, tipX, tipY, tipZ) => {
          const normA = Math.sqrt(2 * vX ** 2 + 2 * vY ** 2 + 2 * vZ ** 2 - 2 * vX * vY - 2 * vY * vZ - 2 * vZ * vX);
          const a = [(vY - vZ) / normA, (vZ - vX) / normA, (vX - vY) / normA];
          const normB = Math.sqrt(2 * vX ** 2 + 2 * vY ** 2 + 2 * vZ ** 2 - 2 * vX * vY - 2 * vY * vZ - 2 * vZ * vX) * Math.sqrt(vX ** 2 + vY ** 2 + vZ ** 2);
          const b = [(vY * (vX - vY) - vZ * (vZ - vY)) / normB, (vZ * (vY - vZ) - vX * (vX - vY)) / normB, (vX * (vZ - vX) - vY * (vY - vZ)) / normB];

          const vertices = [
            [baseX + 0.15 * a[0] + 0.15 * b[0], baseY + 0.15 * a[1] + 0.15 * b[1], baseZ + 0.15 * a[2] + 0.15 * b[2]], 
            [baseX - 0.15 * a[0] + 0.15 * b[0], baseY - 0.15 * a[1] + 0.15 * b[1], baseZ - 0.15 * a[2] + 0.15 * b[2]], 
            [baseX - 0.15 * a[0] - 0.15 * b[0], baseY - 0.15 * a[1] - 0.15 * b[1], baseZ - 0.15 * a[2] - 0.15 * b[2]], 
            [baseX + 0.15 * a[0] - 0.15 * b[0], baseY + 0.15 * a[1] - 0.15 * b[1], baseZ + 0.15 * a[2] - 0.15 * b[2]],
            [tipX, tipY, tipZ],
          ];

          const faces = [ [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [0, 1, 2], [0, 2, 3]];
          let color = "black";
          if (edge.info?.weight === "+1") {
            color = "lightblue";
          } else if (edge.info?.weight === "+3") {
            color = "blue";
          } else if (edge.info?.weight === "-1") {
            color = "pink";
          } else if (edge.info?.weight === "-3") {
            color = "red";
          }

          arrows.push({
            type: "mesh3d",
            x: vertices.map((v) => v[0]),
            y: vertices.map((v) => v[1]),
            z: vertices.map((v) => v[2]),
            i: faces.map((f) => f[0]),
            j: faces.map((f) => f[1]),
            k: faces.map((f) => f[2]),
            color: color,
            opacity: 1,
            hoverinfo: "none",
            name: "arrow_body",
          })};

        if (edge.info?.direction === "forward" || edge.info?.direction === "bidirectional") {
          const tipX = to.x - adjX;
          const tipY = to.y - adjY;
          const tipZ = toZ - adjZ;
          const baseX = to.x - 4 * adjX;
          const baseY = to.y - 4 * adjY;
          const baseZ = toZ - 4 * adjZ;
          createArrow(baseX, baseY, baseZ, tipX, tipY, tipZ);
        }
        if (edge.info?.direction === "backward" || edge.info?.direction === "bidirectional") {
          const tipX = from.x + adjX;
          const tipY = from.y + adjY;
          const tipZ = fromZ + adjZ;
          const baseX = from.x + 4 * adjX;
          const baseY = from.y + 4 * adjY;
          const baseZ = fromZ + 4 * adjZ;
          createArrow(baseX, baseY, baseZ, tipX, tipY, tipZ);
        }
      });
      return arrows;
    };

    const renderPlot = (data) => {
      if (plotlyChart.value) {
        const plotlyElement = plotlyChart.value;
        if ((plotlyChart.value as any).layout) {
          cameraData.value = (plotlyChart.value as any).layout.scene.camera;
        }
        plotlyElement.addEventListener('wheel', (event) => {  
        }, { passive: true });
        Plotly.newPlot(plotlyChart.value, data, {
            scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }, 
            ...(cameraData.value ? { camera: cameraData.value } : {})},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        const updateSize = () => {
          if (!plotlyChart.value) return;
          const layout = (plotlyChart.value as any).layout;
          if (!layout?.scene?.camera) return;
          const cameraEye = layout.scene.camera.eye;
          const eyeVector = { x: cameraEye.x, y: cameraEye.y, z: cameraEye.z };
          const center = layout.scene.camera.center;
          const distance = Math.sqrt(
            (eyeVector.x - center.x) ** 2 +
            (eyeVector.y - center.y) ** 2 +
            (eyeVector.z - center.z) ** 2
          );
          data.forEach((trace) => {
            if (trace.type === "scatter3d" && trace.mode === "markers+text") {
                if (distance >= 4) {
                trace.marker.size = 1;
                } else if (distance >= 3) {
                trace.marker.size = 2;
                } else if (distance >= 2) {
                trace.marker.size = 3;
                } else if (distance >= 1) {
                trace.marker.size = 4;
                } else {
                trace.marker.size = 5;
                }
            }
            if (trace.type === "cone") {
              if (distance < 0.5) {
                trace.sizeref = 0.2;
              } else if (distance < 1) {
                trace.sizeref = 0.25;
              } else if (distance < 1.5) {
                trace.sizeref = 0.3;
              } else if (distance < 2) {
                trace.sizeref = 0.4;
              } else if (distance < 3) {
                trace.sizeref = 0.5;
              } else if (distance < 4) {
                trace.sizeref = 0.5;
              } else {
                trace.sizeref = 0.6;
              }
            }
            if (trace.type === "scatter3d" && trace.mode === "lines") {
              if (distance < 2.5) {
                trace.line.width = 3;
              } else {
                trace.line.width = 1;
              }
            }
            // distanceが3以上の時はmarkers+textのtextを非表示にする
            if (distance >= 3) {
              trace.text = "";
            } else {
              trace.text = trace.name;
            }
          });

          Plotly.react(plotlyChart.value, data, layout);
        };
        /*
        (plotlyChart.value as any).on("plotly_relayout", () => {
          updateSize();
        });
        */
        plotlyChart.value.addEventListener(
          "touchstart",
          (e) => e.preventDefault(),
          { passive: true }
        );
        (plotlyChart.value as any).on("plotly_relayout", (eventData: { [key: string]: any }) => {
          if (eventData["scene.camera"]) {
            cameraData.value = eventData["scene.camera"];
          }
        });
        (plotlyChart.value as any).on("plotly_click", (event: any) => {
          const pointData = event.points[0];
          const dataType = pointData.data.type;
          const mode = pointData.data.mode; 
          if (dataType === "scatter3d" && mode === "markers+text" && ( flag.value === 3 || flag.value === 4 || flag.value === 6) ) {
            selectedTraceIndex.value = event.points[0].curveNumber;
            store.setFlag(5);
            const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
            updatedData.forEach((trace, index) => {
              if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
                trace.marker.color = index === selectedTraceIndex.value ? 'red' : trace.marker.color;
              }
            });
            Plotly.react(plotlyChart.value, updatedData, {
              scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }, camera: cameraData.value},
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
      } else if (flag.value === 3 || flag.value === 4 || flag.value === 12) {
        const planes = generatePlanes(layers.value, colors.value);
        store.setAvailableGrid();
        const nodePositions = store.makeNodePositions();
        const edgePositions = store.makeEdgePositions();
        const dataset1 = nodePositions.map((node) => {
          const layerIndex = layers.value.indexOf(node.layer);
          const color = colors.value[layerIndex];
          store.removeAvailableGrid(node.position.x, node.position.y, node.position.z);
          return { x: [node.position.x], y: [node.position.y], z: [d * (layers.value.length - node.position.z - 1)], type: "scatter3d", mode: 'markers+text', marker: { size: 4, color: color }, name: node.name, text: node.name };
        });
        const dataset2 = edgePositions.map((edge) => {
          let lineColor = "black";
          if (edge.info?.weight === "+1") {
            lineColor = "lightblue";
          } else if (edge.info?.weight === "+3") {
            lineColor = "blue";
          } else if (edge.info?.weight === "-1") {
            lineColor = "pink";
          } else if (edge.info?.weight === "-3") {
            lineColor = "red";
          }
          return { 
            x: [edge.position.from.x, edge.position.to.x], 
            y: [edge.position.from.y, edge.position.to.y], 
            z: [d * (layers.value.length - edge.position.from.z - 1), d * (layers.value.length - edge.position.to.z - 1)], 
            type: "scatter3d", 
            mode: "lines", 
            line: { color: lineColor, width: 3 }, 
            name: `${edge.key}`, 
            hoverinfo: "none", 
            text: `${edge.type}`
          };
        });
        const options = edgePositions.map((edge) => {
          if (edge.info) {
            return generateCustomArrow([edge]);
          } else {
            return makeOption([edge]);
          }
        }).flat();
        store.setDataset([...dataset1, ...planes, ...dataset2, ...options]);
        renderPlot([...dataset1, ...planes, ...dataset2, ...options]);
        if (flag.value === 12) {
          store.setFlag(3);
        }
      } else if (flag.value === 9) {
        store.setFlag(3);
      } else if (flag.value === 15 || flag.value === 16) {
        const { selectedNodePositions, selectedEdgePositions } = store.selectLayer();
        const planes = generatePlanes(layers.value, colors.value);
        store.setAvailableGrid();
        const visibleLayers = store.visibleLayers;
        const visiblePlanes = planes.filter((plane) => visibleLayers.includes(plane.name.split(" ")[1]));
        const dataset1 = selectedNodePositions.map((node) => {
          const layerIndex = layers.value.indexOf(node.layer);
          const color = colors.value[layerIndex];
          store.removeAvailableGrid(node.position.x, node.position.y, node.position.z);
          return { x: [node.position.x], y: [node.position.y], z: [d * (layers.value.length - node.position.z - 1)], type: "scatter3d", mode: 'markers+text', marker: { size: 4, color: color }, name: node.name, text: node.name };
        });
        const dataset2 = selectedEdgePositions.map((edge) => {
          let lineColor = "black";
          if (edge.info?.weight === "+1") {
            lineColor = "lightblue";
          } else if (edge.info?.weight === "+3") {
            lineColor = "blue";
          } else if (edge.info?.weight === "-1") {
            lineColor = "pink";
          } else if (edge.info?.weight === "-3") {
            lineColor = "red";
          }
          return { 
            x: [edge.position.from.x, edge.position.to.x], 
            y: [edge.position.from.y, edge.position.to.y], 
            z: [d * (layers.value.length - edge.position.from.z - 1), d * (layers.value.length - edge.position.to.z - 1)], 
            type: "scatter3d", 
            mode: "lines", 
            line: { color: lineColor, width: 3 }, 
            name: `${edge.key}`, 
            hoverinfo: "none", 
            text: `${edge.type}`
          };
        });
        const options = selectedEdgePositions.map((edge) => {
          if (edge.info) {
            return generateCustomArrow([edge]);
          } else {
            return makeOption([edge]);
          }
        }).flat();
        renderPlot([...dataset1, ...visiblePlanes, ...dataset2, ...options]);
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

    const makeOption = (edges) => {
      return edges.flatMap((edge) => {
        switch (edge.type) {
          case 'follows':
            return generateCones([edge], 'blue', 'from');
          case 'consists of':
            return generateCones([edge], 'black', 'frommiddle');
          case 'exhibits':
            return generateCones([edge], 'gray', 'frommiddle');
          case 'is':
            return generateCones([edge], 'white', 'tomiddle');
          case 'handles':
            return generateSpheres([edge], 'black', 'to');
          case 'requires':
            return generateSpheres([edge], 'white', 'from');
          case 'consumes':
            return generateCones([edge], 'green', 'from');
          case 'yields':
            return generateCones([edge], 'red', 'to');
          case 'affects':
            return [...generateCones([edge], 'white', 'from'), ...generateCones([edge], 'white', 'to')];
          default:
            return generateSpheres([edge], 'red', 'to');
        }
      });
    };

    const choosePoint = ( pointNumber: number ) => {
      if (plotlyChart.value) {
        const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        updatedData.forEach((trace, index) => {
          if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
            if (index === selectedTraceIndex.value) {
              const planes = generatePlanes(layers.value, colors.value);
              const z = layers.value.length - (trace.z[0] / d) - 1;
              const { nodes, edges } = store.filterNodesAndEdges({ x: trace.x[0], y: trace.y[0], z: z }, pointNumber);
              const dataset3 = nodes.map((node) => {
                const layerIndex = layers.value.indexOf(node.layer);
                const color = colors.value[layerIndex];
                return {
                  x: [node.position.x],
                  y: [node.position.y],
                  z: [d * (layers.value.length - node.position.z - 1)],
                  type: "scatter3d",
                  mode: 'markers+text',
                  marker: { size: 4, color: color },
                  name: node.name,
                  text: node.name
                };
              });
              const dataset4 = edges.map((edge) => {
                let lineColor = "black";
                if (edge.info?.weight === "+1") {
                  lineColor = "lightblue";
                } else if (edge.info?.weight === "+3") {
                  lineColor = "blue";
                } else if (edge.info?.weight === "-1") {
                  lineColor = "pink";
                } else if (edge.info?.weight === "-3") {
                  lineColor = "red";
                }
                return { 
                  x: [edge.position.from.x, edge.position.to.x], 
                  y: [edge.position.from.y, edge.position.to.y], 
                  z: [d * (layers.value.length - edge.position.from.z - 1), d * (layers.value.length - edge.position.to.z - 1)], 
                  type: "scatter3d", 
                  mode: "lines", 
                  line: { color: lineColor, width: 3 }, 
                  name: `${edge.key}`, 
                  hoverinfo: "none", 
                  text: `${edge.type}`
                };
              });
              const options2 = edges.map((edge) => {
                if (edge.info) {
                  return generateCustomArrow([edge]);
                } else {
                  return makeOption([edge]);
                }
              }).flat();
              Plotly.react(plotlyChart.value, [...dataset3, ...planes, ...dataset4, ...options2], {
                scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }, camera: cameraData.value },
                hovermode: "false",
                margin: { l: 10, r: 10, t: 10, b: 10 },
                showlegend: false,
                paper_bgcolor: "gray",
              });
              cameraData.value = (plotlyChart.value as any).layout.scene.camera;
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
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false }, camera: cameraData.value },
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        cameraData.value = (plotlyChart.value as any).layout.scene.camera;
        store.setFlag(3);
      }
    };
    const crossKeyClick = (direction: string) => {
      if (plotlyChart.value) {
        let updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        updatedData.forEach((trace, index) => {
          if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
            if (index === selectedTraceIndex.value) {
              const x = trace.x[0];
              const y = trace.y[0];
              const z = layers.value.length - (trace.z[0]/d) - 1;
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
              const newPosition = { x: trace.x[0], y: trace.y[0], z };
              store.addAvailableGrid(oldPosition.x, oldPosition.y, oldPosition.z);
              store.removeAvailableGrid(newPosition.x, newPosition.y, newPosition.z);
              store.changeNodePositions({ x: oldPosition.x, y: oldPosition.y, z: oldPosition.z }, { x: newPosition.x, y: newPosition.y, z: newPosition.z });
              const lines = updatedData.filter((trace) => trace.type === 'scatter3d' && trace.mode === 'lines');
              lines.forEach((line) => {
                if (line.x[0] === oldPosition.x && line.y[0] === oldPosition.y && line.z[0] === trace.z[0]) {
                  line.x[0] = newPosition.x;
                  line.y[0] = newPosition.y;
                  line.z[0] = trace.z[0];
                  store.changeEdgePositions({ from: { x: oldPosition.x, y: oldPosition.y, z: oldPosition.z }, to: { x: line.x[1], y: line.y[1], z: layers.value.length - (line.z[1]/d) - 1 } }, { from: { x: newPosition.x, y: newPosition.y, z: newPosition.z }, to: { x: line.x[1], y: line.y[1], z: layers.value.length - (line.z[1]/d) - 1 } });
                } else if (line.x[1] === oldPosition.x && line.y[1] === oldPosition.y && line.z[1] === trace.z[0]) {
                  line.x[1] = newPosition.x;
                  line.y[1] = newPosition.y;
                  line.z[1] = trace.z[0];
                  store.changeEdgePositions({ from: { x: line.x[0], y: line.y[0], z: layers.value.length - (line.z[0]/d) - 1 }, to: { x: oldPosition.x, y: oldPosition.y, z: oldPosition.z } }, { from: { x: line.x[0], y: line.y[0], z:layers.value.length - (line.z[0]/d) - 1 }, to: { x: newPosition.x, y: newPosition.y, z: newPosition.z } });
                }
              });
              const edgePositions = store.edgePositions;
              const newoptions = edgePositions.map((edge) => {
                if (edge.info) {
                  return generateCustomArrow([edge]);
                } else {
                  return makeOption([edge]);
                }
              }).flat();
              const updatedData2 = updatedData.filter((trace) => !trace.name.startsWith('cone') && !trace.name.startsWith('sphere'));
              updatedData2.push(...newoptions);
              updatedData = updatedData2;
              store.setDataset(updatedData);
            }
          }
        });
        Plotly.react(plotlyChart.value, updatedData, {
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false },camera: cameraData.value},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        cameraData.value = (plotlyChart.value as any).layout.scene.camera;
        store.setDataset(updatedData);
      }
    };
    const confirmMoving = () => {
      store.setFlag(6);
      if (plotlyChart.value) {
        const updatedData = Array.isArray(dataset.value) ? [...dataset.value] : [];
        updatedData.forEach((trace, index) => {
          if (trace.type === 'scatter3d' && trace.mode === 'markers+text') {
            const i = layers.value.length - (trace.z[0] / d) - 1;
            const color = colors.value[i];
            trace.marker.color = index === selectedTraceIndex.value ? color : trace.marker.color;
          }
        });
        Plotly.react(plotlyChart.value, updatedData, {
          scene: { xaxis: { visible: false }, yaxis: { visible: false }, zaxis: { visible: false },camera: cameraData.value},
          hovermode: "false",
          margin: { l: 10, r: 10,  t: 10,  b: 10},
          showlegend: false,
          paper_bgcolor: "gray",
        });
        cameraData.value = (plotlyChart.value as any).layout.scene.camera;
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
      pointNumber,
      cameraData,
    };
  },
  components: {
    ASideMenu,
  },
});
</script>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
.plotyWrapper {
  width: 100%;
  height: 100vh;
  border: 5px solid c.$blue;
  background-color: c.$white;
  position: relative;
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
  flex-flow: column;
  justify-content: center;
  align-items: center;

  & button {
    background-color: c.$black;
    color: c.$white;
    border: none;
    cursor: pointer;
    font-size: 18px;
    border-radius: 4px;
    height: 50%;
    width: 50%;
    &:hover {
      background-color: c.$maroon;
    }
  }
  & input {
    width: 50%;
    height: 20px;
    border: 1px solid c.$black;
    border-radius: 4px;
    text-align: center;
    margin: 10px 0 0 0;
    &:focus {
      border: 1px solid c.$maroon;
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
