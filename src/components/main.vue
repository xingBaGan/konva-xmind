<script setup lang="ts">
import { inject, ref, onMounted, watchEffect } from 'vue';
import { configSymbol, lineColorsSymbol } from '../context/styleContext'
import MindMapNode, { NodePositionType, type IPoint } from './MindMapNode';
import MindMapTree, { type RootNode } from './MindMapSubTree.tsx';
import { useMindTreeStore } from '../store/mindTree'
const store = useMindTreeStore();
const config = inject(configSymbol);
const lineColorArr: string[] = inject(lineColorsSymbol);
const rootNode = store.rootNode;
const layer = ref(null);
const stage = ref(null);
const maxZoom = 5;
const minZoom = 0.3;
const stageScale = ref(0);

interface ZoomPoint {
  x: number;
  y: number;
}
/* Zoom the stage at the given position
  Parameters:
   stage: the stage to be zoomed.
   zoomPoint: the (x, y) for centre of zoom.
   zoomBefore: the zoom factor at the start of the process.
   inc : the amount of zoom to apply.
   returns: zoom factor after zoom completed.
*/
function zoomStage(stage: any, zoomPoint: ZoomPoint, zoomBefore: number, inc: number): number {
  let zoomAfter = zoomBefore + inc;
  // remember the scale before new zoom is applied - we are scaling
  // same in x & y so either will work
  return zoomMoveStage(stage, zoomPoint, zoomAfter);
}


function zoomMoveStage(stage: any, zoomPoint: ZoomPoint, zoomAfter: number): number {
  let oldScale = stage.scaleX();
  // compute the distance to the zoom point before applying zoom
  var mousePointTo = {
    x: (zoomPoint.x - stage.x()) / oldScale,
    y: (zoomPoint.y - stage.y()) / oldScale
  };

  // compute new scale
  if (zoomAfter > maxZoom || zoomAfter < minZoom) return;
  // apply new zoom to stage
  stage.scale({ x: zoomAfter, y: zoomAfter });

  // Important - move the stage so that the zoomed point remains
  // visually in place
  var newPos = {
    x: zoomPoint.x - mousePointTo.x * zoomAfter,
    y: zoomPoint.y - mousePointTo.y * zoomAfter
  };


  // Apply position to stage
  stage.position(newPos);

  // return the new zoom factor.
  return zoomAfter;
}
onMounted(() => {
  if (!stage.value) return;
  const stageInstance = stage.value.getStage();
  const inc = 0.2;
  var oldScale = stageInstance.scaleX();
  stageScale.value = oldScale;
  stageInstance.on('wheel', (e: WheelEvent) => {
    // stop default scrolling
    e.evt.preventDefault();
    // how to scale? Zoom in? Or zoom out?
    let direction = e.evt.deltaY > 0 ? 1 : -1;
    var pointer = stageInstance.getPointerPosition();
    var oldScale = stageInstance.scaleX();

    const value = zoomStage(stageInstance, pointer, oldScale, direction * inc)?.toFixed(1);

    if (value) {
      stageScale.value = value
    }
  });
});

</script>

<template>
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