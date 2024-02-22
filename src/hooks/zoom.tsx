import { ref } from 'vue';
const maxZoom = 5;
const minZoom = 0.3;
const inc = 0.2;
interface ZoomPoint {
  x: number;
  y: number;
}
/* Zoom the stage at the given position
  Parameters:
   stage: the stage to be zoomed.
   zoomPoint: the (x, y) for centre of zoom.
   zoomBefore: the zoom factor at the start of the process.
   inc : the amount of zoom to apply.
   returns: zoom factor after zoom completed.
*/
function zoomStage(stage: any, zoomPoint: ZoomPoint, zoomBefore: number, inc: number): number {
  let zoomAfter = zoomBefore + inc;
  // remember the scale before new zoom is applied - we are scaling
  // same in x & y so either will work
  return zoomMoveStage(stage, zoomPoint, zoomAfter);
}

function zoomMoveStage(stage: any, zoomPoint: ZoomPoint, zoomAfter: number): number {
  let oldScale = stage.scaleX();
  // compute the distance to the zoom point before applying zoom
  var mousePointTo = {
    x: (zoomPoint.x - stage.x()) / oldScale,
    y: (zoomPoint.y - stage.y()) / oldScale
  };

  // compute new scale
  if (zoomAfter > maxZoom || zoomAfter < minZoom) return;
  // apply new zoom to stage
  stage.scale({ x: zoomAfter, y: zoomAfter });

  // Important - move the stage so that the zoomed point remains
  // visually in place
  var newPos = {
    x: zoomPoint.x - mousePointTo.x * zoomAfter,
    y: zoomPoint.y - mousePointTo.y * zoomAfter
  };


  // Apply position to stage
  stage.position(newPos);

  // return the new zoom factor.
  return zoomAfter;
}

export function useZoomStage() {
  const stageScale = ref(0);

  function addZoom(stageInstance: any): number {
    stageInstance.on('wheel', (e: WheelEvent) => {
      // stop default scrolling
      e.evt.preventDefault();
      // how to scale? Zoom in? Or zoom out?
      let direction = e.evt.deltaY > 0 ? 1 : -1;
      var pointer = stageInstance.getPointerPosition();
      var oldScale = stageInstance.scaleX();

      const value = zoomStage(stageInstance, pointer, oldScale, direction * inc)?.toFixed(1);

      if (value) {
        stageScale.value = value
      }
    });
  }

  return { stageScale, addZoom };
}