import { defineStore } from 'pinia'
import xmindData from '../data.json';
import { computed, reactive } from 'vue';
import type { Topic } from './type'
const x = 100;
const y = window.innerHeight / 2 + 100;


const BFSTravel = (node: Topic, arr: Topic[]) => {
  // 根节点入结果
  // arr.push(node);
  const stack = [];
  if (!(node.children && node.children.attached.length)) return arr;
  for (const child of node.children.attached) {
    arr.push(node);
    stack.push(child);
  }
  while (stack.length) {
    const child = stack.shift();
    if (child)
      BFSTravel(child, arr);
  }
  return arr;
}


const DFSTravel = (node: Topic, arr: Topic[]) => {
  arr.push(node);
  if (!(node.children && node.children.attached.length)) return arr;
  for (const child of node.children.attached) {
    const newArr = DFSTravel(child, arr);
    arr = newArr ? newArr : arr;
  }
  return arr;
}

export const useMindTreeStore = defineStore('mindTree', () => {
  const rootNode = reactive({
    ...xmindData.rootTopic,
    x,
    y,
  });

  const DFSTravelArr = computed(() => {
    const arr: Topic[] = [];
    return DFSTravel(rootNode, arr);
  })

  const BFSTravelArr = computed(() => {
    const arr: Topic[] = [];
    return BFSTravel(rootNode, arr);
  })

  return {
    rootNode,
    DFSTravelArr,
    BFSTravelArr,
  }
})

export default useMindTreeStore;

