
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
}
type MindMapTree = {
  rootNode: RootNode,
  sequence: string,
  lineColor?: string,
  lineColorArr?: string[],
  onJointLine?: (position: IPoint) => void,
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
  }
}

const MindMapTree = defineComponent<MindMapTree>((props, {
  emit
}) => {
  const node = props.rootNode;
  const x = node.x;
  const y = node.y;
  const offsetY = 70;
  const offsetX = 200;
  if (!props.rootNode.childrenPos) {
    props.rootNode.childrenPos = [];
  }
  const positionList = props.rootNode.childrenPos;
  const children = node.children?.attached || [];
  const halfLength = children.length / 2;
  const addChildPosToSubTree = (position: IPoint) => {
    if (positionList.length >= children.length) return;
    positionList.push(position);
  }

  const lines = computed(() => {
    const rootPos = props.rootNode.rootPos;
    return (
      rootPos
      && positionList.length
      && positionList.map((points, index) => {
        const lineColor = props.lineColor || (props.lineColorArr && props.lineColorArr[index]);
        return (
          <v-line
            points={[
              rootPos.x,
              rootPos.y,
              points.x,
              points.y,
            ]}
            stroke={lineColor}
            strokeWidth={2} >
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
        />
      )
    }
  }

  const doms = computed(() => {
    return (children.map((child, index) => {
      const nextRootNode = reactive({
        children: child.children,
        title: child.title,
        x: x + offsetX,
        y: y + (index - halfLength) * offsetY,
      });

      const color = ref(props.lineColor || (props.lineColorArr
        && props.lineColorArr[index]))
      return (
        <MindMapTree
          rootNode={
            nextRootNode
          }
          key={child.title}
          onJointLine={addChildPosToSubTree}
          sequence={props.sequence + '-' + (index + 2)}
          lineColor={color.value}
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
      />
      {
        doms.value
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