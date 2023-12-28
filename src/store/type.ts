export interface Topic {
  id: string;
  title: string;
  titleUnedited: boolean;
  boundaries: any[];
  summaries: any[];
  children?: {
    attached: Topic[];
  };
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