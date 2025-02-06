<template>
  <layout>
    <template #default>
      <div class="shape">
        <div class="shapeLeftBody">
          <AH1 :h1Id="'shapeLeftHeading'" h1Title="断面図作成" />
          <div class="canvas-wrapper">
            <canvas id="drawCanvas" width="500" height="500"></canvas>
          </div>
          <div class="button-field">
            <Button btnId="deleteEdge" btnText="Delete Selected Edge" @click="deleteEdge" />
            <Button btnId="sendData" btnText="Send Shape Data" @click="sendData" />
            <Button btnId="deleteall" btnText="Delete all Edges" @click="deleteAllEdges" />
          </div> 
        </div>
        <div class="shapeRightBody">
          <div class="shapeRightUpperBody">
            <AH1 :h1Id="'shapeRightUpperHeading'" h1Title="断面図一覧" />
            <div class="table-wrapper">
              <div id="tableTop"></div>
            </div>
            <div class="table-wrapper">
              <div id="tableFront">
                <table id="shapesTable">
                  <thead>
                    <tr>
                      <th style="width: 200px;">断面図名</th>
                      <th style="width: 120px;">断面図データ</th>
                      <th style="width: 100px;">削除</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="shape in shapes" :key="shape._id">
                      <td>{{ formatShapeName(shape.name) }}</td>
                      <td>
                        <div :id="'svgContainer-' + shape._id"></div>
                      </td>
                      <td>
                        <button @click="deleteShape(shape._id)" class="btn-garbage">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="40" height="40">
                            <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="table-wrapper">
              <div id="tableBottom"></div>
            </div>
          </div>
          <div class="shapeRightLowerBody">
            <AH1 :h1Id="'shapeRightLowerHeading'" h1Title="断面図追加" />
            <table id="shapeNaming">
              <tbody>
                <tr>
                    <td>断面図名</td>
                    <td><textarea id="shapeName" rows="1" cols="30"></textarea></td>
                </tr>
                <tr>
                    <td>断面図</td>
                    <td><textarea id="shapeData" rows="4" cols="30"></textarea></td>
                </tr>
              </tbody>
            </table>
            <div class="submit-button-field">
              <Button btnId="submitShape" btnText="Submit" @click="submitShape" />
              <Button btnId="quitSubmit" btnText="Quit" @click="quitSubmit" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </layout>
</template>

<style lang="scss">
@use "@/assets/style/color" as c;
.shape {
  display: flex;
}
.shapeLeftBody {
  width: 50%;
  border-right: 3px solid c.$white;
  padding-right: 5vw;
  min-height: 88vh;
}
.shapeRightBody {
  width: 50%;
}
.shapeRightUpperBody {
  display: block;
  padding-left: 5vw;
}
canvas {
  border: 2px solid c.$yellow;
  background-color: c.$white;
}
.canvas-wrapper {
  display: flex;
  justify-content: center;
}
.button-field {
  display: flex;
  margin-top: 30px;
  justify-content: center;
  gap: 20px;
}
#shapeNaming {
    border: 2px solid c.$black;
    margin: 20px 0;
    width: 470px;
}
th, td {
    border: 1px solid c.$black;
    height: 55px;
    text-align: center;
    color: c.$black;
    background-color: c.$white;
}
td {
    padding: 20px 0;
}

/* 初期状態はスライドのために非表示にしておく */
.shapeRightLowerBody {
	width: 47vw;
	position: absolute;
	right: -100%;
  bottom: 2vh;
	background-color: c.$white;
	transition: all 0.5s ease;
	border-top: 3px solid c.$black;
	border-left: 3px solid c.$black;
	border-bottom: 3px solid c.$black;
	border-top-left-radius: 20px;
	border-bottom-left-radius: 20px;
	padding: 2vh 0 2vh 30px;
  margin-left: 3vw;
  display: none;
}
#submitShape {
  margin-right: 20px;
} 
#shapeRightLowerHeading {
  color: c.$black;
}
#shapesTable {
	border-radius: 10px;
	border-spacing: 0;
	border: none;
	border-left: 1px solid c.$black;
	border-top: 1px solid c.$black;
	tr {
		>* {
			padding: 5px;
			border: none;
			border-right: 1px solid c.$black;
			border-bottom: 1px solid c.$black;
		}
	}
	thead {
		tr {
			&:first-child {
				>* {
					&:first-child {
						border-radius: 10px 0 0 0;
					}
					&:last-child {
						border-radius: 0 10px 0 0;
					}
				}
			}
		}
	}
	tbody {
		tr {
			&:last-child {
				>* {
					&:first-child {
						border-radius: 0 0 0 10px;
					}
					&:last-child {
						border-radius: 0 0 10px 0;
					}
				}
			}
		}
	}
}
.table-wrapper {
	display: flex;
	justify-content: center;
}
#tableFront {
	padding: 5px;
	background: linear-gradient(to right, c.$yellow, c.$green);
	max-height: 60vh;
	overflow-y: overlay;
}
#tableTop {
	background: linear-gradient(to right, c.$yellow, c.$green);
	height: 5px;
	border-radius: 10px 10px 0 0;
	display: block;
}
#tableBottom {
	background: linear-gradient(to right, c.$yellow, c.$green);
	height: 5px;
	border-radius: 0 0 10px 10px;
	display: block;
}
svg {
  vertical-align: middle;
}
.btn-garbage {
  background-color: transparent;
  border: none;
}
</style>

<script setup lang="ts">
import layout from '../components/CLayout.vue';
import AH1 from '../components/atoms/AH1.vue'; // AH1コンポーネントをインポート
import { ref, onMounted, nextTick } from 'vue';
import Button from '../components/atoms/ANormalButton.vue';
import drawShapes from '../assets/ts/drawShape';

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const gridSize = 20; // Grid cell size
const points = ref<{ x: number; y: number }[]>([]); // Points that form the shape
const selectedEdge = ref<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

// Draw the grid
const drawGrid = () => {
  if (!ctx.value) return;
  ctx.value.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
  ctx.value.strokeStyle = '#ddd';

  // Draw vertical lines
  for (let x = gridSize; x < canvas.value!.width; x += gridSize) {
    ctx.value.beginPath();
    ctx.value.moveTo(x, 0);
    ctx.value.lineTo(x, canvas.value!.height);
    ctx.value.stroke();
  }

  // Draw horizontal lines
  for (let y = gridSize; y < canvas.value!.height; y += gridSize) {
    ctx.value.beginPath();
    ctx.value.moveTo(0, y);
    ctx.value.lineTo(canvas.value!.width, y);
    ctx.value.stroke();
  }
};

// Draw the current shape by connecting points
const drawShape = () => {
  if (!ctx.value || points.value.length <= 1) return;

  ctx.value.strokeStyle = '#000';
  ctx.value.lineWidth = 1;
  ctx.value.beginPath();
  ctx.value.moveTo(points.value[0].x, points.value[0].y);
  for (let i = 1; i < points.value.length; i++) {
    ctx.value.lineTo(points.value[i].x, points.value[i].y);
  }
  ctx.value.stroke();
  highlightSelectedEdge();
};

// Highlight the selected edge
const highlightSelectedEdge = () => {
  if (selectedEdge.value) {
    const { start, end } = selectedEdge.value;
    ctx.value!.strokeStyle = '#ff0000'; // Red for selected edge
    ctx.value!.lineWidth = 4; // Thicker line
    ctx.value!.beginPath();
    ctx.value!.moveTo(start.x, start.y);
    ctx.value!.lineTo(end.x, end.y);
    ctx.value!.stroke();
  }
};

// Find the closest grid point to the user's click
const getGridPoint = (x: number, y: number) => {
  const gridX = Math.round(x / gridSize) * gridSize;
  const gridY = Math.round(y / gridSize) * gridSize;
  return { x: gridX, y: gridY };
};

// Calculate distance between two points
const distance = (point1: { x: number; y: number }, point2: { x: number; y: number }) => {
  return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
};

// Handle user click to select edge
const handleClick = (e: MouseEvent) => {
  if (!canvas.value || !ctx.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const gridPoint = getGridPoint(x, y);

  // Add the point (no need to check for duplicates)
  if (points.value.length > 0) {
    let closestEdge = null;
    let minDistance = Infinity;

    // Find the closest edge to the click
    for (let i = 0; i < points.value.length - 1; i++) {
      const start = points.value[i];
      const end = points.value[i + 1];
      const middleX = (start.x + end.x) / 2;
      const middleY = (start.y + end.y) / 2;
      const dist = distance(gridPoint, { x: middleX, y: middleY });

      if (dist < minDistance) {
        minDistance = dist;
        closestEdge = { start, end, index: i };
      }
    }

    if (minDistance < gridSize) {
      selectedEdge.value = closestEdge; // Highlight this edge
    } else {
      selectedEdge.value = null;
      points.value.push(gridPoint); // Add new point if no edge selected
    }
  } else {
    points.value.push(gridPoint);
  }

  drawGrid();
  drawShape();
};

// Lifecycle hook to initialize the canvas
onMounted(() => {
  canvas.value = document.getElementById('drawCanvas') as HTMLCanvasElement | null;
  ctx.value = canvas.value?.getContext('2d');
  if (ctx.value) {
    drawGrid();
    canvas.value.addEventListener('click', handleClick);
  }
});

// Delete the selected edge
const deleteEdge = () => {
  if (selectedEdge.value !== null) {
    const selectedIndex = points.value.indexOf(selectedEdge.value.end);
    if (selectedIndex !== -1) {
      points.value.splice(selectedIndex, 1); // Remove the endpoint of the selected edge
      selectedEdge.value = null; // Reset selected edge
      drawGrid();
      drawShape();
    }
  }
};

// Delete all edges
const deleteAllEdges = () => {
  points.value = []; // Remove all edges (points)
  selectedEdge.value = null; // Reset selected edge
  drawGrid();
  drawShape();
};

// Send data to Flask and display in right-upper-body
const sendData = async () => {
  const rightLowerBody = document.querySelector('.shapeRightLowerBody') as HTMLElement;
  
  if (rightLowerBody) {
    // ゆっくりとスライドインして表示するアニメーションを追加
    rightLowerBody.style.display = 'block';
    rightLowerBody.style.right = '0';

    setTimeout(() => {
      rightLowerBody.classList.add('active');
    }, 1);

    // 送信するshapeDataを準備してJSON形式でテキストエリアに表示
    const shapeDataTextarea = document.getElementById('shapeData') as HTMLTextAreaElement;
    
    if (shapeDataTextarea) {
      shapeDataTextarea.value = JSON.stringify(points.value); // Points (shape data)をJSON形式で表示
    }
  }
};

const submitShape = async () => {
    const shapeName = (document.getElementById('shapeName') as HTMLTextAreaElement)?.value;
    const shapeData = (document.getElementById('shapeData') as HTMLTextAreaElement)?.value;
    const shapeRightLowerBody = document.querySelector('.shapeRightLowerBody') as HTMLElement;
    /*
    try {
        // shapeNameとshapeDataをExpressサーバーに送信
        const result = await fetch('http://localhost:3000/api/shape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shapeName, shapeData }),
        }).then((res) => res.json());

        console.log("Shape submitted: ", result);

    } catch (error) {
        console.error("Submission failed:", error);
    }
    if (shapeRightLowerBody) {
      shapeRightLowerBody.classList.remove('active'); // スライドアウト
      shapeRightLowerBody.style.display = 'none';
    }
    */
};

const quitSubmit = () => {
  const shapeRightLowerBody = document.querySelector('.shapeRightLowerBody') as HTMLElement;
  if (shapeRightLowerBody) {
    shapeRightLowerBody.classList.remove('active'); // スライドアウト
    shapeRightLowerBody.style.display = 'none';
  }
}

// Shapes data
const shapes = ref<Array<{ id: number; shape_name: string; shape_data: string }>>([]);

// Adjust table width based on content
const adjustTableWidth = (): void => {
  nextTick(() => {
    const tableFront = document.getElementById('tableFront') as HTMLDivElement | null;
    const tableTop = document.getElementById('tableTop') as HTMLDivElement | null;
    const tableBottom = document.getElementById('tableBottom') as HTMLDivElement | null;
    if (tableFront && tableTop && tableBottom) {
      if (tableFront.scrollHeight > tableFront.clientHeight) {
        tableTop.style.width = '442px';
        tableBottom.style.width = '442px';
      } else {
        tableTop.style.width = '431px';
        tableBottom.style.width = '431px';
      }
    }
  });
};

// Update shapes table
const updateShapesTable = async () => {
  /*const response = await fetch('http://localhost:3000/api/shape')
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  shapes.value = data;
  // Draw shapes in SVG
  data.forEach((shape: any) => {
    const svgContainerId = `svgContainer-${shape._id}`;
    const jsonpoints = JSON.parse(shape.data);
    drawShapes(jsonpoints, svgContainerId);
  });
  nextTick(() => {
    adjustTableWidth();
  });
  */
};

// Delete the selected shape
const deleteShape = async (id: string) => {
  console.log("Deleting shape with id:", id);
  try {
    // Make DELETE request to the backend
    const response = await fetch(`http://localhost:3000/api/shape/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      console.log("Shape deleted successfully");
      await updateShapesTable();
      await adjustTableWidth();
    } else {
      console.error("Failed to delete shape");
    }
  } catch (error) {
    console.error("Error while deleting shape:", error);
  }
};

// Format shape name
const formatShapeName = (name: string) => {
  return name.length > 11 ? name.slice(0, 11) + '…' : name;
};

onMounted(() => {
  updateShapesTable(); // データを取得して表に反映
  adjustTableWidth(); // 表の幅を調整

  // MongoDBの変更を監視
  const eventSource = new EventSource('http://localhost:3000/api/shape/updates');
  eventSource.onmessage = (event) => {
    const updatedData = JSON.parse(event.data);
    shapes.value = updatedData;

    // SVGの再描画
    updatedData.forEach((shape: any) => {
      const svgContainerId = `svgContainer-${shape._id}`;
      const jsonpoints = JSON.parse(shape.data);
      drawShapes(jsonpoints, svgContainerId);
    });
    // テーブル幅の再調整
    adjustTableWidth();
  };
});
</script>