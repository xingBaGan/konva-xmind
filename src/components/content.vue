<script setup lang="ts">
import xmindData from '../data.json';
import { inject, ref, onMounted, reactive, computed } from 'vue';
import { configSymbol, lineColorsSymbol } from '../context/styleContext'
import MindMapNode, { NodePositionType, type IPoint } from './MindMapNode';
import MindMapTree, { type RootNode } from './MindMapSubTree.tsx'
const config = inject(configSymbol);
const lineColorArr: string[] = inject(lineColorsSymbol);
const x = 100;
const y = window.innerHeight / 2 + 100;
const rootNode = reactive({
  ...xmindData.rootTopic,
  x,
  y,
});

</script>

<template>
  <v-stage :config="config">
    <v-layer>
      <MindMapTree :rootNode="(rootNode as RootNode)" sequence="1" :lineColorArr="lineColorArr"/>
    </v-layer>
  </v-stage>
</template>