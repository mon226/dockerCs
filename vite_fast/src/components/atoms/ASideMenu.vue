<template>
  <div class="sideMenu" :class="{ 'closed': !isMenuOpen }">
    <div class="pullMenu" :class="{ 'open': isMenuOpen , 'closed': !isMenuOpen }" @click="toggleMenu">
      {{ isMenuOpen ? '〉' : '〈' }}
    </div>
    <div class="sideMenu__content" v-show="isMenuOpen">
      <h4 @click="toggleSection('display')" class="collapsible-header">
        表示非表示切り替え {{ isSectionOpen.display ? '\u25B3' : '\u25BD' }}
      </h4>
      <div v-show="isSectionOpen.display" class="section-content">
        <ul>
          <li v-for="(layer, index) in layers" :key="index">
            <button :style="{ height: '40px', width: '100%', backgroundColor: buttonColors[index] }" @click="toggleColor(index)">
              {{ layer }}
            </button>
          </li>
        </ul>
        <p>※ノードの追加・削除等は全レイヤー表示時にしてください。</p>
      </div>
      
      <h4 @click="toggleSection('legend')" class="collapsible-header">
        凡例 {{ isSectionOpen.legend ? '\u25B3' : '\u25BD' }}
      </h4>
      <div v-show="isSectionOpen.legend" class="section-content">
        <table class="legend-table">
          <thead>
            <tr>
              <th>type</th>
              <th>image</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(edgeType, index) in edgeTypes" :key="index">
              <td 
                :style="{ 
                  backgroundColor: edgeTypesColor[index], 
                  color: getTextColor(edgeTypesColor[index]) 
                }"
                class="type-cell"
              >
                {{ edgeType }}
              </td>
              <td class="image-cell">
                <div v-html="generateEdgeIcon(edgeType)"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useNetworkDataStore } from "../../stores/networkData";

export default defineComponent({
  name: 'ASideMenu',
  setup() {
    const store = useNetworkDataStore();
    const layers = computed(() => store.layers);
    const colors = computed(() => store.colors);
    const flag = computed<any>(() => store.flag);
    const isMenuOpen = ref(false);

    const buttonColors = ref([...colors.value]);

    // 凡例用のデータ
    const edgeTypes = ["consists of", "follows", "exhibits", "is", "handles", "requires", "consumes", "yields", "affects"];
    const edgeTypesColor = ["#262730", "#004563", "#29534d", "#f3f3f3", "#f4da24", "#f5b18099", "#2d9058", "#b13b22", "#635d73"];

    // 背景色に基づいて文字色を決定する関数
    const getTextColor = (backgroundColor: string) => {
      const darkColors = ["#262730", "#26273033", "#635d73", "#004563", "#29534d"];
      return darkColors.includes(backgroundColor) ? "#f3f3f3" : "#000000";
    };

    // エッジタイプごとのSVGアイコンを生成する関数
    const generateEdgeIcon = (edgeType: string) => {
      const baseWidth = 50;
      const baseHeight = 20;
      
      switch (edgeType) {
        case 'consists of':
          // 黒線 + 始点中点にコーン（黒）- frommiddle = 始点から中点への向き
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="15,6 15,14 25,10" fill="#262730"/>
          </svg>`;
          
        case 'follows':
          // 黒線 + 始点にコーン（#004563）- from = 終点から始点への向き
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="12,6 12,14 5,10" fill="#004563"/>
          </svg>`;
          
        case 'exhibits':
          // 黒線 + 始点中点にコーン（グレー）- frommiddle = 始点から中点への向き
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="15,6 15,14 25,10" fill="#29534d"/>
          </svg>`;
          
        case 'is':
          // 黒線 + 中点終点にコーン（白）- tomiddle = 始点から中点への向き
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="20,6 20,14 30,10" fill="#f3f3f3" stroke="black" stroke-width="0.5"/>
          </svg>`;
          
        case 'handles':
          // 黒線 + 終点に球体（黄）
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <circle cx="42" cy="10" r="4" fill="#f4da24"/>
          </svg>`;
          
        case 'requires':
          // 黒線 + 始点に球体（半透明）
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <circle cx="8" cy="10" r="4" fill="#f5b18099" stroke="black" stroke-width="0.5"/>
          </svg>`;
          
        case 'consumes':
          // 黒線 + 始点にコーン（#2d9058）- from = 終点から始点への向き
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="12,6 12,14 5,10" fill="#2d9058"/>
          </svg>`;
          
        case 'yields':
          // 黒線 + 終点にコーン（#b13b22）- to = 始点から終点への向き
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="38,6 38,14 45,10" fill="#b13b22"/>
          </svg>`;
          
        case 'affects':
          // 黒線 + 始点と終点にコーン（紫）- from & to
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
            <polygon points="12,6 12,14 5,10" fill="#635d73"/>
            <polygon points="38,6 38,14 45,10" fill="#635d73"/>
          </svg>`;
          
        default:
          return `<svg width="${baseWidth}" height="${baseHeight}" viewBox="0 0 ${baseWidth} ${baseHeight}">
            <line x1="5" y1="10" x2="45" y2="10" stroke="black" stroke-width="1"/>
          </svg>`;
      }
    };

    // 各セクションの開閉状態を管理
    const isSectionOpen = ref({
      display: false,  // 初期状態で開いている
      legend: false   // 初期状態で閉じている
    });

    const toggleMenu = () => {
      isMenuOpen.value = !isMenuOpen.value;
    };

    const toggleSection = (section: string) => {
      isSectionOpen.value[section] = !isSectionOpen.value[section];
    };

    const toggleColor = (index: number) => {
      if (buttonColors.value[index] === 'gray') {
        buttonColors.value[index] = colors.value[index];
        getVisibleLayers();
      } else {
        buttonColors.value[index] = 'gray';
        getVisibleLayers();
      }
    };

    const getVisibleLayers = () => {
      const visibleLayers = buttonColors.value.reduce((acc: string[], color, index) => {
      if (color !== 'gray') {
        acc.push(layers.value[index]);
      }
      return acc;
      }, []);
      if ( visibleLayers.length === layers.value.length) {
        store.setFlag(12);
      } else {
        store.setVisibleLayers(visibleLayers);
        if (flag.value === 15) {
          store.setFlag(16);
        } else {
          store.setFlag(15);
        }
      }
    };

    return {
      layers,
      colors,
      isMenuOpen,
      toggleMenu,
      toggleSection,
      toggleColor,
      buttonColors,
      getVisibleLayers,
      flag,
      isSectionOpen,
      edgeTypes,
      edgeTypesColor,
      getTextColor,
      generateEdgeIcon
    };
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.sideMenu {
  position: absolute;
  right: 0;
  z-index: 1000;
  height: 100%;
  display: flex;
  align-items: center;
  p {
    color: c.$black;
    font-size: 0.7rem;
  }
}
.sideMenu.closed {
  transform: translateX(100%);
}
.sideMenu__content {
  width: 200px;
  height: 100%;
  padding: 1rem;
  background-color: c.$white;
  border-left: 5px solid c.$sub_6;
  transition: opacity 0.3s ease-in-out;
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    li {
      margin-bottom: 1rem;
    }
  }
}
.pullMenu {
  width: 30px;
  height: 100px;
  background-color: c.$sub_6;
  border-radius: 5px 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: c.$white;
  font-size: 1.5rem;
  font-weight: bold;
  &.open {
    padding-left: 15px;
  }
  &.closed {
    padding-right: 10px;
    margin-left: -30px;
  }
}
h4 {
  color: c.$black;
  margin-bottom: 1rem;
}
.collapsible-header {
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    color: c.$sub_6;
  }
}
.section-content {
  margin-bottom: 1rem;
}
.legend-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  
  th, td {
    border: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  
  th {
    background-color: c.$sub_6;
    color: c.$white;
    font-weight: bold;
  }
  
  .type-cell {
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.3rem 0.5rem;
  }
  
  .image-cell {
    background-color: #f9f9f9;
    width: 60px;
    text-align: center;
    padding: 0.2rem;
    
    svg {
      display: block;
      margin: 0 auto;
    }
  }
}
</style>