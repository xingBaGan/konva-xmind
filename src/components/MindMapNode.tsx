import { reactive, defineComponent, inject, computed, ref, watchEffect } from "vue";
import { colorsSymbol } from "../context/styleContext";
import { lighten } from "polished";
type MindMapNode = {
  text?: string;
  x?: number;
  y?: number;
  nodeColor?: string;
  textColor?: string;
  children?: MindMapNode[];
  sequence: string;
  id: string;
};

export interface exposeAttribute {
  getBorderCoordinate: (type: NodePositionType)=> IPoint;
  text: string;
}

function getTextWidth(text: string, font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;
  const metrics = context.measureText(text);
  const actual =
    Math.abs(metrics.actualBoundingBoxLeft) +
    Math.abs(metrics.actualBoundingBoxRight);
  return Math.max(metrics.width, actual);
}

function getTextHeight(font: string) {
  const text = "A"; // A single character to measure the height
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
}

const minNodeWidth = 70;
const minNodeHeight = 40;

const props = {
  text: {
    type: String,
    required: false,
  },
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  nodeColor: {
    type: String,
  },
  textColor: {
    type: String,
  },
  sequence: {
    type: String,
  },
  id: {
    type: String,
  },
};

export interface IPoint {
  x: number;
  y: number;
}

export enum NodePositionType {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  CENTER,
}

export default defineComponent<MindMapNode>(
  (props, { expose, emit }) => {
    const nodeX = props.x || 0;
    const nodeY = props.y || 0;
    const colorArr: string[] = inject(colorsSymbol) || [];
    const nodePadding = 5;
    const fontFamily = "Arial";
    const nodeHeight = minNodeHeight;
    const initialFontSize = 18;
    const level = computed(() => props.sequence.split("-").length);
    const fontSize = computed(() => initialFontSize - level.value).value;
    const fontSizeAndFamily = `${fontSize}px ${fontFamily}`;
    const content = props.text || "";
    const fontHeight = getTextHeight(fontSizeAndFamily);
    const textTopOffset = (nodeHeight - (fontHeight + nodePadding * 2)) / 2;
    const contentLength = getTextWidth(content, fontSizeAndFamily);
    const nodeWidth = Math.max(minNodeWidth, contentLength + nodePadding * 2);
    const textLeftOffset = (nodeWidth - (contentLength + nodePadding * 2)) / 2;
    const splitArr = props.sequence.split("-");
    let nodeColor;
    const mainColorIndex: number = Number(splitArr[1]);
    if (splitArr.length == 1) {
      nodeColor = colorArr[0];
    } else if (splitArr.length == 2) {
      nodeColor = colorArr[mainColorIndex];
    } else {
      nodeColor = lighten(0.15, colorArr[mainColorIndex]);
    }

    const nodeStyle = {
      fill: nodeColor || props.nodeColor || "#000229",
      stroke: "black",
      strokeWidth: 0,
      cornerRadius: 6,
    };

    const textStyle = {
      fill: props.textColor || "white",
      lineHeight: 1,
      padding: nodePadding,
      align: "center",
    };

    const rect = reactive({
      x: nodeX,
      y: nodeY,
      width: nodeWidth,
      height: nodeHeight,
      ...nodeStyle,
    });

    const text = reactive({
      x: nodeX + textLeftOffset,
      y: nodeY + textTopOffset,
      text: content,
      fontSize: fontSize,
      fontFamily,
      ...textStyle,
    });

    const getBorderCoordinate = (type: NodePositionType): IPoint => {
      switch (type) {
        case NodePositionType.TOP_LEFT:
          return {
            x: nodeX,
            y: nodeY,
          };
        case NodePositionType.TOP_RIGHT:
          return {
            x: nodeX + nodeWidth,
            y: nodeY,
          };
        case NodePositionType.BOTTOM_LEFT:
          return {
            x: nodeX,
            y: nodeY + nodeHeight,
          };
        case NodePositionType.BOTTOM_RIGHT:
          return {
            x: nodeX + nodeWidth,
            y: nodeY + nodeHeight,
          };
        case NodePositionType.TOP:
          return {
            x: nodeX + nodeWidth / 2,
            y: nodeY,
          };
        case NodePositionType.LEFT:
          return {
            x: nodeX,
            y: nodeY + nodeHeight / 2,
          };
        case NodePositionType.RIGHT:
          return {
            x: nodeX + nodeWidth,
            y: nodeY + nodeHeight / 2,
          };
        case NodePositionType.BOTTOM:
          return {
            x: nodeX + nodeWidth / 2,
            y: nodeY + nodeHeight,
          };
        default:
          return {
            x: nodeX + nodeWidth,
            y: nodeY + nodeHeight,
          };
      }
    };

    expose({
      getBorderCoordinate,
      text: props.text,
    });

    return () => (
      <v-group>
        <v-rect config={rect}></v-rect>
        <v-text config={text}></v-text>
      </v-group>
    );
  },
  {
    props,
    name: "MindMapNode",
  }
);
