import { defineStore } from "pinia";
import xmindData from "../../data.json";
import { computed, reactive, ref, watchEffect } from "vue";
import type { Topic, TreeNodeType } from "./type";
import type { SubTreeType } from "../components/MindMapSubTree";
const x = window.innerWidth / 4;
const y = window.innerHeight / 2 - 100;

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

let initialTreeData = ref(xmindData.rootTopic);

export const updateInitialTreeData = (newTreeData: any) => {
  initialTreeData.value = reactive(newTreeData);
};

export const useMindTreeStore = defineStore("mindTree", () => {
  const rootNode = reactive({
    ...initialTreeData.value,
    x,
    y,
  });

  const DFSTravelArr = computed(() => {
    const arr: Topic[] = [];
    return DFSTravel(rootNode, arr);
  });

  const BFSTravelArr = computed(() => {
    if (!rootNode) return [];
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
    currentNode: SubTreeType,
    offsetY: number
  ) => {
    const currentTreeNode = currentNode?.getRootNodeInstance();
    const currentLevel = currentTreeNode.level;
    const siblingNodes = BFSTravelArr.value.filter((node)=>{
      return node.instance?.level === currentLevel;
    });
    const levelIndex = siblingNodes.findIndex((node: Topic)=>{
      return node.id === currentNode.rootNode.id
    });
    if(levelIndex !== -1) {
      // siblingNodes.forEach((node, index)=>{
      //   if(index >= levelIndex) {
      //     const subTree = node.instance?.$parent;
      //     if(subTree )
      //       (subTree as SubTreeType).updateSubTreeOffset(offsetY);
      //   }
      // })
    }

  };

  const twoNodes = ref<any>([]);

  const patchNode = (newNode: any) => {
    if (twoNodes.value.length === 2) twoNodes.value.shift();
    twoNodes.value.push(newNode);
  };

  return {
    rootNode,
    twoNodes,
    DFSTravelArr,
    BFSTravelArr,
    updateNodeInstance,
    updateBrotherPosition,
    patchNode,
  };
});

export default useMindTreeStore;
