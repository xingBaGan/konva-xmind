
import { defineComponent, computed, reactive, watchEffect, ref } from 'vue';
import MindMapNode, { NodePositionType, type IPoint } from './MindMapNode';

type MindMapNode = {
  title: string,
}

export type RootNode = {
  children: {
    attached: RootNode[];
  },
  title: string,
  x: number,
  y: number,
  rootPos?: IPoint,
  childrenPos?: IPoint[],
  boundaries?: number[],
  childrenRect?: number[],
}
type MindMapTree = {
  rootNode: RootNode,
  sequence: string,
  lineColor?: string,
  lineColorArr?: string[],
  onJointLine?: (position: IPoint) => void,
  id: string,
}

type RootType = {
  getBorderCoordinate: (type: NodePositionType) => IPoint
} | null;

const props = {
  rootNode: {
    type: Object,
    required: true
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
  }
}

const MindMapTree = defineComponent<MindMapTree>((props, {
  emit
}) => {
  const node = props.rootNode;
  const x = node.x;
  const y = node.y;
  const level = computed(() => props.sequence.split('-').length);
  const offsetY = computed(() => Math.max(70 - level.value * 8, 45)).value;
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
  }

  const updateBoundaries = (boundaries: number[]) => {
    node.boundaries = boundaries;
  }

  watchEffect(() => {
    const lastItemIndex = childrenSubTrees.length - 1;
    if (childrenSubTrees[lastItemIndex]) {
      const lastNode = childrenSubTrees[lastItemIndex].value;
      const lastNodePosY = lastNode.rootNode.y;
      const width = lastNode.rootNode.boundaries[2];
      const firstNode = childrenSubTrees[0].value;
      const firstNodePosY = firstNode.rootNode.y;
      const rangeY = lastNodePosY - firstNodePosY;
      node.childrenRect = [ firstNode.rootNode.x, firstNode.rootNode.y, width ,rangeY];

      // send message to brother node
      // console.log('props', props);

    }
  });

  const lines = computed(() => {
    const rootPos = props.rootNode.rootPos;
    return (
      rootPos
      && positionList.length
      && positionList.map((points, index) => {
        const lineColor = props.lineColor || (props.lineColorArr && props.lineColorArr[index]);
        const newStartPoints = {
          x: rootPos.x + 10,
          y: rootPos.y,
        }

        const newEndPoints = {
          x: points.x - 10,
          y: points.y,
        }
        // 笛卡尔坐标系转直角坐标系
        const ratio = -(newEndPoints.y - newStartPoints.y) / (newEndPoints.x - newStartPoints.x);
        const newCurPoint = {
          y: (newEndPoints.y - newStartPoints.y) / 2 + newStartPoints.y,
          x: (newEndPoints.x - newStartPoints.x) / 2 + newStartPoints.x,
        }

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
          >
          </v-line>
        )
      }
      )
    )
  });

  if (!children.length) {
    return () => {
      return (
        <MindMapNode
          text={node.title}
          x={x}
          y={y}
          ref={(el) => {
            const position = el?.getBorderCoordinate(NodePositionType.LEFT);
            emit('jointLine', position, true);
          }}
          sequence={props.sequence}
          onUpdate:boundaries={(boundaries) => {
            updateBoundaries(boundaries)
          }}
          id={props.id}
        />
      )
    }
  }

  const childrenNodes = computed(() => {
    return (children.map((child, index) => {
      const nextRootNode = reactive({
        children: child.children,
        title: child.title,
        x: x + offsetX,
        y: y + (index - halfLength) * offsetY,
      });

      const color = ref(props.lineColor || (props.lineColorArr
        && props.lineColorArr[index]))

      const instance = ref(null);

      watchEffect(() => {
        if (!instance.value || childrenSubTrees.length >= children.length) return;
        // console.log('child', instance);
        childrenSubTrees.push(instance);
      }
      )
      return (
        <MindMapTree
          ref={instance}
          rootNode={
            nextRootNode
          }
          key={child.title}
          onJointLine={addChildPosToSubTree}
          sequence={props.sequence + '-' + (index + 2)}
          lineColor={color.value}
          id={child.id}
        ></MindMapTree>
      )
    }))
  })


  return () => (
    <>
      <MindMapNode
        text={node.title}
        x={x}
        y={y}
        sequence={props.sequence}
        ref={(el) => {
          if (!props.rootNode.rootPos) {
            const rootPos = el?.getBorderCoordinate(NodePositionType.RIGHT);
            props.rootNode.rootPos = {
              ...rootPos
            };
          }
          const position = el?.getBorderCoordinate(NodePositionType.LEFT);
          emit('jointLine', position)
        }}
        onUpdate:boundaries={(boundaries) => {
          updateBoundaries(boundaries)
        }}
        id={props.id}
      />
      {
        childrenNodes.value
      }
      {lines.value}
    </>
  )
},
  {
    props,
    name: 'MindMapTree',
    emits: ['jointLine'],
  }
);

export default MindMapTree;