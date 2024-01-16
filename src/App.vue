<script lang="ts" setup>
import Main from './components/Main.vue'
import styleContext from './context/styleContext'
const props = defineProps(['data']);
</script>

<template>
  <styleContext>
    <Main :data="props.data"></Main>
  </styleContext>
</template>

<style >
  html, body {
    margin: 0;
    padding: 0;
  }
</style>
