import {
  defineComponent,
  computed,
  reactive,
  watchEffect,
  ref,
  watch,
  type ComponentPublicInstance,
  effect,
} from "vue";
import MindMapNode, { NodePositionType, type IPoint, type Rect } from "./MindMapNode";
import { useMindTreeStore } from "../store/mindTree";
import MindMapLines from "./MindMapLines";
import type { TreeNodeType } from "../store/type";
type MindMapNode = {
  title: string;
};


type SubTreeRectPayload = {
  childRect: Rect,
  title: string,
}
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
  }
};

export interface exposeAttribute {
  updateSubTreeOffset: (val: number) => void;
  getRootNodeInstance: () => TreeNodeType
}

export type SubTreeType = ComponentPublicInstance<MindMapTree, exposeAttribute>;

export type ChildPosition = {
  id?: string;
  x: number;
  y: number;
}

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
    const store = useMindTreeStore();
    const node = reactive(props.rootNode);
    const level = computed(() => props.sequence.split("-").length);
    const offsetY = computed(() => Math.max(70 - level.value * 8, 45)).value;
    const offsetX = 200;
    const initialOffset = ref(props.rootNode.y);
    if (!props.rootNode.childrenPos) {
      props.rootNode.childrenPos = reactive([]);
    }
    const positionList: ChildPosition[] = props.rootNode.childrenPos;
    const children: any[] = node.children?.attached || [];
    const childrenSubTrees: any[] = reactive([]);
    const rootInstance = ref();
    const halfLength = Math.floor(children.length / 2);
    const subTreeRect = ref();
    const subChildTreeRect = ref();
    const lastOffset = ref(0);
    const newOffsetY = computed(() => props.rootNode.y + lastOffset.value);
    const addChildPosToSubTree = (position: ChildPosition) => {
      if (positionList.length >= children.length) {
        const index = positionList.findIndex(pos => {
          return pos.id === position.id;
        });
        const isDiff = positionList[index].x !== position.x || positionList[index].y !== position.y;
        if (index !== -1 && isDiff) {
          positionList.splice(index, 1, position)
        }
      } else {
        positionList.push(position);
      }
    };

    function updateSubTreeOffset(val: number) {
      console.log(props.rootNode.title, 'offset:', val, initialOffset.value, props.rootNode.y);
      if (lastOffset.value <= val) {
        lastOffset.value = val * 0.65;
      }
    }

    expose({
      updateSubTreeOffset,
      rootNode: props.rootNode,
      getRootNodeInstance: () => rootInstance.value
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
              })
              emit("jointLine", childPos);
              rootInstance.value = el
            }}
            sequence={props.sequence}
            id={props.id}
          />
        );
      };
    }

    const childrenNodes = computed(() => {
      return children.map((child, index) => {
        const nextRootNode = computed(() =>
          reactive({
            children: child.children,
            title: child.title,
            x: props.rootNode.x + offsetX,
            y: newOffsetY.value + (index - halfLength) * offsetY,
            id: child.id,
          })
        );

        const color = ref(
          props.lineColor || (props.lineColorArr && props.lineColorArr[index])
        );

        const instance = ref(null);

        watchEffect(() => {
          if (instance.value && childrenSubTrees.length < children.length) {
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
              subChildTreeRect.value = payload.childRect
            }}
          ></MindMapTree>
        );
      });
    });

    watchEffect(() => {
      if (subChildTreeRect.value && subTreeRect.value) {
        const rect = getMergedTwoRect(subTreeRect.value, subChildTreeRect.value)
        subTreeRect.value = rect
        emit("updateSubtreeRect", {
          childRect: rect,
          title: props.rootNode.title,
          sub: true,
        });
      }
    })


    watch([subTreeRect], () => {
      // console.log(props.rootNode.title, 'update', subTreeRect.value, props.rootNode.id);

      store.updateBrotherPosition(node.id, 1, subTreeRect.value.height);
    })

    const childrenRects = computed(() =>
      childrenSubTrees.map(subTreeInstance => {
        return subTreeInstance.value.getRootNodeInstance().getRect();
      })
    );

    watch([childrenSubTrees, childrenRects], () => {
      if (
        childrenSubTrees &&
        childrenSubTrees.length === node.children.attached.length
      ) {
        const maxWidth = childrenRects.value.reduce((max, rect: Rect) => {
          if (rect?.width > max) {
            max = rect.width;
          }
          return max;
        }, 0);

        const rects = childrenRects.value;
        const lastItemIndex = rects.length - 1;
        if (
          rects[lastItemIndex]
        ) {
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

          const rect = {
            x: node.childrenRect[0],
            y: node.childrenRect[1],
            width: node.childrenRect[2],
            height: node.childrenRect[3],
          };

          subTreeRect.value = rect;
          emit("updateSubtreeRect", {
            childRect: rect,
            title: props.rootNode.title,
          });
        }
      }
    });
    const isDev = !import.meta.env.PROD;
    const subTreeDebugMessage = computed(() => (`${JSON.stringify(node.childrenRect)} \n ${JSON.stringify(subTreeRect.value)}`));
    const isLinesOver = ref(false);
    const showSubtreeRect = computed(() => (isDev && isLinesOver.value));
    /*
      x: subChildTreeRect.value.x,
      y: subChildTreeRect.value.y,
      width: subChildTreeRect.value.width,
      height: subChildTreeRect.value.height
      */
    const subtreeRectConfig = computed(() => (subTreeRect.value && ({
      points: [
        subTreeRect.value.x,
        subTreeRect.value.y,
        subTreeRect.value.x + subTreeRect.value.width,
        subTreeRect.value.y,
        subTreeRect.value.x + subTreeRect.value.width,
        subTreeRect.value.y + subTreeRect.value.height,
        subTreeRect.value.x,
        subTreeRect.value.y + subTreeRect.value.height,
        subTreeRect.value.x,
        subTreeRect.value.y,
      ],
      dash: [10, 5],
    })));

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
            if (!props.rootNode.rootPos || (props.rootNode.rootPos && rootPos.y !== props.rootNode.rootPos.y)) {
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
            })
            emit("jointLine", childPos);
            rootInstance.value = el
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
            rootPos={props.rootNode.rootPos} positionList={positionList} lineColor={props.lineColor} lineColorArr={props.lineColorArr} />)}
        {isDev && (<v-text x={props.rootNode.x} y={newOffsetY.value + offsetY} text={subTreeDebugMessage.value} />)}
        {
          showSubtreeRect.value &&
          (
            <>
              <v-line config={
                {
                  ...subtreeRectConfig.value,
                  stroke: "red",
                }
              }></v-line>

              <v-text config={{
                x: subTreeRect.value.x,
                y: subTreeRect.value.y,
                text: `(${subTreeRect.value.x}, ${subTreeRect.value.y})\n width: ${subTreeRect.value.width} \n height ${subTreeRect.value.height}`,
                fill: 'grey'
              }
              }>
              </v-text>
            </>
          )
        }
      </>
    );
  },
  {
    props,
    name: "MindMapTree",
    emits: ["jointLine", "updateSubtreeRect"],
  }
);

export default MindMapTree;
