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

  const getNodesByLevel = (level: number): Topic[] => {
    if (!rootNode) return [];
    return BFSTravel(rootNode).filter((node) => node.instance && (node.instance.level === level));
  }

  const getLevelMaxTextLength = (level: number): number=> {
    if (!rootNode) return 0;
    const nodes = BFSTravelArr.value;
    const lastNode = nodes[nodes.length - 1];
    const maxLevel = lastNode.instance && lastNode.instance.level;
    const newArr = new Array(maxLevel).fill(0);
    const levelNodesArr = newArr.map((_,index)=>getNodesByLevel(index + 1));
    const levelMaxTextLength = levelNodesArr.map((nodes)=>nodes.reduce((max, node)=>  Math.max(max,node.instance? node.instance.text.length: 0), 0));
    return levelMaxTextLength[level];
  }

  const updateNodeInstance = (id: string, instance: TreeNodeType, subTreeInstance: SubTreeType) => {
    const treeNode = DFSTravelArr.value.find((node) => {
      return id === node.id;
    });
    if (!treeNode) return;
    treeNode.instance = instance;
    // treeNode.subTreeInstance = JSON.parse(JSON.stringify(subTreeInstance));
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
    patchNode,
    getLevelMaxTextLength,
  };
});

export default useMindTreeStore;
