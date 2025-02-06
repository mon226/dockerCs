<template>
  <div id="imitation-select-container">
    <div id="h2-container">
      <h2>{{ title }}</h2>
    </div>
    
    <!-- Main display for the selected shape -->
    <table class="imitationSelect" @click="togglePulldown">
      <tbody>
        <tr>
          <td class="imitationImage">
            <div :id="'svgContainer-selected'"></div>
          </td>
          <td class="imitationText">
            <!-- 条件付きレンダリングでnullかどうかをチェック -->
            <span v-if="selectedItem">{{ selectedItem.name }}</span>
            <span v-else>------</span>
          </td>
          <td class="imitationData">
            <!-- 条件付きレンダリングでnullかどうかをチェック -->
            <span v-if="selectedItem">{{ selectedItem.data }}</span>
            <span v-else>------</span>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Dropdown options -->

    <table v-if="isPulldownVisible" class="imitationPulldown">
      <tr v-for="(shape, id) in shapes" :key="shape._id" @click="selectItem(id)">
        <td class="empty"></td>
        <td class="imitationImage">
          <div :id="'svgContainer-' + shape._id"></div>
        </td>
        <td class="imitationText2">{{ shape.name }}</td>
        <td class="imitationData">{{ shape.data }}</td>
      </tr>
    </table>
  </div>
</template>


<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import drawShapes from '../../assets/ts/drawShape';

export default defineComponent({
  name: 'ImitationSelect',
  props: {
    title: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Object as () => { _id: string; name: string; data: string } | null,
      required: false,
    }
  },
  setup(props, { emit }) {
    const shapes = ref<Array<{ _id: string; name: string; data: string }>>([]);
    const selectedItem = ref<{ _id: string; name: string; data: string } | null>(props.modelValue || null);
    const isPulldownVisible = ref(false);

    // Fetch shapes from the API
    const updateShapesTable = async () => {
      const response = await fetch('http://localhost:3000/api/shape');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      shapes.value = data;

      // Draw SVGs in the dropdown options
      data.forEach((shape: any) => {
        const svgContainerId = `svgContainer-${shape._id}`;
        const jsonpoints = JSON.parse(shape.data);
        drawShapes(jsonpoints, svgContainerId);
      });

      // Set the initial selected item
      if (data.length > 0 && !selectedItem.value) {
        selectedItem.value = data[0];
        drawShapes(JSON.parse(data[0].data), 'svgContainer-selected');
        emit('update:modelValue', selectedItem.value);
      }
    };

    // Select an item from the dropdown
    const selectItem = (id: number) => {
      selectedItem.value = shapes.value[id];
      drawShapes(JSON.parse(shapes.value[id].data), 'svgContainer-selected');
      isPulldownVisible.value = false; // Close the dropdown
      emit('update:modelValue', selectedItem.value); // 親コンポーネントに選択したアイテムを伝える
    };

    // Toggle dropdown visibility
    const togglePulldown = () => {
      isPulldownVisible.value = !isPulldownVisible.value;

      // 三角形を回転させるクラスをトグル
      const imitationSelectTable = document.querySelector('.imitationSelect');
      if (imitationSelectTable) {
        imitationSelectTable.classList.toggle('pulldown-open', isPulldownVisible.value);
      }
    };

    onMounted(() => {
      updateShapesTable(); // Fetch data and update the table

      // Listen for real-time updates from MongoDB
      const eventSource = new EventSource('http://localhost:3000/api/shape/updates');
      eventSource.onmessage = (event) => {
        const updatedData = JSON.parse(event.data);
        shapes.value = updatedData;

        // Redraw SVGs for updated data
        updatedData.forEach((shape: any) => {
          const svgContainerId = `svgContainer-${shape._id}`;
          const jsonpoints = JSON.parse(shape.data);
          drawShapes(jsonpoints, svgContainerId);
        });
      };
    });

    return {
      shapes,
      selectedItem,
      isPulldownVisible,
      selectItem,
      togglePulldown,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
#imitation-select-container {
  position: relative;
  display: flex;
  margin: 16px 0;
  justify-content: center;
  align-items: center;
}

table {
  &.imitationSelect, &.imitationPulldown {
    table-layout: fixed;
    border: 1px solid c.$black;
    border-collapse: separate;
    border-spacing: 0;
    border-radius: 3px;
    color: c.$white;
    line-height: 0px;
    cursor: pointer;
  }

  &.imitationSelect {
    position: relative;
    z-index: 10;
    width: 50%;
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    background-color: c.$gray;

    /* 三角形を回転させる */
    &.pulldown-open {
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 14l5-5 5 5z"/></svg>');
    }
  }

  &.imitationPulldown {
    position: absolute;
    top: 100%;
    width: calc(90% + 20px);
  }
}

td {
  &.imitationImage {
    width: 32px;
    text-align: center;
    padding-left: 20px;
    background: c.$gray;
    tr:hover {
      background: c.$black;
      color: c.$white;
    }
  }

  &.imitationText {
    text-align: left;
    padding-left: 50px;
    tr:hover {
      background: c.$black;
      color: c.$white;
    }
  }
    &.imitationText2 {
    text-align: left;
    padding-left: 50px;
    background: c.$gray;
    tr:hover {
      background: c.$black;
      color: c.$white;
    }
  }
}

table {
  &.imitationPulldown tr, &.imitationSelect tr {
    height: 50px;
    font-size: 13px;
  }
  &.imitationPullDown tr td {
    background: c.$gray;
  }
}

#h2-container {
  margin-right: 20px;
  width: 40%;
}

.imitationData {
  display: none;
}

.empty {
  width: calc(40% + 20px); 
  background: transparent;
}
</style>
