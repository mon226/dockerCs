<template>
  <div class="input-container">
    <div id="h2-container">
      <h2> {{ title }} </h2>
    </div>
    <input
      type="number"
      v-model.number="inputValue"
      :min="limits.下限"
      :max="limits.上限"
      placeholder="数値を入力"
    />
    <span id="unitArea">{{ unit }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'NumberInput',
  props: {
    title: {
      type: String,
      required: true,
    },
    limits: {
      type: Object as PropType<{ 下限: number; 上限: number }>,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      inputValue: 0, // 初期値
    };
  },
  watch: {
    inputValue(newValue) {
      // 親コンポーネントに入力値を送信
      this.$emit('update:modelValue', newValue);
    }
  },
});
</script>

<style lang="scss" scoped>
@use "@/assets/style/color" as c;
.input-container {
  margin: 16px 0;
  display: flex;
  justify-content: center;
  align-items: center; /* 縦方向の中央揃え */
}

input[type="number"] {
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  width: calc(50% - 20px); /* 幅を50%に */
  border: 1px solid transparent;
  background: c.$gray;
  color: c.$white;
  text-align: right; /* 数値を右寄せ */
}

input[type="number"]:focus {
  outline: none;
  border: 2px solid c.$maroon; /* フォーカス時に枠を赤く */
}

input[type=number]::-webkit-inner-spin-button {
  margin-left: 10px;
}


#unitArea {
  margin-left: 5px;
  font-size: 16px;
  color: c.$white;
  width: 20px;
  justify-content: center;
  align-items: center; /* 縦方向の中央揃え */
}

#h2-container {
  margin-right: 20px;
  width: 40%;
}
</style>
