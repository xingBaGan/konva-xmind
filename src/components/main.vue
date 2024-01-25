<script setup lang="ts">
import { inject, ref, onMounted, watch, computed, effect, watchEffect } from 'vue';
import { configSymbol, lineColorsSymbol } from '../context/styleContext'
import MindMapTree, { type RootNode } from './MindMapSubTree';
import { type Rect } from './MindMapNode';
import { useMindTreeStore, updateInitialTreeData } from '../store/mindTree';
import type { SubTreeType } from "../store/type";
import Konva from 'konva';
const props = defineProps(['data']);
if (props.data) {
  updateInitialTreeData(props.data.rootTopic);
}
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

function addGrid(stage: any) {
  const layer = new Konva.Layer();
  stage.add(layer);
  const gap = 10;
  // 创建网格线
  for (let i = 0; i < stage.width(); i += gap) {
    const horizontalLine = new Konva.Line({
      points: [0, i, stage.width(), i],
      stroke: '#ddd',
      strokeWidth: 1,
    });

    const verticalLine = new Konva.Line({
      points: [i, 0, i, stage.height()],
      stroke: '#ddd',
      strokeWidth: 1,
    });

    layer.add(horizontalLine, verticalLine);
  }

  const pointHeight = 10;
  for (let i = 0; i < stage.width(); i += gap * 10) {
    const horizontalLine = new Konva.Line({
      points: [0, i, -pointHeight, i],
      stroke: '#000',
      strokeWidth: 1,
    });

    const verticalLine = new Konva.Line({
      points: [i, 0, i, -pointHeight],
      stroke: '#000',
      strokeWidth: 1,
    });

    const TextY = new Konva.Text({
      text: String(i),
      x: -pointHeight - 20,
      y: i - 10,
    })

    const TextX = new Konva.Text({
      text: String(i),
      x: i,
      y: -pointHeight - 10,
    })

    layer.add(horizontalLine);
    layer.add(verticalLine);
    layer.add(TextY);
    layer.add(TextX);
  }

  layer.add();
}

function getOffsetYWhenInRange(siblingNode: SubTreeType, range: Rect ): number {
  const currentRect = siblingNode.subTreeRect;
  let offsetY = 0;
  if( currentRect.y < range.y + range.height ) {
    offsetY = range.y + range.height - currentRect.y;
  }
  return offsetY;
}

function adjustSiblingChild(currentNode: SubTreeType, siblingNode: SubTreeType) {
  const offsetY =  getOffsetYWhenInRange(siblingNode, currentNode.subTreeRect);
  if(offsetY) {
    store.updateBrotherPosition(siblingNode, offsetY)
  }
}

onMounted(() => {
  if (!stage.value) return;
  const stageInstance = stage.value.getStage();
  const inc = 0.2;
  var oldScale = stageInstance.scaleX();
  stageScale.value = oldScale;
  if (!import.meta.env.PROD) {
    addGrid(stageInstance);
  }
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


  const parents: SubTreeType[] = store.rootNode.children.attached.map(item => item.instance.$parent);
  setTimeout(() => {
    let currentSubTree: SubTreeType;
    for(let node of parents) {
      if (currentSubTree && node.subTreeRect) {
        adjustSiblingChild(currentSubTree, node);
        break;
      }

      if( node.subTreeRect) {
        currentSubTree = node
      }
    }

  }, 0)
});
const isDev = !import.meta.env.PROD;
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
})

</script>

<template>
  <v-stage :config="config" ref="stage">
    <v-layer ref="layer">
      <MindMapTree :rootNode="(rootNode as unknown as RootNode)" sequence="1" :lineColorArr="lineColorArr"
        :id="rootNode.id" />
    </v-layer>
    <v-layer v-if="isDev">
      <v-line :config="lineConfig"></v-line>
      <v-text :config="textConfig"></v-text>
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