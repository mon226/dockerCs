<template>
  <div id="view">
    <p>Test</p>
  </div>
  <AColortSetting />
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import AColortSetting from '../components/atoms/AColorSetting.vue';

export default defineComponent({
  name: 'Test',
  components: {
    AColortSetting
  },
  setup() {
    return {
    };
  }
});
</script>