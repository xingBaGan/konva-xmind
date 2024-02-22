
<template>
  <v-layer v-if="isDev">
    <v-line :config="lineConfig"></v-line>
    <v-text :config="textConfig"></v-text>
  </v-layer>
</template>

<script setup lang="ts">
import { useMindTreeStore, updateInitialTreeData } from '../store/mindTree';
import { isDev } from '../constants/index';
const props = defineProps(['data']);
if (props.data) {
  updateInitialTreeData(props.data.rootTopic);
}
const store = useMindTreeStore();
const rootNode = store.rootNode;
const lineConfig = computed(() => {
  if (store.twoNodes.length === 2)
    return ({
      points: [
        store.twoNodes[0].x,
        store.twoNodes[0].y,
        store.twoNodes[1].x,
        store.twoNodes[1].y,
      ],
      stroke: 'red',
      strokeWidth: 2,
    })
})

const textConfig = computed(() => {
  if (store.twoNodes.length === 2) {
    const distance = store.twoNodes[1].y - store.twoNodes[0].y;
    return ({
      x: store.twoNodes[0].x,
      y: store.twoNodes[0].y,
      fill: 'black',
      text: distance,
    })
  }
});
</script>