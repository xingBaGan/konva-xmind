<script setup lang="ts">
import xmindData from '../data.json';
import { inject, ref, onMounted } from 'vue';
import { configSymbol, colorsSymbol } from '../context/styleContext.js'
const x = window.innerWidth/2;
const y = window.innerHeight/2;
import MindMapNode from './MindMapNode';

const config = inject(configSymbol);
const colorArr: string[] = inject(colorsSymbol) || [];
const children = xmindData.rootTopic.children.attached;
const rootRef = ref(null);



onMounted(() => {
  if(!rootRef.value) return;
  const nodePos = rootRef.value.getBorderCoordinate();
  console.log('pos', nodePos)
})

</script>

<template>
  <v-stage :config="config">
    <v-layer>
      <MindMapNode :text="xmindData.rootTopic.title" :x="x" :y="y" ref="rootRef" />
    </v-layer>
    <v-layer>
      <MindMapNode v-for="(child, index) in children" :text="child.title" :x="x + 200" :y="y + index * 60"
        :key="child.title" :node-color="colorArr && colorArr[index]" />
    </v-layer>
  </v-stage>
</template>