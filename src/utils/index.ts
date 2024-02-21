import type { SubTreeType } from "../store/type";
import { type Rect } from '../components/MindMapNode';

function getOffsetYWhenInRange(topRect: Rect, bottomRect: Rect,): number {
  let offsetY = 0;
  if (topRect && bottomRect && bottomRect.y < topRect.y + topRect.height) {
    offsetY = topRect.y + topRect.height - bottomRect.y;
  }
  return offsetY;
}

export async function adjustSiblingChild(currentNode: SubTreeType, siblingNode: SubTreeType, restArr: Array<SubTreeType>) {
  if (!(currentNode && siblingNode && currentNode.rootNode && siblingNode.rootNode)) return;
  const topRect = currentNode.childrenSubtreeRectArea;
  const bottomRect = siblingNode.childrenSubtreeRectArea;
  const offsetY = getOffsetYWhenInRange(topRect, bottomRect);  
  if(offsetY > 0) {
    for (let index = 0; index < restArr.length; index++) {
      const element = restArr[index];
      element.updateSubTreeOffset && element.updateSubTreeOffset(offsetY);
    }
  }
}
