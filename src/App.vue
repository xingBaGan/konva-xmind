<script lang="ts" setup>
import Main from './components/Main.vue'
import styleContext from './context/styleContext'
import globalContext from './context/global'
const props = defineProps(['data']);
</script>

<template>
  <globalContext>
    <styleContext>
      <Main :data="props.data"></Main>
    </styleContext>
  </globalContext>
</template>

<style >
html,
body {
  margin: 0;
  padding: 0;
}
</style>
