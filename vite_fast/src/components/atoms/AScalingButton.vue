<template>
  <form class="form">
    <ul class="select">
      <li>
        <input
          class="select__close"
          type="radio"
          name="scaling"
          id="scaling-close"
          value=""
        />
        <span class="select__label select__label-placeholder">{{ selectedLabel }}</span>
      </li>
      <li class="select__items">
        <input
          class="select__expand"
          type="radio"
          name="scaling"
          id="scaling-opener"
        />
        <label class="select__closeLabel" for="scaling-close"></label>
        <ul class="select__options">
          <li
            class="select__option"
            v-for="option in options"
            :key="option.id"
          >
            <input
              class="select__input"
              type="radio"
              name="scaling"
              :id="option.id"
              @change="updateSelectedLabel(option.label)"
            />
            <label class="select__label" :for="option.id">{{ option.label }}</label>
          </li>
        </ul>
        <label class="select__expandLabel" for="scaling-opener"></label>
      </li>
    </ul>
  </form>
</template>

<style lang="scss">
@use "@/assets/style/color" as c;

.select {
  width: 100px;
  color: c.$white;
  background-color: c.$gray;
  border-radius: 2px;
  box-shadow: 0 2px 0 c.$gray;
  position: relative;

  &__expand {
    width: 0;
    height: 30px;
    position: absolute;
    top: 0;
    right: 0;
    &::after {
      content: '\025c1';
      font-size: 10px;
      position: absolute;
      top: 50%;
      right: 0;
      transform: translate(-50%, -50%) rotate(90deg) scaleX(-1) scaleY(1.5);
      color: c.$white;
      pointer-events: none;
      z-index: 2;
      transition: all 250ms cubic-bezier(.4, .25, .3, 1);
    }

    &:checked::after {
      transform: translate(-50%, -50%) rotate(90deg) scaleY(1.5);
    }
  }

  &__expandLabel {
    display: block;
    width: 100%;
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
  }

  &__close {
    display: none;
  }

  &__closeLabel {
    width: 100px;
    height: 30px;
    position: fixed;
    top: 0;
    left: 0;
    display: none;
  }

  &__items {
    border-radius: 2px;
    padding-top: 30px;
  }

  &__input {
    display: none;
  }

  &__label {
    transition: all 250ms cubic-bezier(.4, .25, .3, 1);
    display: block;
    height: 0;
    line-height: 30px;
    overflow: hidden;
    padding-left: 20px;

    &-placeholder {
      height: 30px;
      position: absolute;
    }
  }

  &__expand:checked + .select__closeLabel {
    display: block;
    + .select__options {
      .select__label {
        height: 30px;
      }
      + .select__expandLabel {
        display: none;
      }
    }
  }
  &__options {
    width: 100px;
    background-color: c.$gray;
    position: absolute;
    border-radius: 2px;
  }
  .select__option:hover .select__label {
    background-color: c.$maroon !important;
  }
}

li {
  list-style-type: none;
}
.form {
  z-index: 100;
}
</style>

<script lang="ts">
import { defineComponent, computed } from 'vue';
export default defineComponent({
  props: {
    selectedLabel: {
      type: String,
      default: '100%'
    }
  },
  data() {
    return {
      options: [
        { id: 'scaling-10', label: '10%' },
        { id: 'scaling-25', label: '25%' },
        { id: 'scaling-50', label: '50%' },
        { id: 'scaling-75', label: '75%' },
        { id: 'scaling-100', label: '100%' },
        { id: 'scaling-125', label: '125%' },
        { id: 'scaling-150', label: '150%' },
        { id: 'scaling-175', label: '175%' },
        { id: 'scaling-200', label: '200%' },
        { id: 'scaling-250', label: '250%' },
        { id: 'scaling-300', label: '300%' },
      ],
    };
  },
  computed: {
    currentLabel: {
      get(): string {
        return this.selectedLabel;
      },
      set(value: string) {
        this.$emit('update:selectedLabel', value);
      }
    }
  },
  methods: {
    updateSelectedLabel(label: string) {
      this.currentLabel = label;
    }
  }
});
</script>
