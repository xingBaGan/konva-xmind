<script lang="ts" setup>
import Main from './view/main.vue'
import styleContext from './context/styleContext'
import globalContext from './context/global'
const props = defineProps(['data']);
</script>

<template>
  <globalContext>
    <styleContext>
      <Main :f="props.data"></Main>
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
