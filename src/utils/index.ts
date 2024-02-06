import type { SubTreeType } from "../store/type";
import { type Rect } from '../components/MindMapNode';

function getOffsetYWhenInRange(siblingNode: SubTreeType, range: Rect ): number {
  const currentRect = siblingNode.childrenSubtreeRectArea;

  let offsetY = 0;
  if( range && currentRect && currentRect.y < range.y + range.height ) {
    offsetY = range.y + range.height - currentRect.y;
  }
  return offsetY;
}

export function adjustSiblingChild(currentNode: SubTreeType, siblingNode: SubTreeType) {
  const offsetY =  getOffsetYWhenInRange(siblingNode, currentNode.childrenSubtreeRectArea);
  // console.log('siblingNode', siblingNode, offsetY);
  siblingNode.updateSubTreeOffset(offsetY);
}
