import { ref, defineComponent, computed, watchEffect, defineEmits } from 'vue';

const RecursionCompoent = defineComponent((props, {
  expose,
  emit,
}) => {
  const n = props.n;

  let val1 = ref(0);
  let val2 = ref(0);
  const sum = computed(() => {
    if (n === 0 ) {
      return 0;
    }

    if (n === 1) {
      return 1;
    }

    return val1.value + val2.value;
  });

  if (n === 0 || n === 1) {
    if(n === 0) {
      emit('update:val', 0);
    } else if(n === 1) {
      emit('update:val', 1);
    } else {
      emit('update:val', val1.value + val2.value );
    }
    return () => (<span> {n} </span>);
  }

  watchEffect(() => {
    console.log('see change', val1.value, val2.value);
    emit('update:val', val1.value +  val2.value);
  });


  function updateVal1(val) {
    val1.value = val;
    console.log('val1', val);
  }

  function updateVal2(val) {
    val2.value = val;
    console.log('val2', val);
  }

  return () => (
    <>
      <span className='val'>
        {n}
      </span>
      <details>
        <summary>sum: {sum.value}</summary>
        <RecursionCompoent n={n - 1}
          onUpdate:val={updateVal1}
        />
        <RecursionCompoent n={n - 2}
          onUpdate:val={updateVal2}
        />
      </details>
    </>
  );

}, {
  props: {
    n: Number,
  }
});

export default RecursionCompoent;

