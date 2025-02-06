<template>
  <div class="card">
    <div v-if="selectedCard" class="card__header">
      <!--<h2 class="card__title">Title</h2>
      <p> {{ selectedCard }} </p>
      <p> {{ selectedCard[Object.keys(selectedCard)[0]].t }} </p>-->
      <ANameInput
        :card="selectedCard"
        @update:card="handleChildUpdate"
      />
      <AMakeEquation
        :card="selectedCard"
        :arrows="arrows"
        :cards="cards"
        @update:card="handleChildUpdate"
      />
      <!--cardsを表示する
      <p> {{ cards }} </p>
      <p> {{ arrows}} </p>-->
    </div>
    <div v-else class="card__empty">
      <p>No card selected</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import ANameInput from './ANameInput.vue';
import AMakeEquation from './AMakeEquation.vue';

interface Card {
  t: string;
  x: number;
  y: number;
}

export default defineComponent({
  name: 'ACardEdit',
  props: {
    selectedCard: Object as PropType<{ [key: string]: Card } | null>,
    cards: Object as PropType<{ [key: string]: Card } | null>,
    arrows: Object as PropType<{ id: string; style: Record<string, any>; from: string; to: string }[]>,
  },
  components: {
    ANameInput,
    AMakeEquation
  },
  emits: ['update:openCardInfo', 'update:selectedCard'],
  setup(props, { emit }) {
    const handleChildUpdate = (updatedCard: { [key: string]: Card }) => {
      if (!props.selectedCard) return;
      
      const updatedKey = Object.keys(updatedCard)[0]; // 更新されたキー
      const currentCard = { ...props.selectedCard }; // 親の現在のselectedCard
      
      // 対応するキーのデータをマージ
      currentCard[updatedKey] = {
        ...currentCard[updatedKey],
        ...updatedCard[updatedKey],
      };
      emit('update:selectedCard', currentCard);
    };
    return {
      handleChildUpdate,
    };
  },
});
</script>

<style scoped>
.card__empty {
  text-align: center;
  font-style: italic;
  color: gray;
}
</style>