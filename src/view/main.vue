<script setup lang="ts">
import { inject, ref, onMounted, watch, computed, effect, watchEffect, type Ref } from 'vue';
import { configSymbol, lineColorsSymbol } from '../context/styleContext'
import MindMapTree, { type RootNode } from '../components/MindMapSubTree';
import { useMindTreeStore } from '../store/mindTree';
import { showChildrenSymbol } from '../context/global'
import { addGrid } from '../utils/debug';
import { useZoomStage } from '../hooks/zoom';
import { isDev } from '../constants/index';
const config = inject(configSymbol);
const lineColorArr: string[] = inject(lineColorsSymbol);
const store = useMindTreeStore();
const rootNode = store.rootNode;
const layer = ref();
const stage = ref();
const {
  stageScale,
  addZoom,
} = useZoomStage();

function initialComponent() {
  if (!stage.value) return;
  const stageInstance = stage.value.getStage();
  var oldScale = stageInstance.scaleX();
  stageScale.value = oldScale;
  if (isDev) {
    addGrid(stageInstance);
    addZoom(stageInstance);
  }
}

onMounted(() => {
  initialComponent()
});


const showChild = inject<Ref<Boolean>>(showChildrenSymbol)!;
const toggleShowChildrenVisible = () => {
  showChild.value = !showChild.value;
}
</script>

<template>
  <button @click="toggleShowChildrenVisible">toggle show children rects</button>
  <v-stage :config="config" ref="stage">
    <v-layer ref="layer">
      <MindMapTree :rootNode="(rootNode as unknown as RootNode)" sequence="1" :lineColorArr="lineColorArr"
        :id="rootNode.id" />
    </v-layer>
  </v-stage>
</template>
<style >
.scale-container {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
}
</style>