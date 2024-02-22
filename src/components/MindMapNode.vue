<template>
  <div v-if="rootPos && positionList.length">
    <v-line
      v-for="(points, index) in positionList"
      :key="index"
      :ref="setLineRef"
      :config="lineConfig(points, index)"
    ></v-line>
  </div>
</template>

<script setup lang="ts">

import { defineProps, onMounted, reactive, ref, toRefs, watchEffect } from 'vue';
import type { RootNode, ChildPosition } from './MindMapSubTree';

const props = defineProps({
  rootPos: {
    type: Object,
    required: true,
  },
  positionList: {
    type: Array,
    default: () => [],
  },
  lineColor: String,
  lineColorArr: Array,
});

const { rootPos, positionList, lineColor, lineColorArr } = toRefs(props);


const lineRefs = ref([]);

function setLineRef(el) {
  if (el) {
    lineRefs.value.push(el);
  }
}

onMounted(() => {
  lineRefs.value.forEach((lineRef, index) => {
    const lineInstance = lineRef.getNode();
    lineInstance.on('mouseover', () => {
      emit('mouseOverLines', lineInstance);
    });
    lineInstance.on('mouseout', () => {
      emit('mouseOutLines', lineInstance);
    });
  });
});

function lineConfig(points, index) {
  console.log(points);
  const selectedLineColor = lineColor.value || (lineColorArr.value && lineColorArr.value[index]);
  const newStartPoints = {
    x: rootPos.value.x + 10,
    y: rootPos.value.y,
  };

  const newEndPoints = {
    x: points.x - 10,
    y: points.y,
  };

  const ratio = -(newEndPoints.y - newStartPoints.y) / (newEndPoints.x - newStartPoints.x);
  let newCurPoint = {
    y: (newEndPoints.y - newStartPoints.y) / 2 + newStartPoints.y,
    x: (newEndPoints.x - newStartPoints.x) / 2 + newStartPoints.x,
  };

  const detX = 4;
  const detY = 5;

  if (ratio > 0) {
    newCurPoint.x -= detX;
    newCurPoint.y -= detY;
  } else if (ratio < 0) {
    newCurPoint.x -= detX;
    newCurPoint.y += detY;
  }

  return reactive({
    points: [
      rootPos.value.x,
      rootPos.value.y,
      newStartPoints.x,
      newStartPoints.y,
      newCurPoint.x,
      newCurPoint.y,
      newEndPoints.x,
      newEndPoints.y,
      points.x,
      points.y,
    ],
    stroke: selectedLineColor,
    strokeWidth: 2,
    tension: 0.2,
  });
}

function getBorderCoordinate  (type: NodePositionType): IPoint => {
      switch (type) {
        case NodePositionType.TOP_LEFT:
          return {
            x: props.x,
            y: props.y,
          };
        case NodePositionType.TOP_RIGHT:
          return {
            x: props.x + nodeWidth,
            y: props.y,
          };
        case NodePositionType.BOTTOM_LEFT:
          return {
            x: props.x,
            y: props.y + nodeHeight,
          };
        case NodePositionType.BOTTOM_RIGHT:
          return {
            x: props.x + nodeWidth,
            y: props.y + nodeHeight,
          };
        case NodePositionType.TOP:
          return {
            x: props.x + nodeWidth / 2,
            y: props.y,
          };
        case NodePositionType.LEFT:
          return {
            x: props.x,
            y: props.y + nodeHeight / 2,
          };
        case NodePositionType.RIGHT:
          return {
            x: props.x + nodeWidth,
            y: props.y + nodeHeight / 2,
          };
        case NodePositionType.BOTTOM:
          return {
            x: props.x + nodeWidth / 2,
            y: props.y + nodeHeight,
          };
        default:
          return {
            x: props.x + nodeWidth,
            y: props.y + nodeHeight,
          };
      }
};
</script>

<script lang="ts">
const minNodeWidth = 70;
export const minNodeHeight = 40;
export interface IPoint {
  x: number;
  y: number;
}

export enum NodePositionType {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  CENTER,
}
export default {
  name: 'MindMapLines',
  emits: ['mouseOverLines', 'mouseOutLines'],
  expose: ['getBorderCoordinate'],
  methods:{
    getBorderCoordinate: ()=>{}
  }
};
</script>