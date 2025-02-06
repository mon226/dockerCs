<template>
  <layout>
    <AH1 :h1Id="'NetworkHeading'" h1Title="Network" />
    <div id="board-wrapper">
      <CMenuBar
        :handleButtonClick="handleButtonClick"
        :changeCursor="changeCursor"
        :resetCursor="resetCursor"
        :saveLog="saveLog"
        :openCardInfo="isDescriptionVisible"
        @update:openCardInfo="isDescriptionVisible = $event"
        @update:selectedLabel="updateScalingFactor"
        :selectedCard="selectedCard"
        @update:selectedCard="updateCard"
        :cards="cards"
        :arrows="arrows"
      />
      <div id="dashboard">
        <div class="canvas-container" @drop="handleDrop" @dragover.prevent>
          <div id="transparent-grid"  :style="{ transform: 'scale(' + scalingFactor + ')'}">
            <!-- 矢印リストをループして描画 -->
            <div
              v-for="arrow in arrows"
              :key="arrow.id"
              class="arrow-container"
              :style="{ position: 'absolute', top: '0', left: '0' }"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :style="arrow.style"
                width="100%"
                height="100%"
              >
                <!-- 矢印の線 -->
                <line
                  :x1="arrow.startX"
                  :y1="arrow.startY"
                  :x2="arrow.endX"
                  :y2="arrow.endY"
                  stroke="black"
                  stroke-width="4"
                />
              </svg>
              <!-- 矢印の頭 (SVG三角形) -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 17.320508"
                :style="arrow.headStyle"
              >
                <polygon
                  class="cls-1"
                  points="10 0 0 17.320508 20 17.320508"
                  fill="#231815"
                />
              </svg>
            </div>
            <!-- 仮の点線 -->
            <!--<div
              v-if="isDrawingTempLine"
              class="dashed-line"
              :style="dashedLineStyle"
            ></div>-->
            <CNetworkGrid :gridData="data" :displayNone="displayNone"/>
              <div
                v-for="(card, key) in cards"
                :key="key"
                :id="'object-' + key"
                :class="['basediv', editMode.key === key ? 'edit-mode' : '']"
                :style="{ top: card.y + 'px', left: card.x + 'px' }"
                @click="handleBaseDivClick($event, key)"
              >
                <img
                  src="@/assets/image/OPM/objectDrag.svg"
                  alt="object"
                  class="object-image"
                />
                <div class="topdiv-wrapper">
                <!-- topdiv for text editing -->
                  <template v-if="editMode.key === key">
                    <textarea
                      v-model="card.t"
                      @blur="toggleEditMode('')"
                      :class="['topdiv-object']"
                    ></textarea>
                  </template>
                  <template v-else>
                    <div
                      class="topdiv-object"
                      @dblclick="toggleEditMode(key)"
                      @click="openCardDescription(key)"
                      draggable="true"
                      @dragstart="handleDragStart($event, key, 'object')"
                      >
                    {{ card.t }}</div>
                  </template>
                </div>
              </div>
            <font-awesome-icon
              v-if="showRightExpand"
              :icon="['fas', 'circle-plus']"
              class="plus-icon"
              :style="rightExpandStyle"
              @click="expandCanvas('horizontal-right')"
            />
            <font-awesome-icon
              v-if="showBottomExpand"
              :icon="['fas', 'circle-plus']"
              class="plus-icon"
              :style="bottomExpandStyle"
              @click="expandCanvas('vertical-down')"
            />
            <font-awesome-icon
              v-if="showLeftExpand"
              :icon="['fas', 'circle-plus']"
              class="plus-icon"
              :style="leftExpandStyle"
              @click="expandCanvas('horizontal-left')"
            />
            <font-awesome-icon
              v-if="showTopExpand"
              :icon="['fas', 'circle-plus']"
              class="plus-icon"
              :style="topExpandStyle"
              @click="expandCanvas('vertical-up')"
            />
          </div>
        </div>
      </div>
    </div>
    <div id="networkInfo">
      <!-- Card一覧 -->
      <h3>Cards:</h3>
      <ul>
        <li v-for="(card, key) in cards" :key="key">
          ID: {{ key }}, Text: {{ card.t }}, X: {{ card.x }}, Y: {{ card.y }}
        </li>
      </ul>
      <!-- Arrow一覧 -->
      <h3>Arrows:</h3>
      <ul>
        <li v-for="arrow in arrows" :key="arrow.id">
          From: {{ arrow.from }}, To: {{ arrow.to }}, Style: {{ arrow.style }}
        </li>
      </ul>
    </div>
  </layout>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, onMounted, onUnmounted, onBeforeUnmount, computed, Ref } from 'vue';
import layout from '../components/CLayout.vue';
import AH1 from '../components/atoms/AH1.vue';
import CMenuBar from '../components/CMenuBar.vue';
import CNetworkGrid from '../components/CNetworkGrid.vue';
import { updateArrowStyle } from '../assets/ts/updateArrowStyle';

const cursorType = ref('default');

const changeCursor = (type: string) => { cursorType.value = type; };
const resetCursor = () => { cursorType.value = 'default'; };

type Child = { [key: string]: number; };
type Parent = { [key: string]: Child; };

const data: Parent = reactive({});
const displayBlock: Parent = reactive({});
const displayNone: Parent = reactive({});

for (let i = 1; i <= 9; i++) {
  const parentKey = `parent:${i}`;
  data[parentKey] = {};
  for (let j = 1; j <= 9; j++) {
    const childKey = `child:${j}`;
    data[parentKey][childKey] = j;
    if (parentKey === 'parent:5' && childKey === 'child:5') {
      displayBlock[parentKey] = displayBlock[parentKey] || {};
      displayBlock[parentKey][childKey] = data[parentKey][childKey];
    } else {
      displayNone[parentKey] = displayNone[parentKey] || {};
      displayNone[parentKey][childKey] = data[parentKey][childKey];
    }
  }
}

const showRightExpand = ref(true);
const showLeftExpand = ref(true);
const showTopExpand = ref(true);
const showBottomExpand = ref(true);

const absTopLeft = ref({ x: 0, y: 0 });
const absTopRight = ref({ x: 0, y: 0 });
const absBottomLeft = ref({ x: 0, y: 0 });
const absBottomRight = ref({ x: 0, y: 0 });
const absCenter = ref({ x: 0, y: 0 });
const absTop = ref({ x: 0, y: 0 });
const absLeft = ref({ x: 0, y: 0 });
const absBottom = ref({ x: 0, y: 0 });
const absRight = ref({ x: 0, y: 0 });
const rightExpandStyle = ref({});
const bottomExpandStyle = ref({});
const leftExpandStyle = ref({});
const topExpandStyle = ref({});

const calculateDisplayArea = () => {
  let parentKeys = Object.keys(displayBlock);
  let minParentKey = Math.min(...parentKeys.map((key) => parseInt(key.split(':')[1])));
  let maxParentKey = Math.max(...parentKeys.map((key) => parseInt(key.split(':')[1])));
  let childKeys = Object.keys(displayBlock[parentKeys[0]]);
  let minChildKey = Math.min(...childKeys.map((key) => parseInt(key.split(':')[1])));
  let maxChildKey = Math.max(...childKeys.map((key) => parseInt(key.split(':')[1])));
  absTopLeft.value = { x: 100 + 500 * (minParentKey - 1), y: 100 + 500 * (minChildKey - 1) };
  absTopRight.value = { x: 100 + 500 * maxParentKey, y: 100 + 500 * (minChildKey - 1) };
  absBottomLeft.value = { x: 100 + 500 * (minParentKey - 1), y: 100 + 500 * maxChildKey };
  absBottomRight.value = { x: 100 + 500 * maxParentKey, y: 100 + 500 * maxChildKey };
  absTop.value = { x: 100 + 250 * ( minParentKey + maxParentKey - 1), y: 100 + 500 * ( minChildKey -1 ) };
  absLeft.value = { x: 100 + 500 * ( minParentKey -1 ), y: 100 + 250 * 500 * ( minChildKey + maxChildKey -1 )};
  absBottom.value = { x: 100 + 250 * ( minParentKey + maxParentKey - 1), y: 100 + 500 * maxChildKey};
  absRight.value = { x: 100 + 500 * maxParentKey, y: 100 + 250 * 500 * ( minChildKey + maxChildKey -1 )};
  absCenter.value = { x: 100 + 250 * ( minParentKey + maxParentKey - 1), y: 100 + 250 * ( minChildKey + maxChildKey - 1)};
  rightExpandStyle.value = {
    top: ((absTopLeft.value.y + absBottomLeft.value.y) / 2) + 'px',
    left: absRight.value.x + 'px',
    position: 'absolute',
    transform: 'translateY(-50%)'
  };
  bottomExpandStyle.value = {
    top: absBottom.value.y + 'px',
    left: ((absTopLeft.value.x + absTopRight.value.x) / 2) + 'px',
    position: 'absolute',
    transform: 'translateX(-50%)'
  };
  leftExpandStyle.value = {
    top: ((absTopLeft.value.y + absBottomLeft.value.y) / 2) + 'px',
    left: absLeft.value.x + 'px',
    position: 'absolute',
    transform: 'translateY(-50%) translateX(-100%)'
  };
  topExpandStyle.value = {
    top: absTop.value.y + 'px',
    left: ((absTopLeft.value.x + absTopRight.value.x) / 2) + 'px',
    position: 'absolute',
    transform: 'translateX(-50%) translateY(-100%)'
  };
  showRightExpand.value = maxParentKey < 9;
  showLeftExpand.value = minParentKey > 1;
  showTopExpand.value = minChildKey > 1;
  showBottomExpand.value = maxChildKey < 9;
};

watch(displayNone, calculateDisplayArea, { deep: true });

// スクロール処理を関数として分離
const adjustScrollPosition = () => {
  const container = document.querySelector('.canvas-container') as HTMLElement;
  if (container) {
    const halfwidth = (container.offsetWidth - 11) / 2;
    const halfheight = (container.offsetHeight - 11)/ 2;
    container.scrollLeft = absCenter.value.x - halfwidth;
    container.scrollTop = absCenter.value.y - halfheight; 
  }
};

onMounted(() => {
  calculateDisplayArea();
  nextTick(adjustScrollPosition);
  window.addEventListener('resize', adjustScrollPosition);
});

onUnmounted(() => {
  window.removeEventListener('resize', adjustScrollPosition);
});

const expandCanvas = (direction: 'horizontal-right' | 'horizontal-left' | 'vertical-down' | 'vertical-up') => {
  const expandLogic = (newParentKey: string, parentKey: string) => {
    displayBlock[newParentKey] = {};
    Object.keys(displayBlock[parentKey]).forEach(childKey => {
      displayBlock[newParentKey][childKey] = data[newParentKey][childKey];
      if (displayNone[newParentKey]?.[childKey]) {
        delete displayNone[newParentKey][childKey];
        if (Object.keys(displayNone[newParentKey]).length === 0) {
          delete displayNone[newParentKey];
        }
      }
    });
  };
  if (direction === 'horizontal-right') {
    const maxParent = Math.max(...Object.keys(displayBlock).map(key => parseInt(key.split(':')[1])));
    const newParentKey = `parent:${maxParent + 1}`;
    expandLogic(newParentKey, `parent:${maxParent}`);
  } else if (direction === 'horizontal-left') {
    const minParent = Math.min(...Object.keys(displayBlock).map(key => parseInt(key.split(':')[1])));
    const newParentKey = `parent:${minParent - 1}`;
    expandLogic(newParentKey, `parent:${minParent}`);
  } else if (direction === 'vertical-down') {
    let maxChild = 0;
    Object.keys(displayBlock).forEach(key => {
      maxChild = Math.max(maxChild, ...Object.keys(displayBlock[key]).map(childKey => parseInt(childKey.split(':')[1])));
    });
    const newChildKey = `child:${maxChild + 1}`;
    Object.keys(displayBlock).forEach(parentKey => {
      displayBlock[parentKey][newChildKey] = data[parentKey][newChildKey];
      if (displayNone[parentKey] && displayNone[parentKey][newChildKey]) {
        delete displayNone[parentKey][newChildKey];
        if (Object.keys(displayNone[parentKey]).length === 0) {
          delete displayNone[parentKey];
        }
      }
    });
  } else if (direction === 'vertical-up') {
    let minChild = 100;
    Object.keys(displayBlock).forEach(key => {
      minChild = Math.min(minChild, ...Object.keys(displayBlock[key]).map(childKey => parseInt(childKey.split(':')[1])));
    });
    const newChildKey = `child:${minChild - 1}`;
    Object.keys(displayBlock).forEach(parentKey => {
      displayBlock[parentKey][newChildKey] = data[parentKey][newChildKey];
      if (displayNone[parentKey] && displayNone[parentKey][newChildKey]) {
        delete displayNone[parentKey][newChildKey];
        if (Object.keys(displayNone[parentKey]).length === 0) {
          delete displayNone[parentKey];
        }
      }
    });
  };
  calculateDisplayArea();
};

interface Card {
  t: string;
  x: number;
  y: number;
}

const cards = ref<{ [key: string]: Card } | null>(null);
const editMode = ref<{ key: string }>({ key: '' });
const dragging = ref<{ key: string; type: string; x: number; y: number } | null>(null);

// カードを追加するボタンクリック処理
const handleButtonClick = () => {
  const newKey = Math.random().toString(36).slice(-8);
  cards.value = cards.value || {};
  cards.value[newKey] = { t: 'Object', x: Math.random() * 300 + 2200, y: Math.random() * 300 + 2200 };
};

const toggleEditMode = (key: string) => {
  if (editMode.value.key === key) {
    editMode.value.key = '';
    changeCursor('default');
    openCardDescription(key);
  } else {
    editMode.value.key = key;
    changeCursor('text');
  }
};

const handleDragStart = (e: DragEvent, key: string, type: 'object') => {
  const card = cards.value?.[key];
  if (!card) return;
  dragging.value = { key, type, x: e.clientX - card.x, y: e.clientY - card.y };
};

const handleDrop = (e: DragEvent) => {
  if (!dragging.value) return;
  const { key, x, y } = dragging.value;
  const card = cards.value?.[key];
  if (card) {
    card.x = e.clientX - x;
    card.y = e.clientY - y;
    updateArrowsForCard(key, card.x, card.y);
  }
  dragging.value = null;
};

const saveLog = async () => {
  if (!cards.value) {
    console.log("No cards to save.");
    return;
  }
  const cardInfo = Object.entries(cards.value).map(([key, card]) => ({
    id: `object-${key}`,
    text: card.t,
    top: card.y,
    left: card.x,
  }));
  console.log("Saving card information:", cardInfo);
  const logData = {
    gridData: data,
    displayNone: displayNone,
    displayBlock: displayBlock,
    timeStamp: new Date().toISOString(),
  };
  console.log("Saving log data:", logData);
  try {
    const response = await fetch("/api/save_grid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(logData)
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Data saved successfully with ID:", result.id);
  } catch (error) {
    console.error("Failed to save data:", error);
  }
};

const scalingFactor = ref(1);
const updateScalingFactor = (newScalingFactor: string) => {
  const scaleValue = parseFloat(newScalingFactor.replace('%', '')) / 100; // "100%" -> 1
  scalingFactor.value = scaleValue;
  calculateDisplayArea();
};

const startX = ref(0);
const startY = ref(0);
const arrows = ref<{ id: string; style: Record<string, any>; from: string; to: string }[]>([]); // 矢印リスト
const startCardKey = ref<string | null>(null);
const isDrawingTempLine = ref(false); // 点線描画中フラグ
const mouseleft = ref(0)
const mousetop = ref(0)

const update = (e) => {
  mouseleft.value = e.pageX
  mousetop.value = e.pageY
}
const updatePosition = computed(() => {
  return {
    left: mouseleft.value + 'px',
    top: mousetop.value + 'px',
  }
})
onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))

const dashedLineStyle = computed(() => {
  const container = document.querySelector('.canvas-container') as HTMLElement;
  const rect = container.getBoundingClientRect();
  if (!isDrawingTempLine.value || !startCardKey.value) return {};
  const startCard = cards.value?.[startCardKey.value];
  if (!startCard) return {};
  const startX = startCard.x;
  const startY = startCard.y;
  const deltaX = mouseleft.value - rect.left + container.scrollLeft - startX;
  const deltaY = mousetop.value - rect.top + container.scrollTop - startY;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  return {
    position: 'absolute',
    top: `${startY}px`,
    left: `${startX}px`,
    width: `${length}px`,
    height: `2px`,
    backgroundColor: 'transparent',
    borderTop: '2px dashed #586D8C',
    transform: `rotate(${angle}deg)`,
    transformOrigin: '0 50%',
  };
});

const handleBaseDivClick = (event: MouseEvent, key: string) => {
  const target = event.target as HTMLElement;
  // topdiv-objectではなくbasedivの上でクリックされた場合のみ開始可能
  if (!target.classList.contains('topdiv-object')) {
    if (startCardKey.value === null) {
      startCardKey.value = key; 
      isDrawingTempLine.value = true; 
    } else {
      const endCardKey = key;
      drawArrowBetweenCards(startCardKey.value, endCardKey); 
      startCardKey.value = null; 
      isDrawingTempLine.value = false;
    }
  }
};
// カード間で線を描画
const drawArrowBetweenCards = (startKey: string, endKey: string) => {
  if (startKey === endKey) {
    console.warn("Start and end cards must be different.");
    return;
  }
  const startCard = cards.value?.[startKey];
  const endCard = cards.value?.[endKey];
  if (!startCard || !endCard) return;
  const startX = startCard.x;
  const startY = startCard.y;
  const endX = endCard.x;
  const endY = endCard.y;
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  const arrowId = `arrow-from${startKey}-to${endKey}`; // 新しいID形式
  
  const newArrow = {
    id: arrowId,
    from: startKey,
    to: endKey,
    headImage: '/src/assets/image/svg/arrowhead.svg', // 矢印の頭の画像パス
    style: {
      position: 'absolute',
      top: `${startY}px`,
      left: `${startX}px`,
      width: `${length}px`,
      height: `4px`,
      backgroundColor: 'black',
      transform: `rotate(${angle}deg)`,
      transformOrigin: '0 50%',
    },
    headStyle: {
      position: 'absolute',
      width: '20px',
      height: '17.32px',
      top: `${endY - 17.32}px`, // 頂点の調整: 矢印の終点に三角形を配置
      left: `${endX - 10}px`,
      transform: `rotate(${angle}deg) translate(0px, -8.66px)`, // 頂点 (10, 10√3) を (endX, endY) に一致させる
      transformOrigin: '10px 17.32px', // 回転の基準を三角形の底辺中央に設定
    },
  };
  updateArrowStyle(newArrow, startX, startY, endX, endY);
  arrows.value.push(newArrow);
  console.log("Arrow added:", {
    id: arrowId,
    from: startKey,
    to: endKey,
  });
  console.log("Current arrow IDs and connections:", arrows.value.map((arrow) => ({
    id: arrow.id,
    from: arrow.from,
    to: arrow.to,
  })));
};

// カードが2つ以上なければ描画を制限
const canDrawArrow = computed(() => {
  return cards.value && Object.keys(cards.value).length >= 2;
});

// カード移動時に関連する矢印を更新する関数
const updateArrowsForCard = (cardKey: string, newX: number, newY: number) => {
  arrows.value.forEach((arrow) => {
    if (arrow.from === cardKey) {
      const targetCard = cards.value?.[arrow.to];
      if (targetCard) {
        updateArrowStyle(arrow, newX, newY, targetCard.x, targetCard.y);
      }
    }
    if (arrow.to === cardKey) {
      const sourceCard = cards.value?.[arrow.from];
      if (sourceCard) {
        updateArrowStyle(arrow, sourceCard.x, sourceCard.y, newX, newY);
      }
    }
  });
};

const isDescriptionVisible = ref(false);
const selectedCard = ref<{ [key: string]: Card } | null>(null);
const openCardDescription = (key: string) => { 
  isDescriptionVisible.value = !isDescriptionVisible.value;
  if (cards.value && cards.value[key]) {
    selectedCard.value = { [key]: { ...cards.value[key] } };
  }
};

const updateCard = (updatedCard: Ref<{ [key: string]: Card } | null>) => {
  const updatedKey = Object.keys(selectedCard.value)[0];
  if (!updatedKey || !cards.value[updatedKey]) {
    console.error('Key not found in cards:', updatedKey);
    return;
  }
  cards.value[updatedKey].t = selectedCard.value[updatedKey].t;
};
</script>

<style lang="scss" scoped>
// @assets/style/_network.scssに全て書いてあるのでそれを読み込む
@use "@/assets/style/network" as n;

</style>