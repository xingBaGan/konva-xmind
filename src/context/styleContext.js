import { ref, defineComponent, h, provide, reactive } from 'vue';
export const configSymbol = Symbol();
export const colorsSymbol = Symbol();

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

    const colors = reactive(['red', 'blue', 'green']);
    provide(configSymbol, config);
    provide(colorsSymbol, colors);
    return () => (
      h('div', slots.default())
    );
  }
);

export default StyleContext;