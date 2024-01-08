import {
  defineComponent,
  computed,
  reactive,
  watchEffect,
  ref,
  type ComponentPublicInstance,
} from "vue";
import MindMapNode, { NodePositionType, type IPoint } from "./MindMapNode";
import useMindTreeStore from "../store/mindTree";
import type { TreeNodeType } from "../store/type";
type MindMapNode = {
  title: string;
};

export type RootNode = {
  children: {
    attached: RootNode[];
  };
  title: string;
  x: number;
  y: number;
  rootPos?: IPoint;
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
};

export interface exposeAttribute {
  updateSubTreeOffset: (val: number) => void;
}

 export type SubTreeType = ComponentPublicInstance<MindMapTree, exposeAttribute>;

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
  subTreeOffset: {
    type: Number,
  }
};

const largeChildrenSize = 5;
const MindMapTree = defineComponent<MindMapTree>(
  (props, { emit, expose }) => {
    const store = useMindTreeStore();
    const node = props.rootNode;
    const x = node.x;
    const y = node.y;
    const level = computed(() => props.sequence.split("-").length);
    const offsetY = computed(() => Math.max(70 - level.value * 8, 45)).value;
    const newY = computed(() => y);
    const offsetX = 200;
    if (!props.rootNode.childrenPos) {
      props.rootNode.childrenPos = [];
    }
    const positionList = props.rootNode.childrenPos;
    const children: any[] = node.children?.attached || [];
    const childrenSubTrees: any[] = reactive([]);

    const halfLength = children.length / 2;
    const addChildPosToSubTree = (position: IPoint) => {
      if (positionList.length >= children.length) return;
      positionList.push(position);
    };

    function updateSubTreeOffset(){
      // 这里调整y 的值？

      
    }
    expose({
      updateSubTreeOffset,
      rootNode: props.rootNode,
    });

    const lines = computed(() => {
      const rootPos = props.rootNode.rootPos;
      return (
        rootPos &&
        positionList.length &&
        positionList.map((points, index) => {
          const lineColor =
            props.lineColor ||
            (props.lineColorArr && props.lineColorArr[index]);
          const newStartPoints = {
            x: rootPos.x + 10,
            y: rootPos.y,
          };

          const newEndPoints = {
            x: points.x - 10,
            y: points.y,
          };
          // 笛卡尔坐标系转直角坐标系
          const ratio =
            -(newEndPoints.y - newStartPoints.y) /
            (newEndPoints.x - newStartPoints.x);
          const newCurPoint = {
            y: (newEndPoints.y - newStartPoints.y) / 2 + newStartPoints.y,
            x: (newEndPoints.x - newStartPoints.x) / 2 + newStartPoints.x,
          };

          const detX = 4;
          const detY = 5;

          if (ratio > 0) {
            newCurPoint.x -= detX;
            newCurPoint.y -= detY;
          }

          if (ratio < 0) {
            newCurPoint.x -= detX;
            newCurPoint.y += detY;
          }

          return (
            <v-line
              points={[
                rootPos.x,
                rootPos.y,
                newStartPoints.x,
                newStartPoints.y,
                newCurPoint.x,
                newCurPoint.y,
                newEndPoints.x,
                newEndPoints.y,
                points.x,
                points.y,
              ]}
              stroke={lineColor}
              strokeWidth={2}
              tension={0.2}
            ></v-line>
          );
        })
      );
    });

    if (!children.length) {
      return () => {
        return (
          <MindMapNode
            text={node.title}
            x={x}
            y={y}
            ref={(el) => {
              if (!el) return;
              store.updateNodeInstance(node.id, el as TreeNodeType);
              const position = (el as TreeNodeType)?.getBorderCoordinate(
                NodePositionType.LEFT
              );
              emit("jointLine", position, true);
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
            x: x + offsetX,
            y: newY.value + (index - halfLength) * offsetY,
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
          ></MindMapTree>
        );
      });
    });

    watchEffect(() => {
      if (
        childrenSubTrees &&
        childrenSubTrees.length === node.children.attached.length
      ) {
        const lastItemIndex = childrenSubTrees.length - 1;
        if (
          childrenSubTrees[lastItemIndex] &&
          children.length > largeChildrenSize
        ) {
          const lastNode = childrenSubTrees[lastItemIndex].value;
          const lastNodePosY = lastNode.rootNode.y;
          const firstNode = childrenSubTrees[0].value;
          const firstNodePosY = firstNode.rootNode.y;
          const rangeY = lastNodePosY - firstNodePosY;
          const width = firstNode.rootNode.x - props.rootNode.x;
          node.childrenRect = [
            firstNode.rootNode.x,
            firstNode.rootNode.y,
            width,
            rangeY,
          ];
          store.updateBrotherPosition(node.id, 1, rangeY);
          // console.log("last", lastNode.rootNode , props.rootNode.title , rangeY);
        }
      }
    });

    return () => (
      <>
        <MindMapNode
          text={node.title}
          x={x}
          y={newY.value}
          sequence={props.sequence}
          ref={(el) => {
            if (!el) return;
            store.updateNodeInstance(node.id, el as TreeNodeType);
            if (!props.rootNode.rootPos) {
              const rootPos = (el as TreeNodeType)?.getBorderCoordinate(
                NodePositionType.RIGHT
              );
              props.rootNode.rootPos = {
                ...rootPos,
              };
            }
            const position = (el as TreeNodeType)?.getBorderCoordinate(
              NodePositionType.LEFT
            );
            emit("jointLine", position);
          }}
          id={props.id}
        />
        {childrenNodes.value}
        {lines.value}
      </>
    );
  },
  {
    props,
    name: "MindMapTree",
    emits: ["jointLine"],
  }
);

export default MindMapTree;
