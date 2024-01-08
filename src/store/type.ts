import type { ComponentPublicInstance } from 'vue';
import type { exposeAttribute } from '../components/MindMapNode.tsx'


export type TreeNodeType = ComponentPublicInstance<{}, exposeAttribute>;
export interface Topic {
  id: string;
  title: string;
  titleUnedited: boolean;
  boundaries: any[];
  summaries: any[];
  children?: {
    attached: Topic[];
  };
  instance?: TreeNodeType;
}

export interface RootTopic extends Topic {
  structureClass: string;
}

export interface FileContent {
  id: string;
  class: string;
  title: string;
  rootTopic: RootTopic;
  extensions: any[];
}