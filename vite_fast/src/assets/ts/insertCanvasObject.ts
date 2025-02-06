import { ref } from 'vue';

const cards = ref<{ [key: string]: { t: string; x: number; y: number } } | null>(null);

export const handleButtonClick = () => {
  if (!cards.value) {
    cards.value = {};
  }
  const newKey = Math.random().toString(36).slice(-8);
  cards.value[newKey] = {
    t: 'Object',
    x: Math.floor(Math.random() * (200 - 80) + 80),
    y: Math.floor(Math.random() * (200 - 80) + 80),
  };
};

export const updateCard = (key: string, card: { t: string; x: number; y: number }) => {
  if (cards.value) {
    cards.value[key] = card;
  }
};

export const toggleEditMode = (key: string) => {
  // ここで編集モード切り替えの処理
};


/*
export default defineComponent({
  name: 'App',
  setup() {
    const cards = ref<{ [key: string]: { t: string; x: number; y: number } } | null>(null);
    const editMode = ref({ key: '' });
    const dragging = ref<{ key: string; x: number; y: number } | null>(null);

    const handleButtonClick = () => {
      if (!cards.value) {
        cards.value = {};
      }
      const newKey = Math.random().toString(36).slice(-8);
      cards.value[newKey] = {
        t: 'Object',
        x: Math.floor(Math.random() * (200 - 80) + 80),
        y: Math.floor(Math.random() * (200 - 80) + 80),
      };
    };

    const updateCard = (key: string, card: { t: string; x: number; y: number }) => {
      if (cards.value) {
        cards.value[key] = card;
      }
    };

    const toggleEditMode = (key: string) => {
      editMode.value.key = key;
    };

    const handleDragStart = (e: DragEvent, key: string) => {
      const card = cards.value ? cards.value[key] : null;
      if (!card) return;
      dragging.value = {
        key,
        x: e.clientX - card.x,
        y: e.clientY - card.y,
      };
    };

    const handleDrop = (e: DragEvent) => {
      if (!dragging.value || !cards.value) return;

      const card = cards.value[dragging.value.key];
      if (!card) return;

      updateCard(dragging.value.key, {
        ...card,
        x: e.clientX - dragging.value.x,
        y: e.clientY - dragging.value.y,
      });

      dragging.value = null;
    };

    return {
      cards,
      editMode,
      dragging,
      toggleEditMode,
      handleDragStart,
      handleDrop,
      handleButtonClick,
    };
  },
});
*/