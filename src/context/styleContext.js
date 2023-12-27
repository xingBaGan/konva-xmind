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
    },);

    const colors = reactive([
      "#000000",
      "#ffac77",
      "#ff6fca",
      "#ff236a",
      "#37b6fd",
      "#a462d9",
    ]);

    const lineColors = reactive([
      "#ff6fca",
      "#ff236a",
      "#37b6fd",
      "#a462d9",
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