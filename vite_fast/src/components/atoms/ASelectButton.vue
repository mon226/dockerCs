<template>
  <div id="dropdown-container">
    <div id="h2-container">
      <h2> {{ title }} </h2>
    </div>
    <select id="item-select" v-model="selectedItem">
      <option value="">------</option> <!-- 空の値で何も選択しないオプション -->
      <option v-for="item in items" :key="item" :value="item">
        {{ item }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'ItemDropdown',
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<string[]>,
      required: true,
    },
  },
  data() {
    return {
      selectedItem: '', // 初期値は空のオプション
    };
  },
  watch: {
    selectedItem(newValue) {
      // 親コンポーネントに選択された値を送信
      this.$emit('update:modelValue', newValue);
    }
  }
});
</script>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
#item-select {
  padding: 8px;
  font-size: 16px;
  text-align: center; /* テキストを中央揃え */
  text-align-last: center; /* 選択されたアイテムも中央揃えに */
  border-radius: 5px;
  background: c.$gray;
  color: c.$white;
  border: 1px solid transparent;
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

#item-select:focus {
  outline: none; /* デフォルトのフォーカススタイルを無効化 */
  border: 2px solid c.$sub_8; /* フォーカス時に枠を赤く */
}

#h2-container {
  margin-right: 20px;
  width: 40%;
}
</style>