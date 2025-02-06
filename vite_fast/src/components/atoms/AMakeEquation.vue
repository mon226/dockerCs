<template>
  <div>
    <div class="eauation-wrapper">
      <p> {{ localCard[Object.keys(localCard)[0]].t }} </p>
      <div class="isVariable">
        <select id="selectplus">
          <option value="equal">=</option>
          <option value="plusequal">+=</option>
        </select>
      </div>
    </div>
    <div class="equationBox">
      <!-- focusイベントで状態を切り替える -->
      <div
        class="equation"
        contenteditable="true"
        placeholder="Equation"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="updateEquationText"
        ref="editableDiv"
      ></div>
    </div>
    <div v-if="isFocused" class="choice">
      <button
        v-for="arrow in filteredArrows"
        :key="arrow.id"
        class="arrow-button"
        @mousedown="preventBlur"
        @click="handleArrowClick(arrow)"
      >
        {{ getCardTitle(arrow.from) }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref, watch, reactive } from 'vue';

interface Card {
  t: string;
  x: number;
  y: number;
}

interface Arrow {
  id: string;
  style: Record<string, any>;
  from: string;
  to: string;
}

interface Math {
  targetid: string;
  target: string;
  iseqaul: boolean;
  //sourceidは配列
  sourceid: Array<string>;
  sourcet: Array<string>;
  equation: string;
}

export default defineComponent({
  name: 'AMakeEquation',
  props: {
    card: {
      type: Object as PropType<{ [key: string]: Card } | null>,
      required: true,
    },
    arrows: {
      type: Array as PropType<Arrow[]>,
      required: true,
    },
    cards: {
      type: Object as PropType<{ [key: string]: Card } | null>,
      required: true,
    },
  },
  emits: ['update:card'],
  setup(props, { emit }) {
    const isFocused = ref(false);
    const preventBlurFlag = ref(false);
    const equationText = ref(''); // Tracks the content of the div

    const handleFocus = () => {
      isFocused.value = true;
    };

    const handleBlur = () => {
      if (!preventBlurFlag.value) {
        isFocused.value = false;
      }
      preventBlurFlag.value = false;
    };

    const preventBlur = () => {
      preventBlurFlag.value = true;
    };

    const handleArrowClick = (arrow: Arrow) => {
      const fromCardText = props.cards?.[arrow.from]?.t || '';
      const editableDiv = document.querySelector('.equation') as HTMLElement;
      const newEntry = `[<span class="display-text">${fromCardText}</span><span class="hidden-text">${arrow.from}</span>]`;
      editableDiv.innerHTML += editableDiv.innerText ? newEntry : newEntry;
      equationText.value = editableDiv.innerText;
      const fullContentHTML = editableDiv.innerHTML;
      console.log('AMakeEquation (with hidden text):', fullContentHTML);
    };


    const updateEquationText = (event: Event) => {
      const editableDiv = event.target as HTMLElement;
      const fullContentHTML = editableDiv.innerHTML;
      console.log('AMakeEquation (with hidden text):', fullContentHTML);
      equationText.value = editableDiv.innerText;
    };


    const selectedCardId = computed(() => Object.keys(props.card || {})[0]);

    const filteredArrows = computed(() => {
      if (!selectedCardId.value || !props.arrows) return [];
      return props.arrows.filter((arrow) => arrow.to === selectedCardId.value);
    });

    const getCardTitle = (fromId: string): string => {
      return props.cards?.[fromId]?.t || '';
    };

    const localCard = reactive({ ...props.card });

    watch(
      () => props.card,
      (newCard) => {
        if (newCard) {
          Object.keys(localCard).forEach((key) => delete localCard[key]);
          Object.assign(localCard, newCard);
        }
      },
      { immediate: true, deep: true }
    );
    watch(
      () => localCard,
      (newVal) => {
        emit('update:card', newVal);
      },
      { deep: true }
    );

    return {
      isFocused,
      equationText,
      handleFocus,
      handleBlur,
      preventBlur,
      handleArrowClick,
      updateEquationText,
      filteredArrows,
      getCardTitle,
      localCard,
    };
  },
});
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
.eauation-wrapper {
  display: flex;
  align-items: center;
  margin: 10px 0;
}
#selectplus {
  padding: 2px 4px;
  border: 1px solid c.$gray-light;
  border-radius: 2px;
  margin: 0 4px;
}
.equationBox {
  height: 100px;
  width: 100%;
}
.choice {
  margin: 0 5px;
  border: 1px solid c.$gray;
  padding: 0 0 5px 5px;
}
.equation {
  width: 100%;
  height: 100%;
  resize: none;
  padding: 5px;
  font-size: 16px;
  font-family: 'Arial';
  background-color: c.$white;
  color: c.$black;
  border: 1px solid c.$gray;
  border-radius: 5px;
  overflow-y: auto;
}
.equation:focus {
  outline: none;
  border: 2px solid c.$maroon;
}
.arrow-button {
  padding: 6px 10px;
  font-size: 14px;
  color: c.$white;
  background-color: c.$blue;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 5px;
  margin-top: 5px;
}
.hidden-text {
  display: none;
}
</style>
