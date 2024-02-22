import Konva from 'konva';
export function addGrid(stage: any) {
  const layer = new Konva.Layer();
  stage.add(layer);
  const gap = 10;
  // 创建网格线
  for (let i = 0; i < stage.width(); i += gap) {
    const horizontalLine = new Konva.Line({
      points: [0, i, stage.width(), i],
      stroke: '#ddd',
      strokeWidth: 1,
    });

    const verticalLine = new Konva.Line({
      points: [i, 0, i, stage.height()],
      stroke: '#ddd',
      strokeWidth: 1,
    });

    layer.add(horizontalLine, verticalLine);
  }

  const pointHeight = 10;
  for (let i = 0; i < stage.width(); i += gap * 10) {
    const horizontalLine = new Konva.Line({
      points: [0, i, -pointHeight, i],
      stroke: '#000',
      strokeWidth: 1,
    });

    const verticalLine = new Konva.Line({
      points: [i, 0, i, -pointHeight],
      stroke: '#000',
      strokeWidth: 1,
    });

    const TextY = new Konva.Text({
      text: String(i),
      x: -pointHeight - 20,
      y: i - 10,
    })

    const TextX = new Konva.Text({
      text: String(i),
      x: i,
      y: -pointHeight - 10,
    })

    layer.add(horizontalLine);
    layer.add(verticalLine);
    layer.add(TextY);
    layer.add(TextX);
  }

  layer.add();
}