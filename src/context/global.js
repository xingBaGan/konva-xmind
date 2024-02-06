import { ref, defineComponent, h, provide, reactive } from 'vue';
export const showChildrenSymbol = Symbol();


const GlobalContext = defineComponent(
  (props, {
    slots
  }) => {
    const showChild = ref(false);
    provide(showChildrenSymbol, showChild);
    return () => (
      h('div', slots.default())
    );
  }
);

export default GlobalContext;