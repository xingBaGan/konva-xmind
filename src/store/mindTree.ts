import { defineStore } from "pinia";
import xmindData from "../../data.json";
import { computed, reactive, ref, watchEffect } from "vue";
import type { Topic, TreeNodeType } from "./type";
import type { SubTreeType } from '../components/MindMapSubTree'
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
  initialTreeData.value = reactive(newTreeData)
}

// watchEffect(
//   () => {
//     console.log('data', initialTreeData.value);
//   })

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
    id: string,
    index: number,
    newIncreaseY: number
  ) => {
    if (!BFSTravelArr.value.length) return;
    // if(id==='DSOdXQBMC4bQIJbnU2QAC') {
    //   debugger;
    // }
    const selfIndex = BFSTravelArr.value.findIndex((node) => {
      return id === node.id;
    });
    if (selfIndex === -1 || selfIndex === 0) return;
    const selfNode = BFSTravelArr.value[selfIndex];
    const selfInstance = selfNode?.instance;
    const selfSubTree = selfInstance?.$parent as SubTreeType;
    const selfSubTreeParent = selfSubTree?.$parent;
    let targetIndex = selfIndex + index;
    let targetNode;
    let hasNext = false;

    do {
      targetNode = BFSTravelArr.value[targetIndex];
      const targetInstance = targetNode?.instance;
      const  targetSubTree = targetInstance?.$parent as SubTreeType;
      const  targetSubTreeParent = targetSubTree?.$parent;
      if(selfSubTreeParent !== targetSubTreeParent) return;

      const parent = targetInstance?.$parent as SubTreeType;
      if (parent && parent.updateSubTreeOffset) {
        parent.updateSubTreeOffset(newIncreaseY);
      }
      targetIndex++;
      const nextNode = BFSTravelArr.value[targetIndex];
      const nextParent = nextNode?.instance?.$parent as SubTreeType;
      hasNext = parent.$parent === nextParent.$parent;

    } while (hasNext);
  };

  const twoNodes = reactive<any>([]);

  const patchNode = (newNode: any)=>{
    if(twoNodes.length === 2) twoNodes.shift()
    twoNodes.push(newNode)
  }

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
