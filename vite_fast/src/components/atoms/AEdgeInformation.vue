<template>
  <table>
    <tbody>
      <tr>
        <td>方向</td>
        <td>{{ edge.edge.fromname }}</td>
        <td>
          <select v-model="selectedDirection">
            <option value="----">----</option>
            <option>→</option>
            <option>↔︎</option>
            <option>←</option>
          </select>
        </td>
        <td>{{ edge.edge.toname }}</td>
      </tr>
      <tr>
        <td>重み</td>
        <td>
          <select v-model="selectedWeight">
            <option value="----">----</option>
            <option>-3</option>
            <option>-1</option>
            <option>-1/3</option>
            <option>0</option>
            <option>+1/3</option>
            <option>+1</option>
            <option>+3</option>
          </select>
        </td>
        <td><button @click="deleteInfo">削除</button></td>
        <td><button @click="confirmWeight">確定</button></td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
  import { defineComponent, ref } from "vue";
  import { useNetworkDataStore } from "../../stores/networkData";

  export default defineComponent({
    name: 'AEdgeInformation',
    props: {
      edge: {
        type: Object,
        required: true,
      },
      editingEdgeKey: {
        type: String
      },
    },
    setup(props, { emit }) {
      const store = useNetworkDataStore();
      
      const selectedDirection = props.edge.info?.direction 
        ? ref(store.converter(props.edge.info.direction)) 
        : ref("----");
      
      const selectedWeight = props.edge.info?.weight 
        ? ref(props.edge.info.weight) 
        : ref("----");

      const confirmWeight = () => {
        if (selectedDirection.value === "----" || selectedWeight.value === "----") {
          return;
        }
        
        store.setEdgeInfo(props.edge.key, store.converter(selectedDirection.value), selectedWeight.value);
        emit('update:editingEdgeKey', '');
      };
      
      const deleteInfo = () => {
        store.deleteEdgeInfo(props.edge.key);
        emit('update:editingEdgeKey', '');
      };

      return {
        selectedDirection,
        selectedWeight,
        confirmWeight,
        deleteInfo,
      };
    }
  })
</script>

<style lang="scss">
@use "@/assets/style/color" as c;
table {
  padding: 0.5rem;
  z-index: 10000;
  font-size: 0.8rem;
  width: 250px;
  table-layout: fixed; 

  & td {
    width: 60px;
    height: 25px; 
    overflow: hidden;   
    white-space: nowrap;  
    text-overflow: ellipsis; 
  }

  & select {
    width: 50px;
  }

  & input {
    width: 50px;
  }

  & button {
    width: 50px;
    background-color: c.$sub_6;
  }
}
</style>