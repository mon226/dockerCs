<template>
  <div>
    <h2>Layer Control</h2>
    <div id="layer-control">
      <!-- ボタンのスタイルはクラスで切り替える -->
      <div class="business">
        <button
          :class="{ active: isbusiness, inactive: !isbusiness }"
          @click="toggleBusiness"
        >
          Business
        </button>
        <p>{{ isbusiness? "表示中" : "非表示" }}</p>
      </div>
      <div class="process">
        <button
          :class="{ active: isprocess, inactive: !isprocess }"
          @click="toggleProcess"
        >
          Process
        </button>
        <p>{{ isprocess? "表示中" : "非表示" }}</p>
      </div>
      <div class="object">
        <button
          :class="{ active: isobject, inactive: !isobject }"
          @click="toggleObject"
        >
          Object
        </button>
        <p>{{ isobject? "表示中" : "非表示" }}</p>
      </div>
      <div class="variable">
        <button
          :class="{ active: isvariable, inactive: !isvariable }"
          @click="toggleVariable"
        >
          Variable
        </button>
        <p>{{ isvariable? "表示中" : "非表示" }}</p>
      </div>
      <div class="cost">
        <button
          :class="{ active: iscost, inactive: !iscost }"
          @click="toggleCost"
        >
          Cost
        </button>
        <p>{{ iscost? "表示中" : "非表示" }}</p>
      </div>
      <button 
        class="display"
        @click="emitLayerState">再表示</button>
    </div>
    <h2>Node Control</h2>
    <div id="node-control">
      <div class="business">
        <button
          class="display"
          @click="toggleBusinessNode"
          >Business　再構築</button>
      </div>
      <div class="process">
        <button
          class="display"
          @click="toggleProcessNode"
          >Process　再構築</button>
      </div>
      <div class="object">
        <button
          class="display"
          @click="toggleObjectNode"
          >Object　再構築</button>
      </div>
      <div class="variable">
        <button
          class="display"
          @click="toggleVariableNode"
          >Variable　再構築</button>
      </div>
      <div class="cost">
        <button
          class="display"
          @click="toggleCostNode"
          >Cost　再構築</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CLayerControl",
  data() {
    return {
      isbusiness: true,
      isprocess: true,
      isobject: true,
      isvariable: true,
      iscost: true,
    };
  },
  methods: {
    toggleBusiness() {
      this.isbusiness = !this.isbusiness;
    },
    toggleProcess() {
      this.isprocess = !this.isprocess;
    },
    toggleObject() {
      this.isobject = !this.isobject;
    },
    toggleVariable() {
      this.isvariable = !this.isvariable;
    },
    toggleCost() {
      this.iscost = !this.iscost;
    },
    emitLayerState() {
      this.$emit("update:layers", {
        business: this.isbusiness,
        process: this.isprocess,
        object: this.isobject,
        variable: this.isvariable,
        cost: this.iscost,
      });
    },
    toggleBusinessNode() {
      this.$emit("rebuild:business");
    },
    toggleProcessNode() {
      this.$emit("rebuild:process");
    },
    toggleObjectNode() {
      this.$emit("rebuild:object");
    },
    toggleVariableNode() {
      this.$emit("rebuild:variable");
    },
    toggleCostNode() {
      this.$emit("rebuild:cost");
    },
  },
  emits: [
    "update:layers",
    "rebuild:business",
    "rebuild:process",
    "rebuild:object",
    "rebuild:variable",
    "rebuild:cost",
  ],

};
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
#layer-control {
  display: flex;
  column-gap: 20px;
}
button {
  background-color: c.$blue-light;
  &:hover {
    background-color: c.$maroon
  }
}
button.active {
  padding: 10px 20px;
  width: 100px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  outline: none;
  background-color: c.$blue-light;
  color: c.$white;
  border-radius: 4px;
}
button.inactive {
  padding: 10px 20px;
  width: 100px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  outline: none;
  background-color: c.$gray;
  color: c.$black;
  border-radius: 4px;
}
.display {
  padding: 10px 20px;
  width: 100px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  outline: none;
  color: c.$white;
  border-radius: 4px;
}
.business, .object, .variable, .cost, .process {
  display: flex;
  flex-direction: column;
  align-items: center;
}
h2 {
  color: c.$black;
  padding-left: 10px;
}
#node-control {
  display: flex;
  column-gap: 20px;
}
</style>
