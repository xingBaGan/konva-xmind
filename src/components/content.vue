<script setup lang="ts">
import { inject, ref, onMounted, reactive, computed } from 'vue';
import { configSymbol, lineColorsSymbol } from '../context/styleContext'
import MindMapNode, { NodePositionType, type IPoint } from './MindMapNode';
import MindMapTree, { type RootNode } from './MindMapSubTree.tsx';
import { useMindTreeStore } from '../store/mindTree'
const store = useMindTreeStore();
const config = inject(configSymbol);
const lineColorArr: string[] = inject(lineColorsSymbol);
const rootNode = store.rootNode;
</script>

<template>
  <v-stage :config="config">
    <v-layer>
      <MindMapTree :rootNode="(rootNode as unknown as RootNode)" sequence="1" :lineColorArr="lineColorArr" :id="rootNode.id"/>
    </v-layer>
  </v-stage>
</template>