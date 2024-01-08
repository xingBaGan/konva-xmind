import { defineStore } from "pinia";
import xmindData from "../../data.json";
import { type ComponentPublicInstance, computed, reactive } from "vue";
import type { Topic, TreeNodeType } from "./type";
import type { SubTreeType } from '../components/MindMapSubTree'
const x = 100;
const y = window.innerHeight / 2 + 100;

const BFSTravel = (node: Topic): Topic[] => {
  const queue = [];
  const arrList = [];
  queue.push(node);

  while (queue.length) {
    let currNode: Topic = queue.shift()!;
    arrList.push(currNode);
    const children = currNode!.children?.attached;
    if (children) {
      children.forEach((child) => {
        queue.push(child);
      });
    }
  }

  return arrList;
};

const DFSTravel = (node: Topic, arr: Topic[]) => {
  arr.push(node);
  if (!(node.children && node.children.attached.length)) return arr;
  for (const child of node.children.attached) {
    DFSTravel(child, arr);
  }
  return arr;
};

export const useMindTreeStore = defineStore("mindTree", () => {
  const rootNode = reactive({
    ...xmindData.rootTopic,
    x,
    y,
  });

  const DFSTravelArr = computed(() => {
    const arr: Topic[] = [];
    return DFSTravel(rootNode, arr);
  });

  const BFSTravelArr = computed(() => {
    if(!rootNode) return [];
    return BFSTravel(rootNode);
  });

  const updateNodeInstance = (id: string, instance: TreeNodeType) => {
    const treeNode = DFSTravelArr.value.find((node) => {
      return id === node.id;
    });
    if (!treeNode) return;
    treeNode.instance = instance;
  };

  const updateBrotherPosition = (
    id: string,
    index: number,
    newIncreaseY: number
  ) => {
    if (!BFSTravelArr.value.length) return;
    const selfIndex = BFSTravelArr.value.findIndex((node) => {
      return id === node.id;
    });
    if (selfIndex === -1 || selfIndex === 0) return;
    const targetIndex = selfIndex + index;
    const targetNode = BFSTravelArr.value[targetIndex];
    const targetInstance = targetNode?.instance;
    const parent = targetInstance?.$parent as SubTreeType;
    console.log('target', targetInstance?.$parent, parent.$props, newIncreaseY);
    if (parent && parent.updateSubTreeOffset) {
      parent.updateSubTreeOffset(newIncreaseY);
      // parent.$props.subTreeOffset = newIncreaseY;
    }
  };

  return {
    rootNode,
    DFSTravelArr,
    BFSTravelArr,
    updateNodeInstance,
    updateBrotherPosition,
  };
});

export default useMindTreeStore;
