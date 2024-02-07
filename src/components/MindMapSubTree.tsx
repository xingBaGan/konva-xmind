import {
  defineComponent,
  computed,
  reactive,
  watchEffect,
  ref,
  watch,
  type ComponentPublicInstance,
  type Ref,
  nextTick,
  getCurrentInstance,
  inject,
} from "vue";
import MindMapNode, {
  NodePositionType,
  type IPoint,
  type Rect,
  minNodeHeight,
} from "./MindMapNode";
import { useMindTreeStore } from "../store/mindTree";
import MindMapLines from "./MindMapLines";
import type { TreeNodeType } from "../store/type";
import { adjustSiblingChild } from '../utils/index'
import { showChildrenSymbol } from '../context/global'
type MindMapNode = {
  title: string;
};

type SubTreeRectPayload = {
  childRect: Rect;
  title: string;
};
export type RootNode = {
  children: {
    attached: RootNode[];
  };
  title: string;
  x: number;
  y: number;
  rootPos: IPoint;
  childrenPos?: IPoint[];
  boundaries?: number[];
  childrenRect?: number[];
  id: string;
};
type MindMapTree = {
  rootNode: RootNode;
  sequence: string;
  lineColor?: string;
  lineColorArr?: string[];
  onJointLine?: (position: IPoint) => void;
  id: string;
  rootPos?: {
    x: number;
    y: number;
  };
};

export interface exposeAttribute {
  updateSubTreeOffset: (offsetY: number) => void;
  getRootNodeInstance: () => TreeNodeType;
  childrenRectArea: Rect;
  childrenSubtreeRectArea: Rect;
  childrenSubTrees: SubTreeType[];
}

export type SubTreeType = ComponentPublicInstance<MindMapTree, exposeAttribute>;

export type ChildPosition = {
  id?: string;
  x: number;
  y: number;
};

const props = {
  rootNode: {
    type: Object,
    required: true,
  },
  sequence: {
    type: String,
  },
  lineColor: {
    type: String,
  },
  lineColorArr: {
    type: Array,
  },
  id: {
    type: String,
  },
};

const largeChildrenSize = 5;

function getMergedTwoRect(rect1: Rect, rect2: Rect): Rect {
  const x1 = Math.min(rect1.x, rect2.x);
  const y1 = Math.min(rect1.y, rect2.y);
  const x2 = Math.max(rect1.x + rect1.width, rect2.x + rect2.width);
  const y2 = Math.max(rect1.y + rect1.height, rect2.y + rect2.height);
  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
  };
}

const MindMapTree = defineComponent<MindMapTree>(
  (props, { emit, expose }) => {
    const treeGap = 10;
    const store = useMindTreeStore();
    const node = reactive(props.rootNode);
    const level = computed(() => props.sequence.split("-").length);
    const offsetY = computed(() => Math.max(70 - level.value * 8, 45)).value;
    const offsetX = 200;
    if (!props.rootNode.childrenPos) {
      props.rootNode.childrenPos = reactive([]);
    }
    const positionList: ChildPosition[] = props.rootNode.childrenPos;
    const children: any[] = node.children?.attached || [];
    const childrenSubTrees: any[] = reactive([]);
    const rootInstance = ref();
    const halfLength = children.length / 2;
    const childrenSubtreeRectArea = ref();
    // childNodes rect
    const childrenRectArea = ref();
    const lastOffset = ref(0);
    const newOffsetY = computed(() => props.rootNode.y + lastOffset.value);
    const addChildPosToSubTree = (position: ChildPosition) => {
      if (positionList.length >= children.length) {
        const index = positionList.findIndex((pos) => {
          return pos.id === position.id;
        });
        const isDiff =
          positionList[index].x !== position.x ||
          positionList[index].y !== position.y;
        if (index !== -1 && isDiff) {
          positionList.splice(index, 1, position);
        }
      } else {
        positionList.push(position);
      }
    };
    const currentComponentInstance = getCurrentInstance();
    async function updateSubTreeOffset(offsetY: number) {
      const offset = offsetY;

      if (offset > lastOffset.value) {
        lastOffset.value = offset;
        props.rootNode.rootPos = reactive({
          ...props.rootNode.rootPos,
          y: newOffsetY.value,
        });
        emit(
          "updateRootNode",
          {
            rootNode: props.rootNode,
            instance: currentComponentInstance,
          }
        )
      }
    }

    watch([lastOffset], async () => {
      childrenSubtreeRectArea.value.y = childrenSubtreeRectArea.value.y + lastOffset.value
    })

    expose({
      updateSubTreeOffset,
      rootNode: props.rootNode,
      getRootNodeInstance: () => rootInstance.value,
      childrenRectArea,
      childrenSubTrees,
      childrenSubtreeRectArea,
    });

    if (!children.length) {
      return () => {
        return (
          <MindMapNode
            text={node.title}
            x={props.rootNode.x}
            y={newOffsetY.value}
            ref={(el) => {
              if (!el) return;
              store.updateNodeInstance(node.id, el as TreeNodeType);
              const position = (el as TreeNodeType)?.getBorderCoordinate(
                NodePositionType.LEFT
              );
              const childPos = reactive({
                ...position,
                id: props.id,
                title: props.rootNode.title,
              });
              emit("jointLine", childPos);
              rootInstance.value = el;
            }}
            sequence={props.sequence}
            id={props.id}
          />
        );
      };
    }

    const updateChildrenNode = async (payload: {
      rootNode: RootNode;
      instance: SubTreeType;
    }) => {
      const index = childrenSubTrees.findIndex((child) => {
        return child.value.rootNode.id === payload.rootNode.id
      });
      await nextTick();
      const oldRect = childrenRects.value[index];
      const node = payload.instance.exposed.getRootNodeInstance();
      const newRect = node.getRect();
      childrenRects.value.splice(index, 1, newRect);
      // console.log('data', node, newRect, oldRect);
    }

    watchEffect(() => {
      childrenSubTrees.forEach((subTreeRef) => {
        if(subTreeRef.value && subTreeRef.value.rootNode) {
          watch(() => subTreeRef.value && subTreeRef.value.rootNode && subTreeRef.value.rootNode.rootPos, (newValue) => {
            // 当子组件的 someProperty 发生变化时执行的逻辑
            if(subTreeRef.value && subTreeRef.value.rootNode) {
              console.log('subTreeRef',subTreeRef.value.rootNode.title ,subTreeRef.value.rootNode.rootPos);
              const rect = getChildrenNodeRect(childrenRects);
              console.log('rect',rect);
              
            }
            
          }, { deep: true });
        }
      });
    });


    const childrenNodes = computed(() => {
      const isOdd = halfLength % 1 === 0.5;
      return children.map((child, index) => {
        const nextRootNode = computed(() =>
          reactive({
            children: child.children,
            title: child.title,
            x: props.rootNode.x + offsetX,
            y:
              newOffsetY.value +
              (index - Math.floor(halfLength)) * offsetY +
              (!isOdd ? +(minNodeHeight / 2) : 0),
            id: child.id,
          })
        );

        const color = ref(
          props.lineColor || (props.lineColorArr && props.lineColorArr[index])
        );

        const instance = ref(null);

        // Collect the subTree node.
        watchEffect(() => {
          if (instance && instance.value && childrenSubTrees.length < children.length) {
            childrenSubTrees.push(instance);
          }
        });

        return (
          <MindMapTree
            ref={instance}
            rootNode={nextRootNode.value}
            onJointLine={addChildPosToSubTree}
            sequence={props.sequence + "-" + (index + 2)}
            lineColor={color.value}
            id={child.id}
            onUpdateSubtreeRect={(payload: SubTreeRectPayload) => {
              childrenSubtreeRectArea.value = payload.childRect;
              updateChildrenSubtreeRectArea();
            }}
            onUpdateRootNode={updateChildrenNode}
          ></MindMapTree>
        );
      });
    });

    const updateChildrenSubtreeRectArea = async () => {
      if (childrenRectArea.value && childrenSubtreeRectArea.value) {
        const rect = getMergedTwoRect(
          childrenSubtreeRectArea.value,
          childrenRectArea.value
        );
        childrenSubtreeRectArea.value = rect;
        await nextTick();
        emit("updateSubtreeRect", {
          childRect: rect,
          title: props.rootNode.title,
        });
      }
    }


    const childrenRects = computed(() => childrenSubTrees.map((subTreeInstance) => {
      return subTreeInstance.value?.getRootNodeInstance().getRect();
    }));

    const parentComponentInstance = currentComponentInstance?.parent;
    const getChildrenNodeRect = (childrenRects: Ref<any[]>) => {
      const maxWidth = childrenRects.value.reduce((max, rect: Rect) => {
        if (rect?.width > max) {
          max = rect.width;
        }
        return max;
      }, 0);

      const rects = childrenRects.value;
      let rect;
      const lastItemIndex = rects.length - 1;
      if (rects[lastItemIndex]) {
        const lastNode = rects[lastItemIndex];
        const lastNodePosY = lastNode.y;
        const firstNode = rects[0];
        const firstNodePosY = firstNode.y;
        const rangeY = lastNodePosY - firstNodePosY + lastNode.height;
        node.childrenRect = [
          firstNode.x,
          firstNode.y,
          Math.ceil(maxWidth),
          rangeY,
        ];

        rect = {
          x: node.childrenRect[0],
          y: node.childrenRect[1],
          width: node.childrenRect[2],
          height: node.childrenRect[3],
        };
      }
      return rect;
    }

    const updateSiblingPosition = async (parentComponentInstance: any) => {
      const childrenSubTree = parentComponentInstance.exposed.childrenSubTrees;
      if (childrenSubTree) {
        await nextTick();
        const index = childrenSubTree.findIndex((subTree: Ref<SubTreeType>) => {
          const id = subTree.value.rootNode.id;
          return id === node.id;
        });
        if (index !== -1) {
          const newArr = childrenSubTree.slice(index + 1);
          let currentNode = childrenSubTree[index];
          newArr.forEach(async (subTree: Ref<SubTreeType>) => {
            await nextTick();
            adjustSiblingChild(currentNode.value, subTree.value);
            currentNode = subTree;
          });
        }
      }
    }

    watch([childrenSubTrees, childrenRects], async () => {
      if (
        childrenSubTrees &&
        childrenSubTrees.length === node.children.attached.length &&
        parentComponentInstance
      ) {
        const rect = getChildrenNodeRect(childrenRects);
        if (!childrenRects.value[0]) return
        childrenSubtreeRectArea.value = rect;
        updateChildrenSubtreeRectArea();
        if (!childrenRectArea.value) {
          childrenRectArea.value = rect;
        }
        await updateSiblingPosition(parentComponentInstance);
        if (rect) {
          emit("updateSubtreeRect", {
            childRect: rect,
            title: props.rootNode.title,
          });
        }
      }
    });
    // const isDev = !import.meta.env.PROD;
    const isDev = true
    const subTreeDebugMessage = computed(
      () =>
        `${JSON.stringify(node.childrenRect)} \n ${JSON.stringify(
          childrenSubtreeRectArea.value
        )}`
    );
    const isLinesOver = ref(false);
    const showSubtreeRect = computed(() => isDev && isLinesOver.value);
    const subtreeRectConfig = computed(
      () =>
        childrenSubtreeRectArea.value && {
          points: [
            childrenSubtreeRectArea.value.x,
            childrenSubtreeRectArea.value.y,
            childrenSubtreeRectArea.value.x + childrenSubtreeRectArea.value.width,
            childrenSubtreeRectArea.value.y,
            childrenSubtreeRectArea.value.x + childrenSubtreeRectArea.value.width,
            childrenSubtreeRectArea.value.y + childrenSubtreeRectArea.value.height,
            childrenSubtreeRectArea.value.x,
            childrenSubtreeRectArea.value.y + childrenSubtreeRectArea.value.height,
            childrenSubtreeRectArea.value.x,
            childrenSubtreeRectArea.value.y,
          ],
          dash: [10, 5],
        }
    );
    const showChild = inject<Ref<Boolean>>(showChildrenSymbol)!;
    const childrenRectConfig = computed(
      () =>
        childrenRectArea.value && {
          points: [
            childrenRectArea.value.x,
            childrenRectArea.value.y,
            childrenRectArea.value.x + childrenRectArea.value.width,
            childrenRectArea.value.y,
            childrenRectArea.value.x + childrenRectArea.value.width,
            childrenRectArea.value.y + childrenRectArea.value.height,
            childrenRectArea.value.x,
            childrenRectArea.value.y + childrenRectArea.value.height,
            childrenRectArea.value.x,
            childrenRectArea.value.y,
          ],
          dash: [10, 5],
        }
    );

    // watch([childrenRects], () => {
    //   if (node.title === '测试1') {
    //     debugger
    //   }
    // })

    return () => (
      <>
        <MindMapNode
          text={node.title}
          x={props.rootNode.x}
          y={newOffsetY.value}
          sequence={props.sequence}
          ref={(el) => {
            if (!el) return;
            store.updateNodeInstance(node.id, el as TreeNodeType);
            const rootPos = (el as TreeNodeType)?.getBorderCoordinate(
              NodePositionType.RIGHT
            );
            if (
              !props.rootNode.rootPos ||
              (props.rootNode.rootPos && rootPos.y !== props.rootNode.rootPos.y)
            ) {
              props.rootNode.rootPos = reactive({
                ...rootPos,
              });
            }
            const position = (el as TreeNodeType)?.getBorderCoordinate(
              NodePositionType.LEFT
            );

            const childPos = reactive({
              ...position,
              id: props.rootNode.id,
              title: props.rootNode.title,
            });
            emit("jointLine", childPos);
            rootInstance.value = el;
          }}
          id={props.id}
        />
        {childrenNodes.value}
        {props.rootNode.rootPos && (
          <MindMapLines
            onMouseOverLines={(instance) => {
              isLinesOver.value = true;
            }}
            onMouseOutLines={(instance) => {
              isLinesOver.value = false;
            }}
            rootPos={props.rootNode.rootPos}
            positionList={positionList}
            lineColor={props.lineColor}
            lineColorArr={props.lineColorArr}
          />
        )}
        {isDev && (
          <v-text
            x={props.rootNode.x}
            y={newOffsetY.value + offsetY}
            text={subTreeDebugMessage.value}
          />
        )}
        {showSubtreeRect.value && subtreeRectConfig.value && (
          <>
            <v-line
              config={{
                ...subtreeRectConfig.value,
                stroke: "red",
              }}
            ></v-line>
            <v-text
              config={{
                x: childrenSubtreeRectArea.value.x,
                y: childrenSubtreeRectArea.value.y,
                text: `(${childrenSubtreeRectArea.value.x}, ${childrenSubtreeRectArea.value.y})\n width: ${childrenSubtreeRectArea.value.width} \n height ${childrenSubtreeRectArea.value.height}`,
                fill: "grey",
              }}
            ></v-text>
          </>
        )}
        {
          showChild.value && childrenRectConfig.value && (
            <>
              <v-line
                config={{
                  ...childrenRectConfig.value,
                  stroke: "blue",
                }}
              ></v-line>
            </>
          )}
      </>
    );
  },
  {
    props,
    name: "MindMapTree",
    emits: ["jointLine", "updateSubtreeRect", "updateRootNode"],
  }
);

export default MindMapTree;
 