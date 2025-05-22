<template>
  <div>
    <div class="info_btn" @click="handleToggleInfo">
      <font-awesome-icon 
        :icon="isInfoVisible ? ['fas', 'xmark'] : ['fas', 'info-circle']"
        class="infoicon"
      />
    </div>
    <transition name="info">
      <div v-show="isInfoVisible" class="info">
        <nav class="info-nav">
          <a 
            v-for="option in options" 
            :key="option.label" 
            href="#" 
            @click.prevent="setSelectedView(option.value)" 
            :class="{ 'router-link-exact-active': selectedView === option.value }"
          >
            {{ option.label }}
          </a>
        </nav>
        <div class="info-content">
          <component 
            :is="selectedView" 
            :selectedCard="selectedCard"
            @update:selectedCard="updateSelectedCard"
            @update:cardClass="handleCardClassUpdate"
            :cards="cards"
            :arrows="arrows"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { ref, markRaw, defineComponent, watch, PropType } from 'vue';
import ACardEditVue from './ACardEdit.vue';
import AGeneralInfoVue from './AGeneralInfo.vue';
import ASliderVue from './ASlider.vue';

interface Card {
  t: string;
  x: number;
  y: number;
}

export default defineComponent({
  name: 'ADescriptionHolder',
  components: {
    ACardEditVue,
    AGeneralInfoVue,
    ASliderVue,
  },
  props: {
    openCardInfo: Boolean,
    selectedCard: Object as PropType<{ [key: string]: Card } | null>,
    cards: Object as PropType<{ [key: string]: Card } | null>,
    arrows: Object as PropType<{ id: string; style: Record<string, any>; from: string; to: string }[]>,
  },
  emits: ['update:openCardInfo', 'update:selectedCard', 'update:isInfoVisible'],
  data() {
    return {
      isInfoVisible: ref(false),
      selectedView: ref(markRaw(AGeneralInfoVue)),
      options: [
        { label: 'General', value: markRaw(AGeneralInfoVue) },
        { label: 'Card', value: markRaw(ACardEditVue) },
        { label: 'Slider', value: markRaw(ASliderVue) },
      ] as const,
    };
  },
  methods: {
    handleToggleInfo() {
      this.isInfoVisible = !this.isInfoVisible;
      this.$emit('update:isInfoVisible', this.isInfoVisible);
      this.$emit('update:openCardInfo', this.isInfoVisible);
      if (this.isInfoVisible) this.resetSelectedView();
    },
    resetSelectedView() {
      this.selectedView = this.options[0].value;
    },
    setSelectedView(view: typeof this.options[number]['value']) {
      this.selectedView = view;
    },
    handleCardClassUpdate(cardClass: string) {
      console.log(`Received card class: ${cardClass}`);
      if (cardClass === 'card__header') {
        console.log('The card is selected.');
      } else if (cardClass === 'card__empty') {
        console.log('No card is selected.');
      } else {
        console.log('Unknown card class:', cardClass);
      }
    },
  },
  watch: {
    selectedCard: {
      immediate: true,
      deep: true,
      handler(newCard) {
        if (!newCard || Object.keys(newCard).length === 0) {
          this.selectedView = this.options[0].value;
        }
      },
    },
    openCardInfo: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.isInfoVisible = true;
          this.setSelectedView(this.options[1].value);
        }
      },
    },
  },
  setup(props, { emit }) {
    const updateSelectedCard = (updatedCard: { [key: string]: Card }) => {
      emit('update:selectedCard', updatedCard);
    };
    return {
      updateSelectedCard,
    };
  },
});
</script>


<style lang="scss" scoped>
@use "@/assets/style/color" as c;

.info_btn {
  width: 72px;
  height: 72px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.infoicon {
  color: c.$black;
  font-size: 30px;
}

.info {
  background-color: c.$white;
  border: 5px solid c.$sub_4;
  z-index: 30;
  padding: 2rem 1rem;
  position: absolute;
  width: 20rem;
  height: calc(90vh - 15px);
  top: 10vh;
  right: 0;
  opacity: 0.9;
}

.info-nav {
  text-align: center;
  display: flex;
  a {
    display: inline-block;
    padding: 0 1rem;
    text-decoration: none;
    transition: all 0.3s;
    margin: 0 0.25rem;
    font-size: 1.2rem;
    color: c.$gray;
    border-bottom: 3px solid c.$gray; 
    &:hover {
      color: c.$sub_4_light;
      border-bottom: 3px solid c.$sub_4_light;
    }
    &.router-link-exact-active {
      color: c.$sub_4;
      border-bottom: 3px solid c.$sub_4;
      &:hover {
        background-color: transparent;
      }
    }
  }
}

.info-content {
  margin-top: 1rem;
}
</style>
