import { reactive, type FunctionalComponent, defineExpose } from 'vue'
type MindMapNode = {
  text?: string,
  x?: number,
  y?: number,
  nodeColor?: string,
  textColor?: string,
}

function getTextWidth(text: string, font: string) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  const metrics = context.measureText(text);
  const actual = Math.abs(metrics.actualBoundingBoxLeft) + Math.abs(metrics.actualBoundingBoxRight);
  return Math.max(metrics.width, actual);
}

function getTextHeight(font: string) {
  const text = "A"; // A single character to measure the height
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
}

const minNodeWidth = 100;
const minNodeHeight = 50;
const MindMapNode: FunctionalComponent<MindMapNode> = (
  props,
  context
) => {
  const nodeX = props.x || 0;
  const nodeY = props.y || 0;

  const nodePadding = 5;
  const fontFamily = 'Arial'
  const nodeHeight = minNodeHeight;
  const fontSize = 18;
  const fontSizeAndFamily = `${fontSize}px ${fontFamily}`;
  const content = props.text || '';
  const fontHeight = getTextHeight(fontSizeAndFamily);
  const textTopOffset = (nodeHeight - (fontHeight + nodePadding * 2)) / 2;
  const contentLength = getTextWidth(content, fontSizeAndFamily);
  const nodeWidth = Math.max(minNodeWidth, (contentLength + nodePadding * 2));
  const textLeftOffset = (nodeWidth - (contentLength + nodePadding * 2)) / 2;

  const nodeStyle = {
    fill: props.nodeColor || '#000229',
    stroke: 'black',
    strokeWidth: 0,
    cornerRadius: 6,
  };

  const textStyle = {
    fill: props.textColor || 'white',
    lineHeight: 1,
    padding: nodePadding,
    align: 'center'
  };

  const rect = reactive({
    x: nodeX,
    y: nodeY,
    width: nodeWidth,
    height: nodeHeight,
    ...nodeStyle
  });

  const text = reactive({
    x: nodeX + textLeftOffset,
    y: nodeY + textTopOffset,
    text: content,
    fontSize: fontSize,
    fontFamily,
    ...textStyle,
  });

  const getBorderCoordinate = () => {
    return {
      x: nodeX,
      y: nodeY,
    }
  }


  return (
    <v-group>
      <v-rect config={rect}></v-rect>
      <v-text config={text}></v-text>
    </v-group>
  )
}

MindMapNode.props = {
  text: {
    type: String,
    required: false
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
  }
}

export default MindMapNode;
