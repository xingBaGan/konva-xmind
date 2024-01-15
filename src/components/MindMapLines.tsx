import { defineComponent, reactive } from "vue";
import type { RootNode, ChildPosition } from './MindMapSubTree'
interface MindMapLine {
  rootPos: RootNode['rootPos'],
  positionList: ChildPosition[],
  lineColor?: string,
  lineColorArr?: string[],
}

const props = {
  rootPos: {
    type: Object,
    required: true,
  },
  positionList: {
    type: Object,
  },
  lineColor: {
    type: String,
  },
  lineColorArr: {
    type: Array,
  }
};

export default defineComponent<MindMapLine>((props) => {
  return () => (
    props.rootPos &&
    props.positionList.length &&
    props.positionList.map((points, index) => {
      const lineColor =
        props.lineColor ||
        (props.lineColorArr && props.lineColorArr[index]);
      const newStartPoints = {
        x: props.rootPos.x + 10,
        y: props.rootPos.y,
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

      const config = reactive({
        points: [
          props.rootPos.x,
          props.rootPos.y,
          newStartPoints.x,
          newStartPoints.y,
          newCurPoint.x,
          newCurPoint.y,
          newEndPoints.x,
          newEndPoints.y,
          points.x,
          points.y,
        ],
        stroke: lineColor,
        strokeWidth: 2,
        tension: 0.2,
      });

      return (
        <v-line
          config={config}
        ></v-line>
      );
    })
  );
},
  {
    props,
    name: "MindMapLines",
  })