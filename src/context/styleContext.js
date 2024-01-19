import { ref, defineComponent, h, provide, reactive } from 'vue';
export const configSymbol = Symbol();
export const colorsSymbol = Symbol();
export const lineColorsSymbol = Symbol();

const StyleContext = defineComponent(
  (props, {
    slots
  }) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const config = reactive({
      width,
      height,
      draggable: true,
    },);
    const colorPalette = [
      "#ff6fca",
      "#ff236a",
      "#37b6fd",
      "#a462d9",
      "#93b793",
      "#999999",
      "#669966",
      "#4f4e4e",
      "#005872",
      "#347781",
      "#51959a",
      "#7dab9a",
      "#a0c9a7"
    ];
    const colors = reactive([
      "#000000",
      "#ffac77",
      ...colorPalette,
    ]);

    const lineColors = reactive([
      ...colorPalette
    ]);

    provide(configSymbol, config);
    provide(colorsSymbol, colors);
    provide(lineColorsSymbol, lineColors);
    return () => (
      h('div', slots.default())
    );
  }
);

export default StyleContext;